/**
 * TMDB API client (movies & TV shows).
 * Uses /discover/movie and /discover/tv with genre IDs and keywords.
 */

import type { UnifiedRecommendation } from "@/types";
import { getGenresForMood } from "./moodGenres";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set");
  }
  return key;
}

function getPosterUrl(path: string | null, size: "w92" | "w154" | "w342" | "w500" = "w342"): string {
  if (!path) return "/placeholder-poster.svg";
  return `${IMAGE_BASE}/${size}${path}`;
}

function mapMovieToUnified(m: TmdbMovieResult): UnifiedRecommendation {
  return {
    id: m.id,
    title: m.title,
    posterUrl: getPosterUrl(m.poster_path),
    rating: m.vote_average,
    year: m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : null,
    type: "movie",
    overview: m.overview ?? "",
  };
}

function mapTvToUnified(t: TmdbTvResult): UnifiedRecommendation {
  return {
    id: t.id,
    title: t.name,
    posterUrl: getPosterUrl(t.poster_path),
    rating: t.vote_average,
    year: t.first_air_date ? parseInt(t.first_air_date.slice(0, 4), 10) : null,
    type: "tv",
    overview: t.overview ?? "",
  };
}

interface TmdbMovieResult {
  id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface TmdbTvResult {
  id: number;
  name: string;
  overview: string | null;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
}

interface TmdbDiscoverResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
}

export interface DiscoverMoviesParams {
  genreIds: number[];
  keywordIds?: number[];
  page?: number;
}

export interface DiscoverTvParams {
  genreIds: number[];
  keywordIds?: number[];
  page?: number;
}

/**
 * Fetch movies by genre IDs and optional keyword IDs.
 * Uses pipe (OR) logic for genres to broaden results.
 */
export async function discoverMovies(params: DiscoverMoviesParams): Promise<UnifiedRecommendation[]> {
  const { genreIds, keywordIds, page = 1 } = params;
  if (genreIds.length === 0) return [];

  const key = getApiKey();
  const withGenres = genreIds.join("|");
  const params_ = new URLSearchParams({
    api_key: key,
    language: "en-US",
    sort_by: "popularity.desc",
    include_adult: "false",
    page: String(page),
    with_genres: withGenres,
  });
  if (keywordIds && keywordIds.length > 0) {
    params_.set("with_keywords", keywordIds.join("|"));
  }

  const res = await fetch(`${TMDB_BASE}/discover/movie?${params_.toString()}`);
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  const data: TmdbDiscoverResponse<TmdbMovieResult> = await res.json();
  return data.results.map(mapMovieToUnified);
}

/**
 * Fetch TV shows by genre IDs and optional keyword IDs.
 * Uses pipe (OR) logic for genres to broaden results.
 */
export async function discoverTv(params: DiscoverTvParams): Promise<UnifiedRecommendation[]> {
  const { genreIds, keywordIds, page = 1 } = params;
  if (genreIds.length === 0) return [];

  const key = getApiKey();
  const withGenres = genreIds.join("|");
  const params_ = new URLSearchParams({
    api_key: key,
    language: "en-US",
    sort_by: "popularity.desc",
    include_adult: "false",
    page: String(page),
    with_genres: withGenres,
  });
  if (keywordIds && keywordIds.length > 0) {
    params_.set("with_keywords", keywordIds.join("|"));
  }

  const res = await fetch(`${TMDB_BASE}/discover/tv?${params_.toString()}`);
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  const data: TmdbDiscoverResponse<TmdbTvResult> = await res.json();
  return data.results.map(mapTvToUnified);
}

/**
 * Fetch both movies and TV shows for a mood.
 * Uses mood-to-genre mapping from lib/moodGenres.
 */
export async function discoverByMood(
  moodId: string,
  page = 1
): Promise<UnifiedRecommendation[]> {
  const mapping = getGenresForMood(moodId);
  if (!mapping) return [];

  const [movies, tv] = await Promise.all([
    discoverMovies({ genreIds: mapping.tmdbMovie, page }),
    discoverTv({ genreIds: mapping.tmdbTv, page }),
  ]);

  return [...movies, ...tv];
}

/**
 * Fetch trending movies (day). For landing / discovery.
 */
export async function getTrendingMovies(page = 1): Promise<UnifiedRecommendation[]> {
  const key = getApiKey();
  const res = await fetch(
    `${TMDB_BASE}/trending/movie/day?api_key=${key}&language=en-US&page=${page}`
  );
  if (!res.ok) return [];
  const data: TmdbDiscoverResponse<TmdbMovieResult> = await res.json();
  return data.results.map(mapMovieToUnified);
}

/**
 * Fetch trending TV shows (day). For landing / discovery.
 */
export async function getTrendingTv(page = 1): Promise<UnifiedRecommendation[]> {
  const key = getApiKey();
  const res = await fetch(
    `${TMDB_BASE}/trending/tv/day?api_key=${key}&language=en-US&page=${page}`
  );
  if (!res.ok) return [];
  const data: TmdbDiscoverResponse<TmdbTvResult> = await res.json();
  return data.results.map(mapTvToUnified);
}

export { getPosterUrl };

/* --- Modal details --- */

export interface MediaDetails {
  id: number;
  title: string;
  overview: string;
  genres: { id: number; name: string }[];
  trailerKey: string | null;
  director: string | null;
  cast: { name: string; character?: string }[];
  watchProviders: {
    flatrate?: { id: number; name: string; logoPath: string }[];
    rent?: { id: number; name: string; logoPath: string }[];
  };
}

interface TmdbVideoResult {
  key: string;
  site: string;
  type: string;
}

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbCreditsCrew {
  job: string;
  name: string;
}

interface TmdbCreditsCast {
  name: string;
  character: string | null;
}

interface TmdbProvider {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
}

async function fetchTmdb<T>(path: string): Promise<T> {
  const key = getApiKey();
  const res = await fetch(
    `https://api.themoviedb.org/3${path}${path.includes("?") ? "&" : "?"}api_key=${key}&language=en-US`
  );
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

export async function getMovieDetails(id: number): Promise<MediaDetails> {
  const [movie, videos, credits, providers] = await Promise.all([
    fetchTmdb<{
      title: string;
      overview: string;
      genres: TmdbGenre[];
    }>(`/movie/${id}`),
    fetchTmdb<{ results: TmdbVideoResult[] }>(`/movie/${id}/videos`),
    fetchTmdb<{ crew: TmdbCreditsCrew[]; cast: TmdbCreditsCast[] }>(`/movie/${id}/credits`),
    fetchTmdb<{ results?: { US?: { flatrate?: TmdbProvider[]; rent?: TmdbProvider[] } } }>(
      `/movie/${id}/watch/providers`
    ),
  ]);

  const trailer = videos.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  const director = credits.crew?.find((c) => c.job === "Director")?.name ?? null;
  const cast = credits.cast?.slice(0, 5).map((c) => ({ name: c.name, character: c.character ?? undefined })) ?? [];
  const us = providers.results?.US;

  return {
    id,
    title: movie.title,
    overview: movie.overview ?? "",
    genres: movie.genres ?? [],
    trailerKey: trailer?.key ?? null,
    director,
    cast,
    watchProviders: {
      flatrate: us?.flatrate?.map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path ?? "",
      })),
      rent: us?.rent?.map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path ?? "",
      })),
    },
  };
}

export async function getTvDetails(id: number): Promise<MediaDetails> {
  const [tv, videos, credits, providers] = await Promise.all([
    fetchTmdb<{ name: string; overview: string; genres: TmdbGenre[] }>(`/tv/${id}`),
    fetchTmdb<{ results: TmdbVideoResult[] }>(`/tv/${id}/videos`),
    fetchTmdb<{ crew: TmdbCreditsCrew[]; cast: TmdbCreditsCast[] }>(`/tv/${id}/credits`),
    fetchTmdb<{ results?: { US?: { flatrate?: TmdbProvider[]; rent?: TmdbProvider[] } } }>(
      `/tv/${id}/watch/providers`
    ),
  ]);

  const trailer = videos.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  const director =
    credits.crew?.find((c) => c.job === "Director")?.name ??
    credits.crew?.find((c) => c.job === "Executive Producer")?.name ??
    null;
  const cast = credits.cast?.slice(0, 5).map((c) => ({ name: c.name, character: c.character ?? undefined })) ?? [];
  const us = providers.results?.US;

  return {
    id,
    title: tv.name,
    overview: tv.overview ?? "",
    genres: tv.genres ?? [],
    trailerKey: trailer?.key ?? null,
    director,
    cast,
    watchProviders: {
      flatrate: us?.flatrate?.map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path ?? "",
      })),
      rent: us?.rent?.map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path ?? "",
      })),
    },
  };
}
