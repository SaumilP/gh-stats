import handler from "../../../api/stats";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const req = {
    query: Object.fromEntries(url.searchParams),
    headers: request.headers,
  } as any;

  const headers: Record<string, string> = {};
  let body = "";
  let statusCode = 200;

  const res = {
    statusCode: 200,
    setHeader: (key: string, value: string) => {
      headers[key] = value;
    },
    end: (data?: string) => {
      if (data) body = data;
    },
    send: (data?: string | object) => {
      if (typeof data === "string") {
        body = data;
      } else {
        body = JSON.stringify(data);
      }
    },
  } as any;

  res.statusCode = statusCode;
  Object.defineProperty(res, 'statusCode', {
    set(value: number) { statusCode = value; },
    get() { return statusCode; },
  });

  try {
    await handler(req, res);
  } catch (error) {
    console.error('API error:', error);
    statusCode = 500;
    body = JSON.stringify({ error: 'Internal Server Error' });
  }

  return new Response(body, {
    status: statusCode,
    headers: {
      ...headers,
      "Content-Type": headers["Content-Type"] || "text/html",
    },
  });
}
