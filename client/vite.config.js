import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
var __dirname = path.resolve();
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
