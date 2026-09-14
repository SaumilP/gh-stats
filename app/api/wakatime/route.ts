import handler from "../../../.legacy/wakatime";
import { cardRoute } from "@/lib/route";
export const maxDuration = 30;
export const GET = cardRoute("wakatime", handler);
