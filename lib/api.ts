const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

/** Public API base URL, including the app's `/api` prefix. */
export const API_BASE_URL = configuredApiBase;

let refreshInProgress: Promise<string | null> | null = null;
const refreshedTokens = new Map<string, string>();

export async function refreshAccessToken(): Promise<string | null> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is required. Set it in frontend/.env.local and restart Next.js.");
  }
  if (!refreshInProgress) {
    refreshInProgress = (async () => {
      const requestRefresh = () =>
        fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
      const response =
        typeof navigator !== "undefined" && navigator.locks
          ? await navigator.locks.request("tcf-refresh-session", requestRefresh)
          : await requestRefresh();
      if (response.status === 401) return null;
      if (!response.ok) {
        throw new Error(`Could not restore your sign-in (request failed with status ${response.status}).`);
      }
      const payload = await response.json() as { accessToken?: unknown };
      if (typeof payload.accessToken !== "string") {
        throw new Error("The API did not return an access token when restoring your sign-in.");
      }
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("learner-access-token", payload.accessToken);
        window.sessionStorage.setItem("cms-access-token", payload.accessToken);
      }
      return payload.accessToken;
    })().finally(() => {
      refreshInProgress = null;
    });
  }
  return refreshInProgress;
}

export async function revokeRefreshSession() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is required. Set it in frontend/.env.local and restart Next.js.");
  }
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!response.ok) {
    throw new Error(`Could not securely sign out (request failed with status ${response.status}).`);
  }
}

/** Route all browser API requests through one URL and skip ngrok's free-tier interstitial. */
export async function apiFetch(path: string, init: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is required. Set it in frontend/.env.local and restart Next.js.");
  }

  const headers = new Headers(init.headers);
  headers.set("ngrok-skip-browser-warning", "true");
  const suppliedAuthorization = headers.get("Authorization");
  if (suppliedAuthorization?.startsWith("Bearer ")) {
    const suppliedToken = suppliedAuthorization.slice(7);
    const refreshedToken = refreshedTokens.get(suppliedToken);
    if (refreshedToken) headers.set("Authorization", `Bearer ${refreshedToken}`);
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  try {
    const response = await fetch(url, { ...init, headers, credentials: init.credentials ?? "include" });
    const requestAuthorization = headers.get("Authorization");
    if (response.status !== 401 || !requestAuthorization?.startsWith("Bearer ")) {
      return response;
    }
    const expiredToken = requestAuthorization.slice(7);
    const accessToken = await refreshAccessToken();
    if (!accessToken) return response;
    refreshedTokens.set(expiredToken, accessToken);
    if (refreshedTokens.size > 100) refreshedTokens.clear();
    headers.set("Authorization", `Bearer ${accessToken}`);
    return await fetch(url, { ...init, headers, credentials: init.credentials ?? "include" });
  } catch (cause) {
    throw new Error(
      `Could not reach the backend API at ${API_BASE_URL}. Check that the backend ngrok tunnel is online and that its CORS allowlist includes this frontend origin.`,
      { cause },
    );
  }
}
