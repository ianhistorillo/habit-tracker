import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "habit-icon.svg",
        "apple-touch-icon.png",
        "mask-icon.svg",
        "icon-128x128.png",
        "icon-192x192.png",
        "icon-256x256.png",
        "icon-384x384.png",
        "icon-512x512.png",
      ],
      manifest: {
        name: "HabitHub - Track and Build Better Habits",
        short_name: "HabitHub",
        description:
          "Track your habits, set goals, and visualize your progress",
        theme_color: "#0D9488",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
