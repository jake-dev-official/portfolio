import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/portfolio/", // This is for github remove if on different hosting
  plugins: [react()],
});
