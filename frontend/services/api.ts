import axios from "axios";

export interface ResponseData {
    id: number;
    prompt: string;
    response: string;
    created_at: string;
}

export interface UserData {
    id: string;
    name: string;
    email: string;
    sex: string;
    age: number;
    created_at: string;
}

export interface LoveCalculatorResponse {
    love_score: number;
    message: string;
}

const API_URL = "http://localhost:8000/api";

export async function fetchResponses(): Promise<ResponseData[]> {
    // get userId from local storage
    const userId = localStorage.getItem("wingmanUserId");
    if (!userId) {
        throw new Error("User ID not found. Please log in.");
    }
    const parsedUserId = parseInt(userId, 10);
    const res = await axios.get(`${API_URL}/responses/?user_id=${parsedUserId}`);
    return res.data;
}

export async function streamGenerateResponse(
    prompt: string,
    user_id: number,
    onChunk: (chunk: string) => void,
    onDone: () => void
): Promise<void> {
    const response = await fetch(`${API_URL}/generate/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, user_id, stream: true }),
    });

    if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
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

export async function getUserData(): Promise<UserData | null> {
    const userId = localStorage.getItem("wingmanUserId");
    if (!userId) {
        return null;
    }
    const parsedUserId = parseInt(userId, 10);
    const res = await axios.get(`${API_URL}/get_user/?user_id=${parsedUserId}`);
    return res.data;
}

export async function calculateLoveScore(
    name1: string,
    name2: string
): Promise<{ love_score: number; message: string }> {
    const res = await axios.post(`${API_URL}/love_calculator/`, { name1, name2 });
    return res.data;
}
