import requests
import json
import unicodedata
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import StreamingHttpResponse
from .models import *
from django.contrib.auth.hashers import make_password, check_password

modes = {
    "basic": """You are a friendly dating advisor who provides balanced, thoughtful advice. 
                You help users navigate relationships and dating scenarios with practical suggestions.
                Keep responses supportive, non-judgmental, and concise.""",
    "expert": """You are a professional dating and relationship coach with years of experience.
                Provide nuanced, evidence-based advice on complex dating situations.
                Assume the user has some experience with relationships but needs strategic guidance.
                Focus on psychology of attraction, communication techniques, and relationship dynamics.""",
    "alpha": """You are Wingman, a confident dating assistant focused on helping users succeed on dating apps.
                Be direct, slightly edgy, and results-oriented in your advice.
                Feel free to discuss intimate topics openly when appropriate.
                Use humor and playful banter to keep conversations engaging.
                When responding to Tinder messages, provide multiple reply options that are witty and attention-grabbing.
                Avoid generic advice - give specific, actionable suggestions tailored to the situation.""",
    "none": """You are a helpful dating assistant who provides guidance based on the user's specific situation.
               Balance honesty with tact, and prioritize advice that leads to healthy connections.""",
}

orientations = {
    "hetero": """User is interested in dating people of the opposite gender. Tailor examples and advice accordingly.""",
    "homo": """User is interested in dating people of the same gender. Tailor examples and advice accordingly.""",
    "pan": """User is pansexual and may be interested in people regardless of gender. Provide inclusive advice.""",
    "aseks": """User is asexual. Focus on romantic connection advice rather than physical attraction.""",
    "bi": """User is interested in dating people of multiple genders. Provide advice applicable to diverse dating scenarios.""",
}


@api_view(["POST"])
def generate_response(request):
    prompt = request.data.get("prompt", "")
    user_id = request.data.get("user_id")
    chat_id = request.data.get("chat_id")  # Get chat_id from request
    mode = request.data.get("mode", "none")
    orientation_choice = request.data.get("orientation", "hetero")
    # Get the isContextActive parameter with default False
    is_context_active = request.data.get("isContextActive", False)

    if not prompt:
        return Response({"error": "Prompt is required"}, status=400)
    if not user_id:
        return Response({"error": "User ID is required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # Get or create chat window for this user
    try:
        # If chat_id is provided, use that specific chat window
        if chat_id:
            chat_window = LlamaChatWindow.objects.get(id=chat_id, user=user)
        else:
            # If no chat_id provided, get the most recent chat window or create a new one
            chat_window = (
                LlamaChatWindow.objects.filter(user=user)
                .order_by("-created_at")
                .first()
            )
            if not chat_window:
                chat_window = LlamaChatWindow.objects.create(user=user)
    except LlamaChatWindow.DoesNotExist:
        return Response({"error": "Chat window not found"}, status=404)

    stream_response = request.data.get("stream", True)

    system = modes["none"]
    match mode:
        case "basic":
            system = modes["basic"]
        case "expert":
            system = modes["expert"]
        case "alpha":
            system = modes["alpha"]
        case "none":
            system = modes["none"]
        case _:
            system = modes["none"]

    orientation = orientations["hetero"]  # Default value
    match orientation_choice:  # Use orientation_choice here instead of orientations
        case "hetero":
            orientation = orientations["hetero"]
        case "homo":
            orientation = orientations["homo"]
        case "pan":
            orientation = orientations["pan"]
        case "aseks":
            orientation = orientations["aseks"]
        case "bi":
            orientation = orientations["bi"]
        case _:
            orientation = orientations["hetero"]

    # According to Ollama API docs, context is an array of numbers returned from a previous
    # request that encodes the model's state. We need to store this and retrieve it.
    context = None

    # If context is active and chat_id is provided, try to find the last context for this chat
    if is_context_active and chat_id:
        try:
            # Try to get the most recent saved context for this chat window
            latest_context = (
                ChatContext.objects.filter(chat_window_id=chat_id)
                .order_by("-created_at")
                .first()
            )

            if latest_context:
                # Load the stored context
                context = latest_context.context_data
        except Exception as e:
            print(f"Error retrieving context: {str(e)}")
            # Continue without context if there's an error

    # Ollama expects different format depending on the model
    payload = {
        "model": "gemma3:4b-it-q4_K_M",
        "prompt": prompt,
        "system": system + orientation,
        "stream": stream_response,
        "options": {"temperature": 0.9, "num_gpu": 1, "low_vram": True},
    }

    # Only add context if we have one
    if context:
        payload["context"] = context

    try:
        if not stream_response:
            # Non-streaming request
            response = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                timeout=100,
            )
            response.raise_for_status()

            data = response.json()
            response_text = data.get("response", "")

            # Get the new context returned by Ollama
            new_context = data.get("context")

            # Create the LlamaResponse and add it to the chat window
            llama_response = LlamaResponse.objects.create(
                prompt=prompt, response=response_text, user=user
            )
            chat_window.responses.add(llama_response)

            # If we got a context back and context is active, store it
            if is_context_active and new_context and chat_id:
                ChatContext.objects.create(
                    chat_window_id=chat_id, context_data=new_context
                )

            return Response({"response": response_text, "user_id": user.id})
        else:
            # Streaming request
            def event_stream():
                full_response = ""
                final_context = None

                try:
                    with requests.post(
                        "http://localhost:11434/api/generate",
                        json=payload,
                        stream=True,
                        timeout=100,
                    ) as r:
                        if not r.ok:
                            error_text = r.text
                            print(
                                f"Ollama error: Status {r.status_code}, Response: {error_text}"
                            )
                            yield f"data: {json.dumps({'error': f'Ollama error: {r.status_code} - {error_text}', 'done': True})}\n\n"
                            return

                        r.raise_for_status()
                        for line in r.iter_lines():
                            if line:
                                try:
                                    chunk = json.loads(line)
                                    response_chunk = chunk.get("response", "")
                                    full_response += response_chunk

                                    # Check if this chunk includes context
                                    if chunk.get("context"):
                                        final_context = chunk.get("context")

                                    yield f"data: {json.dumps({'chunk': response_chunk, 'done': chunk.get('done', False)})}\n\n"

                                    if chunk.get("done", False):
                                        # Create the LlamaResponse and add it to the chat window
                                        llama_response = LlamaResponse.objects.create(
                                            prompt=prompt,
                                            response=full_response,
                                            user=user,
                                        )
                                        chat_window.responses.add(llama_response)

                                        # If we got a context back and context is active, store it
                                        if (
                                            is_context_active
                                            and final_context
                                            and chat_id
                                        ):
                                            ChatContext.objects.create(
                                                chat_window_id=chat_id,
                                                context_data=final_context,
                                            )
                                except json.JSONDecodeError as e:
                                    print(
                                        f"Error decoding JSON: {str(e)} for line: {line}"
                                    )
                                    # Don't break the stream for a single error
                                    continue
                except Exception as e:
                    error_msg = str(e)
                    print(f"Stream error: {error_msg}")
                    yield f"data: {json.dumps({'error': error_msg, 'done': True})}\n\n"

            response = StreamingHttpResponse(
                event_stream(), content_type="text/event-stream"
            )
            response["Cache-Control"] = "no-cache"
            response["X-Accel-Buffering"] = "no"
            return response

    except requests.exceptions.HTTPError as e:
        return Response(
            {"error": f"HTTP error: {str(e)} - {e.response.text}"},
            status=e.response.status_code,
        )
    except requests.exceptions.ConnectionError:
        return Response(
            {"error": "Could not connect to Ollama server. Is it running?"}, status=503
        )
    except requests.exceptions.Timeout:
        return Response(
            {"error": "Request to Ollama timed out. Try again or increase timeout."},
            status=504,
        )
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Failed to connect to Ollama: {str(e)}"}, status=500)
    except Exception as e:
        return Response({"error": f"Unexpected error: {str(e)}"}, status=500)


@api_view(["GET"])
def get_responses(request):
    user_id = request.query_params.get("user_id")

    if not user_id:
        return Response({"error": "User ID is required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    responses = LlamaResponse.objects.filter(user=user).order_by("-created_at")

    data = [
        {
            "id": response.id,
            "prompt": response.prompt,
            "response": response.response,
            "created_at": response.created_at,
            "user_id": response.user.id,
        }
        for response in responses
    ]
    return Response(data)


@api_view(["POST"])
def create_user(request):
    name = request.data.get("name", "")
    email = request.data.get("email", "")
    sex = request.data.get("sex", "")
    age = request.data.get("age", "")
    password = request.data.get("password", "")
    if not all([name, email, sex, age, password]):
        return Response({"error": "All fields are required"}, status=400)
    try:
        # Check if user with this email already exists
        if WingmanUsers.objects.filter(email=email).exists():
            return Response(
                {"error": "User with this email already exists"}, status=400
            )

        # Hash the password before storing
        hashed_password = make_password(password)

        user = WingmanUsers.objects.create(
            name=name, email=email, sex=sex, age=int(age), password=hashed_password
        )

        # Return complete user data, ensuring ID is included
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "sex": user.sex,
            "age": user.age,
            "orientation": user.orientation,  # Include orientation field
            "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        return Response(user_data, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
def get_user(request):
    """Get user by ID"""
    user_id = request.query_params.get("user_id")
    if not user_id:
        return Response({"error": "User ID is required"}, status=400)
    try:
        user = WingmanUsers.objects.get(id=user_id)
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "sex": user.sex,
        "age": user.age,
        "orientation": user.orientation,
        "password": user.password,
        "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    }
    return Response(user_data)


@api_view(["POST"])
def login_user(request):
    """Authenticate a user by email and password"""
    email = request.data.get("email", "")
    password = request.data.get("password", "")

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=400)

    try:
        user = WingmanUsers.objects.get(email=email)

        # Check if the provided password matches the stored hash
        if check_password(password, user.password):
            user_data = {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "sex": user.sex,
                "age": user.age,
                "orientation": user.orientation,  # Include orientation
                "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            print(f"Login successful for user: {user.email}")
            return Response(user_data)
        else:
            print(f"Invalid password for user: {user.email}")
            return Response({"error": "Invalid credentials"}, status=401)

    except WingmanUsers.DoesNotExist:
        print(f"Login attempt for non-existent email: {email}")
        return Response({"error": "Invalid credentials"}, status=401)
    except Exception as e:
        print(f"Login error: {str(e)}")
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def love_calculator(request):
    name1 = request.data.get("name1", "")
    name2 = request.data.get("name2", "")

    if not all([name1, name2]):
        return Response({"error": "Both names are required"}, status=400)

    try:
        # Better love calculator algorithm that supports Unicode characters
        def is_letter(char):
            # Check if character is a letter in any language
            return unicodedata.category(char).startswith("L")

        def get_letter_value(char):
            # Normalize to NFD to handle diacritics
            normalized = unicodedata.normalize("NFD", char)
            # Get base character (without diacritics)
            base_char = "".join(c for c in normalized if not unicodedata.combining(c))

            # Special value for non-ASCII letters
            if ord(base_char.lower()) > 127:  # Non-ASCII
                # Use mod 26 to get values between 1-26
                return (ord(base_char.lower()) % 26) + 1
            else:
                # ASCII letters a-z
                return (ord(base_char.lower()) - 96) % 26 + 1

        love_score = 0

        # Process both names
        for name in [name1, name2]:
            # Check if name contains only letter characters
            if not all(is_letter(c) or c.isspace() for c in name):
                return Response(
                    {"error": "Names must contain only letters and spaces"}, status=400
                )

            # Calculate score using letters only
            for c in name:
                if is_letter(c):  # Skip spaces
                    love_score += get_letter_value(c)

        # Ensure score is between 0-100
        love_score = (love_score * 7) % 101  # More random distribution

        # Generate a message based on the score from ollama
        payload = {
            "model": "gemma3:4b-it-q4_K_M",
            "prompt": f"Generate a message about their relationship based on the love score {love_score}.",
            "system": """
                    You are a love calculator. 
                    Assume the score is between 0 and 100.
                    The mesage should be based on the score.
                    Don't use any boilerplate text, just the message.
                    Don't use any emojis.
                    Don't use any special characters.
                    Use jock-like slang.
                    Tell the user if he should go for it or not.
                    If their score is low, tell them to move on and not waste their time.
                    If their score is high, tell them to go for it.
                    The message should be around 80 words.
                 """
            + f"The Name of the user is {name1} and the name of the love interest is {name2}."
            + f"Use the score {love_score}% in the message.",
            "temperature": 0.9,
            "stream": False,
            "context": [],
        }
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=100,
        )
        response.raise_for_status()
        data = response.json()
        message = data.get("response", "")

    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=500)

    return Response({"love_score": love_score, "message": message})


@api_view(["GET"])
def get_chat_history(request):
    user_id = request.query_params.get("user_id")
    chat_id = request.query_params.get("chat_id")  # Get chat_id from request
    if not user_id:
        return Response({"error": "User ID is required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)

        # If chat_id is provided, get that specific chat window
        if chat_id:
            try:
                chat = LlamaChatWindow.objects.get(id=chat_id, user=user)
            except LlamaChatWindow.DoesNotExist:
                return Response({"error": "Chat window not found"}, status=404)
        else:
            # Otherwise get the most recent chat
            chat = (
                LlamaChatWindow.objects.filter(user=user)
                .order_by("-created_at")
                .first()
            )

        if not chat:
            return Response({"error": "No chat history found"}, status=404)

        responses = chat.responses.all().order_by("-created_at")
        data = [
            {
                "id": response.id,
                "prompt": response.prompt,
                "response": response.response,
                "created_at": response.created_at,
            }
            for response in responses
        ]
        return Response(data)
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response(
            {"error": f"Failed to retrieve chat history: {str(e)}"}, status=500
        )


@api_view(["POST"])
def create_chat_window(request):
    user_id = request.data.get("user_id")
    if not user_id:
        return Response({"error": "User ID is required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)
        chat_window = LlamaChatWindow.objects.create(user=user)

        return Response(
            {
                "id": chat_window.id,
                "user_id": user.id,
                "created_at": chat_window.created_at,
                "message": "Chat window created successfully",
            },
            status=201,
        )
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response(
            {"error": f"Failed to create chat window: {str(e)}"}, status=500
        )


@api_view(["DELETE"])
def delete_chat_window(request, chat_id):
    user_id = request.query_params.get("user_id")
    if not user_id:
        return Response({"error": "User ID is required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)
        chat_window = LlamaChatWindow.objects.get(id=chat_id, user=user)

        # Delete the chat window
        chat_window.delete()

        return Response({"message": "Chat window deleted successfully"}, status=200)
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except LlamaChatWindow.DoesNotExist:
        return Response({"error": "Chat window not found"}, status=404)
    except Exception as e:
        return Response(
            {"error": f"Failed to delete chat window: {str(e)}"}, status=500
        )


@api_view(["GET"])
def get_all_chat_windows(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        return Response({"error": "User ID is required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)
        chat_windows = LlamaChatWindow.objects.filter(user=user).order_by("-created_at")

        result = []
        for chat in chat_windows:
            latest_responses = chat.responses.all().order_by("-created_at")[
                :5
            ]  # Get last 5 responses
            result.append(
                {
                    "id": chat.id,
                    "created_at": chat.created_at,
                    "responses": [
                        {
                            "id": response.id,
                            "prompt": response.prompt,
                            "response": response.response,
                            "created_at": response.created_at,
                        }
                        for response in latest_responses
                    ],
                }
            )

        return Response(result)
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response(
            {"error": f"Failed to retrieve chat windows: {str(e)}"}, status=500
        )


@api_view(["POST"])
def tinder_replies(request):
    """Generate multiple reply options for a Tinder message"""
    message = request.data.get("message", "")
    intention = request.data.get("intention", "date")
    style = request.data.get("style", "flirty")
    user_id = request.data.get("user_id")

    if not message:
        return Response({"error": "Message is required"}, status=400)
    if not user_id:
        return Response({"error": "User ID is required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    stream_response = request.data.get("stream", True)

    # Create the system prompt based on intention and style
    system_prompt = f"""
    You are a dating app reply generator.
    You help users respond to messages they received on Tinder.
    
    The user will provide a message they received on Tinder, and you'll generate 5 reply options.
    
    USER INTENTION: {intention}
    RESPONSE STYLE: {style}
    
    FORMAT INSTRUCTIONS:
    - Generate exactly 5 distinct reply options
    - Number each reply option from 1 to 5 (with a period after the number)
    - Each reply should be clear and concise (1-3 sentences)
    - Each reply should match the specified style and help achieve the user's intention
    - DO NOT include explanations or meta-commentary
    - DO NOT use placeholder text like [Name]
    - Be authentic and creative
    - ONLY respond with the 5 numbered reply options
    
    EXAMPLE OUTPUT FORMAT:
    1. First reply text here
    2. Second reply text here
    3. Third reply text here
    4. Fourth reply text here
    5. Fifth reply text here
    """

    payload = {
        "model": "gemma3:4b-it-q4_K_M",
        "prompt": f'This is the message I received on Tinder: "{message}"\n\nPlease generate 5 reply options following the format instructions.',
        "system": system_prompt,
        "stream": stream_response,
        "options": {"temperature": 0.9, "num_gpu": 1, "low_vram": True},
    }

    try:
        if not stream_response:
            # Non-streaming request
            response = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                timeout=100,
            )
            response.raise_for_status()

            data = response.json()
            response_text = data.get("response", "")

            # Log this interaction
            LlamaResponse.objects.create(
                prompt=f"Tinder Reply: {message}", response=response_text, user=user
            )

            return Response({"response": response_text})
        else:
            # Streaming request
            def event_stream():
                full_response = ""

                try:
                    with requests.post(
                        "http://localhost:11434/api/generate",
                        json=payload,
                        stream=True,
                        timeout=100,
                    ) as r:
                        if not r.ok:
                            error_text = r.text
                            print(
                                f"Ollama error: Status {r.status_code}, Response: {error_text}"
                            )
                            yield f"data: {json.dumps({'error': f'Ollama error: {r.status_code} - {error_text}', 'done': True})}\n\n"
                            return

                        r.raise_for_status()
                        for line in r.iter_lines():
                            if line:
                                try:
                                    chunk = json.loads(line)
                                    response_chunk = chunk.get("response", "")
                                    full_response += response_chunk

                                    yield f"data: {json.dumps({'chunk': response_chunk, 'done': chunk.get('done', False)})}\n\n"

                                    if chunk.get("done", False):
                                        # Process the full response to ensure proper formatting if needed
                                        processed_response = full_response

                                        # Log this interaction once complete
                                        LlamaResponse.objects.create(
                                            prompt=f"Tinder Reply: {message}",
                                            response=processed_response,
                                            user=user,
                                        )
                                except json.JSONDecodeError as e:
                                    print(
                                        f"Error decoding JSON: {str(e)} for line: {line}"
                                    )
                                    continue
                except Exception as e:
                    error_msg = str(e)
                    print(f"Stream error: {error_msg}")
                    yield f"data: {json.dumps({'error': error_msg, 'done': True})}\n\n"

            response = StreamingHttpResponse(
                event_stream(), content_type="text/event-stream"
            )
            response["Cache-Control"] = "no-cache"
            response["X-Accel-Buffering"] = "no"
            return response

    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=500)


@api_view(["POST", "PUT"])
def tinder_description(request):
    """Generate or update a Tinder profile description"""
    user_id = request.data.get("user_id")
    user_basics = request.data.get("user_basics", {})
    options = request.data.get("options", {})
    current_description = request.data.get("current_description", "")
    adjustments = request.data.get("adjustments", "")  # Get adjustments from request

    if not user_id:
        return Response({"error": "User ID is required"}, status=400)
    if not user_basics.get("age") or not user_basics.get("occupation"):
        return Response({"error": "Age and occupation are required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)
    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # Extract user basics
    age = user_basics.get("age", "")
    occupation = user_basics.get("occupation", "")
    interests = user_basics.get("interests", "")

    # Extract options
    tone = options.get("tone", "friendly")
    length = options.get("length", "medium")
    focus = options.get("focus", "personality")
    humor = options.get("humor", "moderate")

    # Create system prompt for Tinder description generation
    system_prompt = """
    You are a dating profile writer specializing in creating attractive and authentic Tinder bios.
    Your task is to create a compelling Tinder profile description based on the provided information.
    
    Guidelines:
    - Write in first person, as if the user is describing themselves
    - Be authentic and genuine
    - Do not use clichés or overly generic statements
    - Include subtle hooks to encourage conversation
    - Avoid anything that might come across as desperate or too eager
    - Do not use emojis or hashtags
    - Reply only with the description, no additional text or explanations
    - Avoid any boilerplate text or disclaimers
    - DO NOT write "Okay here's a Tinder bio for you" or anything similar
    """

    # Add tone guidance based on selected tone
    tone_guidance = {
        "friendly": "Write in a warm, approachable, and inviting tone.",
        "confident": "Write with confidence and self-assurance without coming across as arrogant.",
        "mysterious": "Write with intrigue and hint at interesting aspects without revealing too much.",
        "professional": "Write in a mature, composed manner that shows ambition and stability.",
        "casual": "Write in a relaxed, laid-back style that feels conversational and easy-going.",
    }
    system_prompt += f"\n\nTone: {tone_guidance.get(tone, tone_guidance['friendly'])}"

    # Add length guidance
    length_guidance = {
        "short": "Keep the description concise, between 50-75 words.",
        "medium": "Write a moderate-length description, between 75-150 words.",
        "long": "Create a more detailed description, between 150-200 words.",
    }
    system_prompt += (
        f"\n\nLength: {length_guidance.get(length, length_guidance['medium'])}"
    )

    # Add focus guidance
    focus_guidance = {
        "personality": "Emphasize personal qualities, values, and character traits.",
        "interests": "Highlight hobbies, interests, and activities the person enjoys.",
        "goals": "Focus on ambitions, life goals, and what the person is looking for.",
        "balanced": "Create a well-rounded profile that covers personality, interests, and goals equally.",
    }
    system_prompt += (
        f"\n\nFocus: {focus_guidance.get(focus, focus_guidance['balanced'])}"
    )

    # Add humor guidance
    humor_guidance = {
        "minimal": "Keep the tone mostly serious with perhaps one light moment.",
        "moderate": "Include some humor and light-hearted elements throughout.",
        "high": "Make the profile fun and humorous while still authentic.",
    }
    system_prompt += (
        f"\n\nHumor: {humor_guidance.get(humor, humor_guidance['moderate'])}"
    )

    # Create the prompt
    prompt = f"Age: {age}\nOccupation: {occupation}\nInterests: {interests}"

    # Add the current description if this is an update request
    if request.method == "PUT" and current_description:
        system_prompt += "\n\nYou are improving an existing description. Keep what works well, but enhance it according to the guidelines."
        prompt += f"\n\nCurrent description: {current_description}"

        # Add specific adjustment instructions if provided
        if adjustments.strip():
            system_prompt += "\n\nYou have been given specific adjustment instructions from the user. Focus on implementing these changes while maintaining the overall quality and coherence of the description."
            prompt += f"\n\nRequested adjustments: {adjustments}"

    # Prepare the payload
    payload = {
        "model": "gemma3:4b-it-q4_K_M",
        "prompt": prompt,
        "system": system_prompt,
        "stream": False,
        "options": {"temperature": 0.7, "num_gpu": 1, "low_vram": True},
    }

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=100,
        )
        response.raise_for_status()

        data = response.json()
        description = data.get("response", "")

        # Store this as a specialized response type
        description_type = (
            "tinder_description_update"
            if request.method == "PUT"
            else "tinder_description"
        )

        # Include adjustments in the prompt if provided (for logging)
        prompt_with_adjustments = prompt
        if adjustments.strip():
            prompt_with_adjustments += f" [Adjustments: {adjustments}]"

        LlamaResponse.objects.create(
            prompt=f"{description_type}: {prompt_with_adjustments}",
            response=description,
            user=user,
        )

        return Response({"description": description})
    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=500)


@api_view(["PUT"])
def update_user(request):
    """Update user settings"""
    user_id = request.data.get("user_id")
    name = request.data.get("name")
    email = request.data.get("email")
    sex = request.data.get("sex")
    age = request.data.get("age")
    orientation = request.data.get("orientation")

    if not user_id:
        return Response({"error": "User ID is required"}, status=400)
    if not all([name, email, sex, age]):
        return Response({"error": "Name, email, sex, and age are required"}, status=400)

    try:
        user = WingmanUsers.objects.get(id=user_id)

        # Update user fields
        user.name = name
        user.email = email
        user.sex = sex
        user.age = age

        # Update orientation if provided
        if orientation:
            user.orientation = orientation

        user.save()

        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "sex": user.sex,
            "age": user.age,
            "orientation": user.orientation,
            "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        return Response(user_data)

    except WingmanUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
