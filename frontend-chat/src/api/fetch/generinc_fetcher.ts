

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || 'Request failed');
    }

    return data as T;
}


export async function fetchJsonNoError<T>(url: string, options?: RequestInit): Promise<T | null> {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        return null;
    }

    return data as T;
}