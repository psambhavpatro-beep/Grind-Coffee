import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor bundles for better browser caching
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "firebase-vendor": ["firebase/app", "firebase/firestore", "firebase/auth"],
        },
      },
    },
    // Warn if any single chunk exceeds 600 kB
    chunkSizeWarningLimit: 600,
  },
});
