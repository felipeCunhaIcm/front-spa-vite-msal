import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");
  const target = env.VITE_API_PROXY_TARGET;

  return {
    build: {
      rollupOptions: {
        input: {
          app: "index.html",
          authRedirect: "auth-redirect.html",
        },
      },
    },
    server: {
      port: 5173,
      proxy: target ? { "/api": { target, changeOrigin: true } } : undefined,
    },
  };
});
