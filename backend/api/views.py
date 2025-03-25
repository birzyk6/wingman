import requests
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import StreamingHttpResponse
from .models import LlamaResponse, WingmanUsers


@api_view(["POST"])
def generate_response(request):
    prompt = request.data.get("prompt", "")
    if not prompt:
        return Response({"error": "Prompt is required"}, status=400)

    stream_response = request.data.get("stream", True)  # Default to streaming

    # request format
    payload = {
        "model": "gemma3:4b-it-q4_K_M",  # Quantized version for smaller VRAM
        "prompt": prompt,
        "system": "You are an empathic gay with dirty minds. You will help other to find a love in web.Generate response in points and dont generate any boiler plate text",
        "stream": stream_response,
        "context": [1,2,3,4,5,6]
    }

    try:
        if not stream_response:
            # Non-streaming approach (original code)
            response = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                timeout=100,  # Increased timeout
            )
            response.raise_for_status()  # Raise an error for HTTP issues

            data = response.json()
            response_text = data.get("response", "")

            # Save response to database
            llama_response = LlamaResponse.objects.create(
                prompt=prompt, response=response_text
            )

            return Response({"response": response_text})
        else:
            # Streaming approach
            def event_stream():
                full_response = ""
                with requests.post(
                    "http://localhost:11434/api/generate",
                    json=payload,
                    stream=True,
                    timeout=100,
                ) as r:
                    r.raise_for_status()
                    for line in r.iter_lines():
                        if line:
                            chunk = json.loads(line)
                            response_chunk = chunk.get("response", "")
                            full_response += response_chunk
                            yield f"data: {json.dumps({'chunk': response_chunk, 'done': chunk.get('done', False)})}\n\n"

                            # If it's the final chunk, save the complete response
                            if chunk.get("done", False):
                                LlamaResponse.objects.create(
                                    prompt=prompt, response=full_response
                                )

            response = StreamingHttpResponse(
                event_stream(), content_type="text/event-stream"
            )
            response["Cache-Control"] = "no-cache"
            response["X-Accel-Buffering"] = "no"
            return response

    except requests.exceptions.ConnectionError:
        return Response(
            {"error": "Could not connect to Ollama server. Is it running?"}, status=503
        )
    except requests.exceptions.Timeout:
        return Response(
            {"error": "Request to Ollama timed out. Try again or increase timeout."},
            status=504,
        )
    except requests.exceptions.HTTPError as e:
        return Response(
            {"error": f"HTTP error: {str(e)}"}, status=e.response.status_code
        )
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Failed to connect to Ollama: {str(e)}"}, status=500)
    except Exception as e:
        return Response({"error": f"Unexpected error: {str(e)}"}, status=500)


@api_view(["GET"])
def get_responses(request):
    """Get all previously stored responses"""
    responses = LlamaResponse.objects.all()
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

@api_view(["POST"])
def create_user(request):
    name = request.data.get("name", "")
    email = request.data.get("email", "")
    sex= request.data.get("sex", "")
    age = request.data.get("age", "")
    password = request.data.get("password", "")
    if not all([name, email, sex, age, password]):
        return Response({"error": "All fields are required"}, status=400)
    try:
        user = WingmanUsers.objects.create(
            name=name, email=email, sex=sex, age=int(age), password=password
        )

        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "sex": user.sex,
            "age": user.age,
            "password": user.password,
            "created_at": user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        return Response(user_data, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
def get_user(request):
    """Get all previously stored responses"""
    users = WingmanUsers.objects.all()
    data = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "sex":user.sex,
            "age": user.age,
        }
        for user in users
    ]
    return Response(data)

