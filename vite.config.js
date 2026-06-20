import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    // Redirect bare "/" to "/developer/docs" in dev server
    {
      name: "redirect-root",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/" || req.url === "") {
            res.writeHead(302, { Location: "/developer/docs" });
            res.end();
          } else {
            next();
          }
        });
      },
    },
  ],
  // base: "/developer/docs/", // Uncomment if deploying to a sub-path on a static host
});
