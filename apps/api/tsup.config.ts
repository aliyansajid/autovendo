import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
  outDir: "dist",
  splitting: false,
  sourcemap: false,
  clean: true,
  noExternal: [/^@repo\//],
});
