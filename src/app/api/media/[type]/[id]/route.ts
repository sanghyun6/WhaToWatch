import { getMovieDetails, getTvDetails } from "@/lib/tmdb";
import { getAnimeDetails } from "@/lib/jikan";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400 });
  }

  try {
    if (type === "movie") {
      const data = await getMovieDetails(numId);
      return Response.json(data);
    }
    if (type === "tv") {
      const data = await getTvDetails(numId);
      return Response.json(data);
    }
    if (type === "anime") {
      const data = await getAnimeDetails(numId);
      return Response.json(data);
    }
    return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
