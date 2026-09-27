// A fixed upstream keeps browser requests on the website's own HTTPS origin.
// API_INTERNAL_URL is a server-only setting, never a client-supplied destination.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BODY_BYTES = 64 * 1024;
const noCache = { "Cache-Control": "no-store" };

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const configured = process.env.API_INTERNAL_URL ||
    (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:8000" : "");
  if (!configured) {
    return Response.json({ detail: "Service unavailable" }, { status: 503, headers: noCache });
  }

  try {
    const upstream = new URL(configured);
    if (!["http:", "https:"].includes(upstream.protocol) || upstream.pathname !== "/" || upstream.search || upstream.hash) {
      return Response.json({ detail: "Service unavailable" }, { status: 503, headers: noCache });
    }
    const { path } = await context.params;
    if (path.some(segment => segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\"))) {
      return Response.json({ detail: "Invalid path" }, { status: 400, headers: noCache });
    }
    upstream.pathname = `/api/${path.map(encodeURIComponent).join("/")}`;
    upstream.search = new URL(request.url).search;

    const headers = new Headers({ Accept: "application/json" });
    for (const name of ["Authorization", "Content-Type"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    const hasBody = !["GET", "HEAD"].includes(request.method);
    const body = hasBody ? await request.arrayBuffer() : undefined;
    if (body && body.byteLength > MAX_BODY_BYTES) {
      return Response.json({ detail: "Request too large" }, { status: 413, headers: noCache });
    }
    const result = await fetch(upstream, {
      method: request.method, headers, body,
      redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(12000),
    });
    // Never redirect a browser (or its bearer token) to an upstream origin.
    if (result.status >= 300 && result.status < 400) {
      return Response.json({ detail: "Service unavailable" }, { status: 502, headers: noCache });
    }
    const responseHeaders = new Headers(noCache);
    for (const name of ["Content-Type", "WWW-Authenticate", "Retry-After"]) {
      const value = result.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(request.method === "HEAD" || [204, 304].includes(result.status) ? null : result.body, {
      status: result.status, headers: responseHeaders,
    });
  } catch {
    return Response.json({ detail: "Cannot reach the service. Please try again." }, { status: 502, headers: noCache });
  }
}

export { proxy as GET, proxy as HEAD, proxy as POST, proxy as PATCH, proxy as DELETE, proxy as OPTIONS };
