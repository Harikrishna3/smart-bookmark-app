import { createBrowserClient } from '@supabase/ssr'

// Module-level singleton — ensures one WebSocket connection per browser session.
// Calling createBrowserClient() multiple times creates multiple connections and
// causes subscriptions to silently drop when the old client is garbage-collected.
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
    if (!client) {
        client = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }
    return client
}
