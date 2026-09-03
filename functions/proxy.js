// Cloudflare Pages Function for GET /proxy. Pages projects use this file.
// Worker projects use src/worker.js instead. The logic is in src/proxy.js.
import { proxy } from "../src/proxy.js";

export const onRequestGet = ({ request }) => proxy(request);
