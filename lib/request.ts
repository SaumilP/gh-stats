import { randomUUID } from "node:crypto";
import { requestContext } from "./context";

export function requestIdFrom(req: any) {
  const context = requestContext.getStore();
  if (context) return context.requestId;
  const existing = req?.headers?.["x-request-id"];
  if (typeof existing === "string" && existing.trim()) return existing.trim().slice(0, 80);
  return randomUUID();
}
