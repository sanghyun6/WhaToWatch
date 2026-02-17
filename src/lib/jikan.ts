/**
 * Jikan API client (anime).
 * Uses /anime endpoint with genre filtering.
 */

import type { UnifiedRecommendation } from "@/types";
import { getGenresForMood } from "./moodGenres";

const JIKAN_BASE = "https://api.jikan.moe/v4";

interface JikanAnimeResult {
  mal_id: number;
  title: string;
  synopsis: string | null;
  images: {
    jpg: { image_url: string };
    webp?: { image_url: string };
  };
  score: number;
  year: number | null;
 aired?: { from: string | null };
}

interface JikanPaginationResponse {
  data: JikanAnimeResult[];
  pagination: { last_visible_page: number };
}

function mapAnimeToUnified(a: JikanAnimeResult): UnifiedRecommendation {
  const year =
    a.year ??
    (a.aired?.from ? parseInt(a.aired.from.slice(0, 4), 10) : null);
  return {
    id: a.mal_id,
    title: a.title,
    posterUrl: a.images.jpg.image_url ?? "/placeholder-poster.svg",
    rating: a.score ?? 0,
    year,
    type: "anime",
    overview: a.synopsis ?? "",
  };
}

export interface AnimeByGenreParams {
  genreIds: number[];
  page?: number;
}

/**
 * Fetch anime by genre IDs (MAL genre IDs).
 * Uses Jikan v4 /anime endpoint with genres filter.
 */
export async function getAnimeByGenres(
  params: AnimeByGenreParams
): Promise<UnifiedRecommendation[]> {
  const { genreIds, page = 1 } = params;
  if (genreIds.length === 0) return [];

  const params_ = new URLSearchParams({
    genres: genreIds.join(","),
    page: String(page),
    limit: "20",
  });

  const res = await fetch(`${JIKAN_BASE}/anime?${params_.toString()}`);
  if (!res.ok) {
    throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
  }

  const data: JikanPaginationResponse = await res.json();
  return data.data.map(mapAnimeToUnified);
}

/**
 * Fetch anime for a mood using mood-to-genre mapping from lib/moodGenres.
 */
export async function getAnimeByMood(
  moodId: string,
  page = 1
): Promise<UnifiedRecommendation[]> {
  const mapping = getGenresForMood(moodId);
  if (!mapping) return [];

  return getAnimeByGenres({ genreIds: mapping.jikan, page });
}

/**
 * Fetch top anime (popular). For landing / discovery.
 */
export async function getTopAnime(limit = 10): Promise<UnifiedRecommendation[]> {
  const res = await fetch(`${JIKAN_BASE}/top/anime?limit=${limit}`);
  if (!res.ok) return [];
  const data: JikanPaginationResponse = await res.json();
  return data.data.map(mapAnimeToUnified);
}

/**
 * Fetch top anime by page. For infinite scroll.
 */
export async function getTopAnimePage(page = 1): Promise<UnifiedRecommendation[]> {
  const res = await fetch(`${JIKAN_BASE}/top/anime?page=${page}&limit=25`);
  if (!res.ok) return [];
  const data: JikanPaginationResponse = await res.json();
  return data.data.map(mapAnimeToUnified);
}

/**
 * Anime details for modal (trailer, genres, synopsis).
 * Jikan has no director/cast/watch providers like TMDB.
 */
export interface AnimeDetails {
  id: number;
  title: string;
  overview: string;
  genres: { id: number; name: string }[];
  trailerKey: string | null;
  director: null;
  cast: { name: string; character?: string }[];
  watchProviders: { flatrate?: never[]; rent?: never[] };
}

export async function getAnimeDetails(id: number): Promise<AnimeDetails> {
  const res = await fetch(`${JIKAN_BASE}/anime/${id}/full`);
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
  const { data } = await res.json();

  const trailer = data.trailer?.youtube_id ?? null;
  const genres = data.genres?.map((g: { mal_id: number; name: string }) => ({ id: g.mal_id, name: g.name })) ?? [];

  return {
    id: data.mal_id,
    title: data.title,
    overview: data.synopsis ?? "",
    genres,
    trailerKey: trailer,
    director: null,
    cast: [],
    watchProviders: {},
  };
}
