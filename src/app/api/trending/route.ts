import { NextRequest } from "next/server";
import { getTrendingMovies, getTrendingTv } from "@/lib/tmdb";
import { getTopAnimePage } from "@/lib/jikan";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  try {
    const [movies, tv, anime] = await Promise.all([
      getTrendingMovies(page),
      getTrendingTv(page),
      getTopAnimePage(page),
    ]);

    const allItems = [...movies, ...tv, ...anime];
    const items = allItems.slice(0, 12); // 12 items per page (2 rows of 6)

    return Response.json({ items });
  } catch {
    return Response.json({ items: [] });
  }
}
