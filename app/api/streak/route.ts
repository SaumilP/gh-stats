import handler from "../../../.legacy/streak";
import { cardRoute } from "@/lib/route";
export const maxDuration = 30;
export const GET = cardRoute("streak", handler);
