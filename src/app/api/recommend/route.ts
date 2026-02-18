import { NextRequest } from "next/server";
import { discoverByMood } from "@/lib/tmdb";
import { getAnimeByMood } from "@/lib/jikan";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood");
  console.log("[Recommend API] mood param:", mood);

  if (!mood) {
    console.log("[Recommend API] No mood param, returning empty");
    return Response.json({ items: [], error: "No mood parameter" });
  }

  // Pick by Mood uses TMDB_API_KEY (not GEMINI_API_KEY)
  const tmdbKey = process.env.TMDB_API_KEY;
  console.log("[Recommend API] TMDB_API_KEY set:", !!tmdbKey, "format check:", tmdbKey?.startsWith("AIza") ? "WARNING: looks like Google/Gemini key - TMDB keys are different!" : "OK");

  try {
    const [tmdbItems, animeItems] = await Promise.all([
      discoverByMood(mood),
      getAnimeByMood(mood),
    ]);
    const items = [...tmdbItems, ...animeItems];
    console.log("[Recommend API] Success - tmdb:", tmdbItems.length, "anime:", animeItems.length, "total:", items.length);
    return Response.json({ items });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("[Recommend API] Error:", errMsg, e);
    return Response.json({ items: [], error: errMsg });
  }
}
