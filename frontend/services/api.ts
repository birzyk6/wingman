import axios from "axios";

export interface ResponseData {
    id: number;
    prompt: string;
    response: string;
    created_at: string;
}

export interface UserData {
    orientation: string;
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

export interface ChatContext {
    messages: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
}

interface CreateUserData {
    name: string;
    email: string;
    sex: string;
    age: string;
    password: string;
}

interface UpdateUserData {
    user_id: number;
    name: string;
    email: string;
    sex: string;
    age: number;
    orientation: string;
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
    onDone: () => void,
    chat_id?: number | null,
    context?: ChatContext,
    isContextActive: boolean = false,
    mode: string = "basic" // Add mode parameter with default value
): Promise<void> {
    // Build request body with optional chat_id, context and mode
    const requestBody: any = {
        prompt,
        user_id,
        stream: true,
        isContextActive,
        mode, // Add mode to request body
    };

    if (chat_id) {
        requestBody.chat_id = chat_id;
    }

    // We won't send context from frontend when isContextActive is true
    // as the backend will handle context fetching
    if (!isContextActive && context && context.messages && context.messages.length > 0) {
        requestBody.context = context;
    }

    try {
        const response = await fetch(`${API_URL}/generate/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
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

                        // Check for errors first
                        if (eventData.error) {
                            console.error("Error from server:", eventData.error);
                            throw new Error(eventData.error);
                        }

                        if (eventData.chunk) {
                            onChunk(eventData.chunk);
                        }
                        if (eventData.done) {
                            onDone();
                            break;
                        }
                    } catch (e) {
                        console.error("Error parsing SSE data:", e);
                        // If this is an error we threw ourselves, rethrow it
                        if (e instanceof Error && e.message !== "Error parsing SSE data:") {
                            throw e;
                        }
                    }
                }

                boundary = buffer.indexOf("\n\n");
            }
        }
    } catch (error) {
        console.error("Stream error:", error);
        throw error; // Re-throw to allow caller to handle
    }
}

// Add function for Tinder replies
export async function streamTinderReplies(
    message: string,
    intention: string,
    style: string,
    user_id: number,
    onChunk: (chunk: string) => void,
    onDone: () => void
): Promise<void> {
    const requestBody = {
        message,
        intention,
        style,
        user_id,
        stream: true,
    };

    try {
        const response = await fetch(`${API_URL}/tinder_replies/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
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

                        // Check for errors first
                        if (eventData.error) {
                            console.error("Error from server:", eventData.error);
                            throw new Error(eventData.error);
                        }

                        if (eventData.chunk) {
                            onChunk(eventData.chunk);
                        }
                        if (eventData.done) {
                            onDone();
                            break;
                        }
                    } catch (e) {
                        console.error("Error parsing SSE data:", e);
                        // If this is an error we threw ourselves, rethrow it
                        if (e instanceof Error && e.message !== "Error parsing SSE data:") {
                            throw e;
                        }
                    }
                }

                boundary = buffer.indexOf("\n\n");
            }
        }
    } catch (error) {
        console.error("Stream error:", error);
        throw error; // Re-throw to allow caller to handle
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

// Add or update this function in your API service

export const getChatHistory = async (userId: string, chatId?: number | null) => {
    try {
        // Use axios for consistency and ensure API_URL is used
        let url = `${API_URL}/chat_history/?user_id=${userId}`;

        // If chatId is provided, include it in the request
        if (chatId) {
            url += `&chat_id=${chatId}`;
        }

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching chat history:", error);
        throw error;
    }
};

// Get all chat windows for a user
export const getAllChatWindows = async (userId: string) => {
    try {
        const response = await axios.get(`${API_URL}/chat_windows/?user_id=${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching chat windows:", error);
        throw error;
    }
};

// Create a new chat window
export const createChatWindow = async (userId: string) => {
    try {
        const response = await axios.post(`${API_URL}/chat_windows/create/`, { user_id: userId });
        return response.data;
    } catch (error) {
        console.error("Error creating chat window:", error);
        throw error;
    }
};

// Delete a chat window
export const deleteChatWindow = async (chatId: number, userId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/chat_windows/${chatId}/delete/?user_id=${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting chat window:", error);
        throw error;
    }
};

// Generate a Tinder profile description
export async function generateTinderDescription(
    user_id: number,
    userBasics: {
        age: string;
        occupation: string;
        interests: string;
    },
    options: {
        tone: string;
        length: string;
        focus: string;
        humor: string;
    }
): Promise<{ description: string }> {
    try {
        const response = await axios.post(`${API_URL}/tinder_description/`, {
            user_id,
            user_basics: userBasics,
            options,
        });
        return response.data;
    } catch (error) {
        console.error("Error generating Tinder description:", error);
        throw error;
    }
}

// Update an existing Tinder profile description
export async function updateTinderDescription(
    user_id: number,
    current_description: string,
    userBasics: {
        age: string;
        occupation: string;
        interests: string;
    },
    options: {
        tone: string;
        length: string;
        focus: string;
        humor: string;
    },
    adjustments?: string // Add optional adjustments parameter
): Promise<{ description: string }> {
    try {
        const response = await axios.put(`${API_URL}/tinder_description/`, {
            user_id,
            current_description,
            user_basics: userBasics,
            options,
            adjustments, // Pass adjustments to the API
        });
        return response.data;
    } catch (error) {
        console.error("Error updating Tinder description:", error);
        throw error;
    }
}

export async function createUser(userData: CreateUserData): Promise<UserData> {
    try {
        console.log("Creating user with data:", { ...userData, password: "REDACTED" });
        const response = await axios.post(`${API_URL}/create_user/`, userData);
        console.log("User creation response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

export async function loginUser(email: string, password: string): Promise<UserData> {
    try {
        console.log("Attempting login with email:", email);
        const response = await axios.post(`${API_URL}/login_user/`, { email, password });
        console.log("Login response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}

export async function updateUserSettings(userData: UpdateUserData): Promise<UserData> {
    try {
        const response = await axios.put(`${API_URL}/update_user/`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating user settings:", error);
        throw error;
    }
}
