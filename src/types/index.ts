// Media (movies & TV from TMDB)
export interface MediaItem {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  mediaType: "movie" | "tv";
  genreIds?: number[];
}

// Anime (from Jikan)
export interface AnimeItem {
  malId: number;
  title: string;
  synopsis: string;
  images: {
    jpg: { imageUrl: string };
    webp?: { imageUrl: string };
  };
  score: number;
  year?: number;
  genres?: { name: string }[];
}

// Unified recommendation card
export type RecommendationItem = (MediaItem & { source: "tmdb" }) | (AnimeItem & { source: "jikan" });

// Mood/situation for selection
export interface MoodOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

// Chat message
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Unified API response shape (TMDB + Jikan)
export interface UnifiedRecommendation {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number | null;
  type: "movie" | "tv" | "anime";
  overview: string;
}
