import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) {
    return client;
  }

  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args[0]?.includes?.("Multiple GoTrueClient instances")) {
      return;
    }
    originalWarn(...args);
  };

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  console.warn = originalWarn;

  return client;
}
