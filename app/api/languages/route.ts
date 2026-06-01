import handler from "../../../api/languages";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const req = { query: Object.fromEntries(url.searchParams), headers: request.headers };
  const headers: Record<string, string> = {};
  let body = "";
  const res = { statusCode: 200, setHeader: (k: string, v: string) => { headers[k] = v; }, end: (d: string) => { body = d; } };
  await handler(req, res);
  return new Response(body, { status: res.statusCode, headers: { ...headers, "Content-Type": headers["Content-Type"] || "text/html" } });
}
