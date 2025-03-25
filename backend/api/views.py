import requests
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import StreamingHttpResponse
from .models import LlamaResponse


@api_view(["POST"])
def generate_response(request):
    prompt = request.data.get("prompt", "")
    if not prompt:
        return Response({"error": "Prompt is required"}, status=400)

    stream_response = request.data.get("stream", True)  # Default to streaming

    # request format
    payload = {
        "model": "gemma3:4b-it-q4_K_M",  # Quantized version for smaller VRAM  # gemma3:4b-it-q4_K_M    gemma3:1b
        "prompt": prompt,
        "stream": stream_response,
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
def generate_tinder_description(request):
    name = request.data.get("name", "")
    interests = request.data.get("interests", "")
    looking_for = request.data.get("lookingFor", "")
    age = request.data.get("age", "")
    location = request.data.get("location", "")
    hobbies = request.data.get("hobbies", "")

    if not name or not interests or not looking_for or not age or not location or not hobbies:
        return Response({"error": "All fields are required."}, status=400)

    prompt = f"""
    Stwórz jedno spójne bio na Tinder dla osoby o imieniu {name}, która ma {age} lat, mieszka w {location}, interesuje się {interests}, szuka {looking_for}, a jej hobby to {hobbies}. Użyj poprawnej polszczyzny, nie dodawaj żadnych wstępów ani komentarzy. Bio powinno być naturalne, łatwe do przeczytania, przyjazne i pełne pozytywnej energii. Daj rozbudowane bio. 
    """

    # stream_response = request.data.get("stream", True) 
    payload = {        
        "model": "gemma3:4b-it-q4_K_M",
        "prompt": prompt,
        "stream": False,
    }

    try:
        response = requests.post("http://localhost:11434/api/generate", json=payload, timeout=100)
        response.raise_for_status()  
        data = response.json()
        description = data.get("response", "")
        if not description:
            return Response({"error": "Ollama returned an empty response."}, status=500)
        return Response({"response": description})
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Error communicating with Ollama: {str(e)}"}, status=500)
