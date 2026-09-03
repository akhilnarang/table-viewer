// Cloudflare Pages Function: GET /proxy?url=<https://...>
// This function is optional. The page first tries to get the file directly.
// The page calls this function only when the remote site blocks cross-origin requests.
// If you do not need such links, delete this file.

const MAX_BYTES = 100 * 1024 * 1024;

// Hosts that the function must not fetch. Cloudflare blocks most of these already.
const BLOCKED_HOST = /^(localhost|.*\.local|.*\.internal|\[?::1\]?|\[?f[cd][0-9a-f]{2}:.*\]?|\[?fe80:.*\]?|127\..*|10\..*|192\.168\..*|169\.254\..*|172\.(1[6-9]|2\d|3[01])\..*|0\..*)$/i;

function sameSite(request, reqUrl) {
  // The browser sets Sec-Fetch-Site for fetch() calls. Origin and Referer are the fallback.
  if (request.headers.get("Sec-Fetch-Site") === "same-origin") return true;
  for (const name of ["Origin", "Referer"]) {
    const value = request.headers.get(name);
    if (!value) continue;
    try { if (new URL(value).host === reqUrl.host) return true; } catch { /* not a URL */ }
  }
  return false;
}

// Pass the body through, but stop after MAX_BYTES. This also covers chunked responses.
function limitBytes(body, max) {
  let seen = 0;
  return body.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      seen += chunk.byteLength;
      if (seen > max) controller.error(new Error("file too large"));
      else controller.enqueue(chunk);
    },
  }));
}

export async function onRequestGet({ request }) {
  const reqUrl = new URL(request.url);
  const target = reqUrl.searchParams.get("url") || "";

  let targetUrl;
  try { targetUrl = new URL(target); } catch { return new Response("url is not valid", { status: 400 }); }
  if (!/^https?:$/.test(targetUrl.protocol)) return new Response("url must be http(s)", { status: 400 });
  if (BLOCKED_HOST.test(targetUrl.hostname)) return new Response("host not permitted", { status: 400 });
  if (!sameSite(request, reqUrl)) return new Response("forbidden", { status: 403 });

  let upstream;
  try {
    upstream = await fetch(targetUrl.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; table-viewer/1.0)", Accept: "*/*" },
      redirect: "follow",
      cf: { cacheTtl: 300 },
    });
  } catch (e) {
    return new Response(`fetch failed: ${e.message}`, { status: 502 });
  }
  if (!upstream.ok) {
    // Some status codes do not permit a body. Report those as 502.
    const status = upstream.status >= 400 ? upstream.status : 502;
    return new Response(`upstream returned ${upstream.status}`, { status });
  }
  const len = Number(upstream.headers.get("Content-Length") || 0);
  if (len > MAX_BYTES) return new Response("file too large", { status: 413 });

  // Always send the data as a download, never as a page. The page reads the real type from X-Upstream-Type.
  return new Response(upstream.body ? limitBytes(upstream.body, MAX_BYTES) : null, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": "attachment",
      "X-Content-Type-Options": "nosniff",
      "X-Upstream-Type": (upstream.headers.get("Content-Type") || "").replace(/[^\x20-\x7e]/g, ""),
      "X-Final-Url": encodeURI(upstream.url),
      "Access-Control-Expose-Headers": "X-Final-Url, X-Upstream-Type",
      "Cache-Control": "no-store",
    },
  });
}
