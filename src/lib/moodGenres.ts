/**
 * Maps MoodSelector mood IDs to TMDB and Jikan genre IDs.
 * TMDB: /genre/movie/list and /genre/tv/list
 * Jikan: MAL genre IDs (https://myanimelist.net/anime.php?cat=anime&tag=1)
 */

export interface MoodGenreMapping {
  tmdbMovie: number[];
  tmdbTv: number[];
  jikan: number[];
}

// TMDB movie genres: Action=28, Adventure=12, Comedy=35, Drama=18, Horror=27,
// Romance=10749, Sci-Fi=878, Thriller=53, Mystery=9648, Fantasy=14
// TMDB TV genres: same IDs for most + Action&Adventure=10759, Sci-Fi&Fantasy=10765
// Jikan/MAL: Action=1, Adventure=2, Comedy=4, Drama=8, Fantasy=10, Horror=14,
// Mystery=7, Psychological=40, Romance=22, Sci-Fi=24, Slice of Life=36, Sports=30
export const MOOD_GENRE_MAP: Record<string, MoodGenreMapping> = {
  rainy: {
    tmdbMovie: [18, 10749], // Drama, Romance
    tmdbTv: [18, 10749],
    jikan: [8, 22, 36], // Drama, Romance, Slice of Life
  },
  cry: {
    tmdbMovie: [18, 10749], // Drama, Romance
    tmdbTv: [18, 10749],
    jikan: [8, 22], // Drama, Romance
  },
  hype: {
    tmdbMovie: [28, 12], // Action, Adventure
    tmdbTv: [10759, 35], // Action & Adventure, Comedy
    jikan: [1, 2, 30], // Action, Adventure, Sports
  },
  date: {
    tmdbMovie: [10749, 35], // Romance, Comedy
    tmdbTv: [10749, 35],
    jikan: [22, 4], // Romance, Comedy
  },
  sleepless: {
    tmdbMovie: [27, 53, 9648], // Horror, Thriller, Mystery
    tmdbTv: [9648, 10765], // Mystery, Sci-Fi & Fantasy
    jikan: [14, 7], // Horror, Mystery
  },
  adventure: {
    tmdbMovie: [12, 14, 28], // Adventure, Fantasy, Action
    tmdbTv: [10759, 10765], // Action & Adventure, Sci-Fi & Fantasy
    jikan: [2, 10, 1], // Adventure, Fantasy, Action
  },
  funny: {
    tmdbMovie: [35], // Comedy
    tmdbTv: [35],
    jikan: [4], // Comedy
  },
  mindblowing: {
    tmdbMovie: [878, 9648], // Sci-Fi, Mystery
    tmdbTv: [10765, 9648], // Sci-Fi & Fantasy, Mystery
    jikan: [24, 7, 40], // Sci-Fi, Mystery, Psychological
  },
};

export function getGenresForMood(moodId: string): MoodGenreMapping | null {
  return MOOD_GENRE_MAP[moodId] ?? null;
}
