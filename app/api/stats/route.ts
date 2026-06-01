import handler from "../../../api/stats";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const req = {
    query: Object.fromEntries(url.searchParams),
    headers: request.headers,
  };

  const headers: Record<string, string> = {};
  let body = "";

  const res = {
    statusCode: 200,
    setHeader: (key: string, value: string) => {
      headers[key] = value;
    },
    end: (data: string) => {
      body = data;
    },
  };

  await handler(req, res);

  return new Response(body, {
    status: res.statusCode,
    headers: {
      ...headers,
      "Content-Type": headers["Content-Type"] || "text/html",
    },
  });
}
