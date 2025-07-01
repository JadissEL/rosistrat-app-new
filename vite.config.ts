import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Suppress React warnings about defaultProps
      jsxRuntime: "automatic",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Suppress React warnings in development
    __DEV__: true,
    // Suppress specific React warnings
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
  },
  build: {
    // Optimize build for deployment
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps for production
    minify: "esbuild",
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies for better caching
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-tabs", "@radix-ui/react-dialog"],
          charts: ["recharts"],
          icons: ["lucide-react"],
        },
      },
    },
    // Increase chunk size warning limit for our data-heavy simulator
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // Remove console statements in production, suppress warnings in development
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    // Suppress specific warnings
    logOverride: {
      "this-is-undefined-in-esm": "silent",
    },
  },
  // Add server configuration to suppress warnings
  server: {
    hmr: {
      overlay: false, // This might help suppress overlay warnings
    },
  },
  // Ensure proper base path for deployment
  base: "/",
  // Preview server settings for testing production build
  preview: {
    port: 3000,
    strictPort: true,
  },
});
