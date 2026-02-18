import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Disable React Strict Mode to prevent double-mounting of components.
  // Strict Mode's intentional double-mount causes Supabase Realtime channels
  // to be removed and re-created, but the singleton client returns the already-
  // removed (broken) channel on the second mount, silently breaking subscriptions.
  reactStrictMode: false,
};

export default nextConfig;
