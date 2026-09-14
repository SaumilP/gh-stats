import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  requestId: string;
  updatedAt?: number;
  stale?: boolean;
  error?: string;
  deadline: number;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function observeSnapshot(updatedAt: number, stale: boolean) {
  const context = requestContext.getStore();
  if (!context) return;
  context.updatedAt = Math.min(context.updatedAt ?? updatedAt, updatedAt);
  context.stale ||= stale;
}
