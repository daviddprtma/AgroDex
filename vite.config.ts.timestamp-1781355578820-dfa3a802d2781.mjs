// vite.config.ts
import react from "file:///C:/Users/ayush/AgroDex/node_modules/@vitejs/plugin-react/dist/index.js";
import path2 from "path";
import { defineConfig } from "file:///C:/Users/ayush/AgroDex/node_modules/vitest/dist/config.js";
import { nodePolyfills } from "file:///C:/Users/ayush/AgroDex/node_modules/vite-plugin-node-polyfills/dist/index.js";

// plugins/component-tagger.ts
import { parse } from "file:///C:/Users/ayush/AgroDex/node_modules/@babel/parser/lib/index.js";
import { walk } from "file:///C:/Users/ayush/AgroDex/node_modules/estree-walker/src/index.js";
import MagicString from "file:///C:/Users/ayush/AgroDex/node_modules/magic-string/dist/magic-string.es.mjs";
import path from "node:path";
var VALID_EXTENSIONS = /* @__PURE__ */ new Set([".jsx", ".tsx"]);
function componentTagger() {
  return {
    name: "vite-plugin-component-tagger",
    apply: "serve",
    // Only apply in development
    enforce: "pre",
    async transform(code, id) {
      try {
        if (!VALID_EXTENSIONS.has(path.extname(id)) || id.includes("node_modules"))
          return null;
        const ast = parse(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        });
        const ms = new MagicString(code);
        const fileRelative = path.relative(process.cwd(), id);
        walk(ast, {
          enter(node) {
            try {
              if (node.type !== "JSXOpeningElement") return;
              if (node.name?.type !== "JSXIdentifier") return;
              const tagName = node.name.name;
              if (!tagName) return;
              const skipElements = /* @__PURE__ */ new Set(["html", "head", "body", "script", "style", "meta", "link", "title"]);
              if (skipElements.has(tagName.toLowerCase())) return;
              const alreadyTagged = node.attributes?.some(
                (attr) => attr.type === "JSXAttribute" && attr.name?.name === "data-component-id"
              );
              if (alreadyTagged) return;
              const loc = node.loc?.start;
              if (!loc) return;
              const componentId = `${fileRelative}:${loc.line}:${loc.column}`;
              if (node.name.end != null) {
                ms.appendLeft(
                  node.name.end,
                  ` data-component-id="${componentId}" data-component-name="${tagName}"`
                );
              }
            } catch (error) {
              console.warn(
                `[component-tagger] Warning: Failed to process JSX node in ${id}:`,
                error
              );
            }
          }
        });
        if (ms.toString() === code) return null;
        return {
          code: ms.toString(),
          map: ms.generateMap({ hires: true })
        };
      } catch (error) {
        console.warn(
          `[component-tagger] Warning: Failed to transform ${id}:`,
          error
        );
        return null;
      }
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\ayush\\AgroDex";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    componentTagger(),
    nodePolyfills()
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@hashgraph") || id.includes("hashconnect") || id.includes("@walletconnect")) {
              return "vendor-hedera";
            }
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/lib/__tests__/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/lib/__tests__/"]
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "https://agro-dex-nine.vercel.app",
        changeOrigin: true,
        headers: {
          "Access-Control-Allow-Origin": "https://agro-dex-1u85.vercel.app",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Credentials": "true"
        }
      }
    },
    hmr: {
      overlay: false,
      timeout: 15e3
    },
    watch: {
      usePolling: true,
      interval: 500,
      binaryInterval: 500
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2lucy9jb21wb25lbnQtdGFnZ2VyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYXl1c2hcXFxcQWdyb0RleFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYXl1c2hcXFxcQWdyb0RleFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYXl1c2gvQWdyb0RleC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVzdC9jb25maWdcIjtcclxuaW1wb3J0IHsgbm9kZVBvbHlmaWxscyB9IGZyb20gXCJ2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1wiO1xyXG5pbXBvcnQgY29tcG9uZW50VGFnZ2VyIGZyb20gXCIuL3BsdWdpbnMvY29tcG9uZW50LXRhZ2dlclwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgICBub2RlUG9seWZpbGxzKCksXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlc1wiKSkge1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJAaGFzaGdyYXBoXCIpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJoYXNoY29ubmVjdFwiKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwiQHdhbGxldGNvbm5lY3RcIilcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yLWhlZGVyYVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlY2hhcnRzXCIpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yLWNoYXJ0c1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImZyYW1lci1tb3Rpb25cIikpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3ItbW90aW9uXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHRlc3Q6IHtcclxuICAgIGdsb2JhbHM6IHRydWUsXHJcbiAgICBlbnZpcm9ubWVudDogXCJqc2RvbVwiLFxyXG4gICAgc2V0dXBGaWxlczogXCIuL3NyYy9saWIvX190ZXN0c19fL3NldHVwLnRzXCIsXHJcbiAgICBjb3ZlcmFnZToge1xyXG4gICAgICBwcm92aWRlcjogXCJ2OFwiLFxyXG4gICAgICByZXBvcnRlcjogW1widGV4dFwiLCBcImpzb25cIiwgXCJodG1sXCJdLFxyXG4gICAgICBleGNsdWRlOiBbXCJub2RlX21vZHVsZXMvXCIsIFwic3JjL2xpYi9fX3Rlc3RzX18vXCJdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgXCIvYXBpXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hZ3JvLWRleC1uaW5lLnZlcmNlbC5hcHBcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCJodHRwczovL2Fncm8tZGV4LTF1ODUudmVyY2VsLmFwcFwiLFxyXG4gICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IFwiQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uXCIsXHJcbiAgICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCJHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TXCIsXHJcbiAgICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxyXG4gICAgICB0aW1lb3V0OiAxNTAwMCxcclxuICAgIH0sXHJcbiAgICB3YXRjaDoge1xyXG4gICAgICB1c2VQb2xsaW5nOiB0cnVlLFxyXG4gICAgICBpbnRlcnZhbDogNTAwLFxyXG4gICAgICBiaW5hcnlJbnRlcnZhbDogNTAwLFxyXG4gICAgfSxcclxuICB9LFxyXG59KTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGF5dXNoXFxcXEFncm9EZXhcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYXl1c2hcXFxcQWdyb0RleFxcXFxwbHVnaW5zXFxcXGNvbXBvbmVudC10YWdnZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2F5dXNoL0Fncm9EZXgvcGx1Z2lucy9jb21wb25lbnQtdGFnZ2VyLnRzXCI7LyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xyXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJ0BiYWJlbC9wYXJzZXInO1xyXG5pbXBvcnQgeyB3YWxrIH0gZnJvbSAnZXN0cmVlLXdhbGtlcic7XHJcbmltcG9ydCBNYWdpY1N0cmluZyBmcm9tICdtYWdpYy1zdHJpbmcnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xyXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuY29uc3QgVkFMSURfRVhURU5TSU9OUyA9IG5ldyBTZXQoWycuanN4JywgJy50c3gnXSk7XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhIFZpdGUgcGx1Z2luIHRoYXQgYWRkcyBjb21wb25lbnQgZGF0YSBhdHRyaWJ1dGVzIGZvciBjb21wb25lbnQgc2VsZWN0aW9uLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29tcG9uZW50VGFnZ2VyKCk6IFBsdWdpbiB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICd2aXRlLXBsdWdpbi1jb21wb25lbnQtdGFnZ2VyJyxcclxuICAgIGFwcGx5OiAnc2VydmUnLCAvLyBPbmx5IGFwcGx5IGluIGRldmVsb3BtZW50XHJcbiAgICBlbmZvcmNlOiAncHJlJyxcclxuXHJcbiAgICBhc3luYyB0cmFuc2Zvcm0oY29kZTogc3RyaW5nLCBpZDogc3RyaW5nKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gSWdub3JlIG5vbi1qc3ggZmlsZXMgYW5kIGZpbGVzIGluc2lkZSBub2RlX21vZHVsZXNcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAhVkFMSURfRVhURU5TSU9OUy5oYXMocGF0aC5leHRuYW1lKGlkKSkgfHxcclxuICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKVxyXG4gICAgICAgIClcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICBjb25zdCBhc3QgPSBwYXJzZShjb2RlLCB7XHJcbiAgICAgICAgICBzb3VyY2VUeXBlOiAnbW9kdWxlJyxcclxuICAgICAgICAgIHBsdWdpbnM6IFsnanN4JywgJ3R5cGVzY3JpcHQnXSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgbXMgPSBuZXcgTWFnaWNTdHJpbmcoY29kZSk7XHJcbiAgICAgICAgY29uc3QgZmlsZVJlbGF0aXZlID0gcGF0aC5yZWxhdGl2ZShwcm9jZXNzLmN3ZCgpLCBpZCk7XHJcblxyXG4gICAgICAgIHdhbGsoYXN0IGFzIGFueSwge1xyXG4gICAgICAgICAgZW50ZXIobm9kZTogYW55KSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZSAhPT0gJ0pTWE9wZW5pbmdFbGVtZW50JykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAvLyBcdTI1MDBcdTI1MDAgMS4gRXh0cmFjdCB0aGUgdGFnIC8gY29tcG9uZW50IG5hbWUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcbiAgICAgICAgICAgICAgaWYgKG5vZGUubmFtZT8udHlwZSAhPT0gJ0pTWElkZW50aWZpZXInKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgY29uc3QgdGFnTmFtZSA9IG5vZGUubmFtZS5uYW1lIGFzIHN0cmluZztcclxuICAgICAgICAgICAgICBpZiAoIXRhZ05hbWUpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgLy8gU2tpcCBjZXJ0YWluIEhUTUwgZWxlbWVudHMgdGhhdCBhcmUgdG9vIGdlbmVyaWNcclxuICAgICAgICAgICAgICBjb25zdCBza2lwRWxlbWVudHMgPSBuZXcgU2V0KFsnaHRtbCcsICdoZWFkJywgJ2JvZHknLCAnc2NyaXB0JywgJ3N0eWxlJywgJ21ldGEnLCAnbGluaycsICd0aXRsZSddKTtcclxuICAgICAgICAgICAgICBpZiAoc2tpcEVsZW1lbnRzLmhhcyh0YWdOYW1lLnRvTG93ZXJDYXNlKCkpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgIC8vIFx1MjUwMFx1MjUwMCAyLiBDaGVjayB3aGV0aGVyIHRoZSB0YWcgYWxyZWFkeSBoYXMgZGF0YS1jb21wb25lbnQtaWQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcbiAgICAgICAgICAgICAgY29uc3QgYWxyZWFkeVRhZ2dlZCA9IG5vZGUuYXR0cmlidXRlcz8uc29tZShcclxuICAgICAgICAgICAgICAgIChhdHRyOiBhbnkpID0+XHJcbiAgICAgICAgICAgICAgICAgIGF0dHIudHlwZSA9PT0gJ0pTWEF0dHJpYnV0ZScgJiZcclxuICAgICAgICAgICAgICAgICAgYXR0ci5uYW1lPy5uYW1lID09PSAnZGF0YS1jb21wb25lbnQtaWQnXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICBpZiAoYWxyZWFkeVRhZ2dlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAvLyBcdTI1MDBcdTI1MDAgMy4gQnVpbGQgdGhlIGlkIFwicmVsYXRpdmUvZmlsZS5qc3g6bGluZTpjb2x1bW5cIiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuICAgICAgICAgICAgICBjb25zdCBsb2MgPSBub2RlLmxvYz8uc3RhcnQ7XHJcbiAgICAgICAgICAgICAgaWYgKCFsb2MpIHJldHVybjtcclxuICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRJZCA9IGAke2ZpbGVSZWxhdGl2ZX06JHtsb2MubGluZX06JHtsb2MuY29sdW1ufWA7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFx1MjUwMFx1MjUwMCA0LiBJbmplY3QgdGhlIGF0dHJpYnV0ZXMganVzdCBhZnRlciB0aGUgdGFnIG5hbWUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcbiAgICAgICAgICAgICAgaWYgKG5vZGUubmFtZS5lbmQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbXMuYXBwZW5kTGVmdChcclxuICAgICAgICAgICAgICAgICAgbm9kZS5uYW1lLmVuZCxcclxuICAgICAgICAgICAgICAgICAgYCBkYXRhLWNvbXBvbmVudC1pZD1cIiR7Y29tcG9uZW50SWR9XCIgZGF0YS1jb21wb25lbnQtbmFtZT1cIiR7dGFnTmFtZX1cImBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgIGBbY29tcG9uZW50LXRhZ2dlcl0gV2FybmluZzogRmFpbGVkIHRvIHByb2Nlc3MgSlNYIG5vZGUgaW4gJHtpZH06YCxcclxuICAgICAgICAgICAgICAgIGVycm9yXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSWYgbm90aGluZyBjaGFuZ2VkIGJhaWwgb3V0LlxyXG4gICAgICAgIGlmIChtcy50b1N0cmluZygpID09PSBjb2RlKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGNvZGU6IG1zLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICBtYXA6IG1zLmdlbmVyYXRlTWFwKHsgaGlyZXM6IHRydWUgfSksXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICBgW2NvbXBvbmVudC10YWdnZXJdIFdhcm5pbmc6IEZhaWxlZCB0byB0cmFuc2Zvcm0gJHtpZH06YCxcclxuICAgICAgICAgIGVycm9yXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9O1xyXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUE0UCxPQUFPLFdBQVc7QUFDOVEsT0FBT0EsV0FBVTtBQUNqQixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLHFCQUFxQjs7O0FDRjlCLFNBQVMsYUFBYTtBQUN0QixTQUFTLFlBQVk7QUFDckIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxVQUFVO0FBR2pCLElBQU0sbUJBQW1CLG9CQUFJLElBQUksQ0FBQyxRQUFRLE1BQU0sQ0FBQztBQUtsQyxTQUFSLGtCQUEyQztBQUNoRCxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUVULE1BQU0sVUFBVSxNQUFjLElBQVk7QUFDeEMsVUFBSTtBQUVGLFlBQ0UsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDLEtBQ3RDLEdBQUcsU0FBUyxjQUFjO0FBRTFCLGlCQUFPO0FBRVQsY0FBTSxNQUFNLE1BQU0sTUFBTTtBQUFBLFVBQ3RCLFlBQVk7QUFBQSxVQUNaLFNBQVMsQ0FB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
