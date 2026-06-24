/* eslint-disable prettier/prettier */
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
  vite: {
    build: {
      rollupOptions: {
        external: [],
      },
    },
    ssr: {
      noExternal: ["tslib", "@supabase/functions-js", "@supabase/supabase-js"],
    },
  },
});