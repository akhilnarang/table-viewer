// Cloudflare Worker entry. Worker projects (wrangler.jsonc) use this file.
// It serves /proxy from src/proxy.js and everything else from the public/ directory.
import { proxy } from "./proxy.js";

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/proxy") return proxy(request);
    return env.ASSETS.fetch(request);
  },
};
