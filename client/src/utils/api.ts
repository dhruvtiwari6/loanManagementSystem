const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RequestOptions extends RequestInit {
  body?: any;
}

export const apiRequest = async (endpoint: string, options: RequestOptions = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("creditsea_token") : null;

  const headers: Record<string, string> = {
    ...((options.headers as any) || {}),
  };

  // Only set application/json if we are not sending FormData (e.g. file upload)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body instanceof FormData ? options.body : JSON.stringify(options.body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
};
