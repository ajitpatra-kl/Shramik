import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure libraries that expect Node's `global` variable work in the browser
    global: "globalThis",
  },
});
