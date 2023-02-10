import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    exclude: ["node_modules"],
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
});
