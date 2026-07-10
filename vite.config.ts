import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

// Vite serves the desktop app (src/); the Astro static site lives in site/.
export default defineConfig({
  plugins: [react()],
  base: "./",
  publicDir: false,
  build: {
    outDir: "dist-app",
  },

  clearScreen: false,
  server: {
    port: 1430,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1431,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**", "**/site/**", "**/cli/**", "**/dist/**"],
    },
  },
});
