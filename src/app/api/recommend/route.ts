import { NextRequest } from "next/server";
import { discoverByMood } from "@/lib/tmdb";
import { getAnimeByMood } from "@/lib/jikan";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood");
  if (!mood) {
    return Response.json({ items: [] });
  }

  try {
    const [tmdbItems, animeItems] = await Promise.all([
      discoverByMood(mood),
      getAnimeByMood(mood),
    ]);
    const items = [...tmdbItems, ...animeItems];
    return Response.json({ items });
  } catch (e) {
    console.error("Recommend API error:", e);
    return Response.json({ items: [] });
  }
}
