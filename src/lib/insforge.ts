import { createClient, InsForgeClient } from "@insforge/sdk";

// Server-only client — no NEXT_PUBLIC_ prefix, never exposed to the browser.
// Called lazily so the build doesn't fail when env vars aren't present at compile time.

let _client: InsForgeClient | null = null;

export function getInsForge(): InsForgeClient {
  if (_client) return _client;
  const baseUrl = process.env.INSFORGE_URL;
  const anonKey = process.env.INSFORGE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    throw new Error("INSFORGE_URL and INSFORGE_ANON_KEY must be set");
  }
  _client = createClient({ baseUrl, anonKey });
  return _client;
}
