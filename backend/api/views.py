import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import LlamaResponse


@api_view(["POST"])
def generate_response(request):
    prompt = request.data.get("prompt", "")
    if not prompt:
        return Response({"error": "Prompt is required"}, status=400)

    # request format
    payload = {
        "model": "llama3.2:1b",
        "prompt": prompt,
        "stream": False,
    }

    try:
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json=payload,
            timeout=30,  # Increased timeout
        )
        response.raise_for_status()  # Raise an error for HTTP issues

        data = response.json()
        response_text = data.get("response", "")

        # Save response to database
        llama_response = LlamaResponse.objects.create(
            prompt=prompt, response=response_text
        )

        return Response({"response": response_text})

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
