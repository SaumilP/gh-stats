import { exampleCard } from "@/lib/examples";
import { CARD_TYPES } from "@/lib/studio";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return CARD_TYPES.map(card => ({ card: `${card.id}.svg` })); }
export async function GET(_request: Request, { params }: { params: Promise<{ card: string }> }) {
  const { card } = await params;
  return new Response(exampleCard(card.replace(".svg", "")), { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });
}
