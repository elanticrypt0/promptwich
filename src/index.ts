import { serve } from "bun";
import { join, dirname } from "path";
import { existsSync, readdirSync } from "fs";
import index from "./index.html";

const IS_COMPILED = process.argv[0]?.endsWith("promptwich");
const BASE_DIR = IS_COMPILED ? dirname(process.argv[0]) : process.cwd();
const CONFIG_DIR = join(BASE_DIR, "config");

const server = serve({
  routes: {
    // Serve SPA for all unmatched routes
    "/*": index,

    // Get config file (sandwich.json or globals.json)
    "/api/config/:filename": async (req) => {
      const filename = req.params.filename;

      // Security: Prevent directory traversal
      if (filename.includes("..") || filename.includes("/")) {
        return new Response("Forbidden", { status: 403 });
      }

      const filePath = join(CONFIG_DIR, filename);

      if (existsSync(filePath)) {
        const file = Bun.file(filePath);
        return new Response(file, {
          headers: { "Content-Type": "application/json" },
        });
      }

      return Response.json({ error: "Config not found" }, { status: 404 });
    },

    // List all presets
    "/api/presets": {
      GET: async () => {
        const presetsDir = join(CONFIG_DIR, "presets");

        if (!existsSync(presetsDir)) {
          return Response.json([]);
        }

        const files = readdirSync(presetsDir)
          .filter((f) => f.endsWith(".json"))
          .sort();

        const presets = await Promise.all(
          files.map(async (filename) => {
            const filePath = join(presetsDir, filename);
            const content = await Bun.file(filePath).json();
            return {
              filename,
              name: content.name,
              description: content.description,
            };
          })
        );

        return Response.json(presets);
      },
    },

    // Get specific preset
    "/api/presets/:filename": async (req) => {
      const filename = req.params.filename;

      // Security: Prevent directory traversal
      if (filename.includes("..") || filename.includes("/")) {
        return new Response("Forbidden", { status: 403 });
      }

      const filePath = join(CONFIG_DIR, "presets", filename);

      if (existsSync(filePath)) {
        const file = Bun.file(filePath);
        return new Response(file, {
          headers: { "Content-Type": "application/json" },
        });
      }

      return Response.json({ error: "Preset not found" }, { status: 404 });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🥪 Promptwich is running!`);
console.log(`📂 Config loaded from: ${CONFIG_DIR}`);
console.log(`🚀 Open ${server.url}`);
