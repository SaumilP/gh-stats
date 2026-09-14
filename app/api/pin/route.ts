import handler from "../../../.legacy/pin";
import { cardRoute } from "@/lib/route";
export const maxDuration = 30;
export const GET = cardRoute("pin", handler);
