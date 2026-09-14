import handler from "../../../.legacy/stats";
import { cardRoute } from "@/lib/route";
export const maxDuration = 30;
export const GET = cardRoute("stats", handler);
