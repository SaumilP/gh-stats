import { createHash } from "node:crypto";

export function sha256Hex(body: string | Buffer) {
  return createHash("sha256").update(body).digest("hex");
}

