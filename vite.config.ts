import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/urbanlens/",
  build: {
    rollupOptions: {
      external: ["maplibre-gl"],
      output: {
        globals: {
          "maplibre-gl": "maplibregl",
        },
      },
    },
  },
});
