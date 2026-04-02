import { AuthStore } from "src/stores/auth_store";

const blobCache = new Map<string, string>();

export async function fetchAuthenticatedMedia(url: string): Promise<string> {
  if (blobCache.has(url)) {
    return blobCache.get(url)!;
  }

  if (!AuthStore.accessToken) {
    console.warn('Attempted to fetch authenticated media without access token. URL:', url);
    throw new Error('Unauthorized: No access token');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AuthStore.accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Unauthorized access to media. URL:', url);
      }
      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    blobCache.set(url, objectUrl);
    return objectUrl;
  } catch (error) {
    console.error('Error fetching authenticated media:', error);
    throw error;
  }
}

export function clearMediaCache() {
  for (const url of blobCache.values()) {
    window.URL.revokeObjectURL(url);
  }
  blobCache.clear();
}
