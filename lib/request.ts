import { randomUUID } from "node:crypto";

export function requestIdFrom(req: any) {
  const existing = req?.headers?.["x-request-id"];
  if (typeof existing === "string" && existing.trim()) return existing.trim().slice(0, 80);
  return randomUUID();
}

