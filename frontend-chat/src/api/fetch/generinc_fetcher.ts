

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

  // FIX : FIXED - поддержка 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text()

  let data: unknown = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error("Invalid JSON response")
    }
  }

  if (!response.ok) {
    if (typeof data === "object" && data !== null && "message" in data) {
      throw new Error(String((data as { message?: unknown }).message))
    }

    throw new Error(`Request failed with status: ${response.status}`)
  }

  return data as T
}


export async function fetchJsonNoError<T>(url: string, options?: RequestInit): Promise<T | null> {
    const response = await fetch(url, options);

    if (!response.ok) {
        return null;
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}
