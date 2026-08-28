export const SERVER_URL = import.meta.env?.VITE_SERVER_URL || "";

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${SERVER_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("The game server is unavailable. Please try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data.error || "Something went wrong. Please try again.",
    );
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
}
