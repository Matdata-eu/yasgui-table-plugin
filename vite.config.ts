import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "demo",
  publicDir: false,
  server: {
    host: "0.0.0.0",
    port: 3000,
    open: false,
  },
  resolve: {
    alias: {
      "@matdata/yasgui-table-plugin": resolve(__dirname, "src/index.ts"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  build: {
    outDir: "../dist",
  },
  esbuild: {
    target: "es2020",
  },
});
