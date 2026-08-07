const STORAGE_KEY = "bouvet-island-token";

export function getStoredToken(): string | undefined {
  return localStorage.getItem(STORAGE_KEY) ?? undefined;
}

export function storeToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}
