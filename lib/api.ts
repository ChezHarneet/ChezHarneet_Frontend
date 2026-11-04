const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

/** Public API base URL, including the app's `/api` prefix. */
export const API_BASE_URL = configuredApiBase;

/** Route all browser API requests through one URL and skip ngrok's free-tier interstitial. */
export async function apiFetch(path: string, init: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is required. Set it in frontend/.env.local and restart Next.js.");
  }

  const headers = new Headers(init.headers);
  headers.set("ngrok-skip-browser-warning", "true");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  try {
    return await fetch(`${API_BASE_URL}${normalizedPath}`, { ...init, headers });
  } catch (cause) {
    throw new Error(
      `Could not reach the backend API at ${API_BASE_URL}. Check that the backend ngrok tunnel is online and that its CORS allowlist includes this frontend origin.`,
      { cause },
    );
  }
}
