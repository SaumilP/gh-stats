export default function handler(_req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res
    .status(200)
    .send(JSON.stringify({ ok: true, service: "github-stats-vercel" }));
}
