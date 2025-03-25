import axios from "axios";

export interface ResponseData {
  id: number;
  prompt: string;
  response: string;
  created_at: string;
}

const API_URL = "http://localhost:8000/api";

export async function fetchResponses(): Promise<ResponseData[]> {
  const res = await axios.get(`${API_URL}/responses/`);
  return res.data;
}

export async function streamGenerateResponse(
  prompt: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  const response = await fetch(`${API_URL}/generate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, stream: true }),
  });

  if (!response.ok) {
    throw new Error(
      `Server responded with ${response.status}: ${response.statusText}`
    );
  }

  // Handle the event stream
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  // Process the streaming response
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode the chunk and add to buffer
    buffer += decoder.decode(value, { stream: true });

    // Process any complete SSE messages in the buffer
    let boundary = buffer.indexOf("\n\n");
    while (boundary > -1) {
      const line = buffer.substring(0, boundary);
      buffer = buffer.substring(boundary + 2);

      if (line.startsWith("data: ")) {
        try {
          const eventData = JSON.parse(line.substring(6));
          if (eventData.chunk) {
            onChunk(eventData.chunk);
          }
          if (eventData.done) {
            onDone();
            break;
          }
        } catch (e) {
          console.error("Error parsing SSE data:", e);
        }
      }

      boundary = buffer.indexOf("\n\n");
    }
  }
}
