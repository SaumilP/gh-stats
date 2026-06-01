import handler from "../../../.legacy/impact";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const req = { query: Object.fromEntries(url.searchParams), headers: request.headers };
    const headers: Record<string, string> = {};
    let body = "";
    const res = { statusCode: 200, setHeader: (k: string, v: string) => { headers[k] = v; }, end: (d: string) => { body = d; } };
    await handler(req, res);
    return new Response(body, { status: res.statusCode, headers: { ...headers, "Content-Type": headers["Content-Type"] || "image/svg+xml" } });
  } catch (error: any) {
    console.error("Error in /impact:", error);
    return new Response(`Error: ${error.message}`, { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
