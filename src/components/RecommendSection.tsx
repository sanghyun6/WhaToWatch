"use client";

import { useState } from "react";
import type { MoodOption, UnifiedRecommendation } from "@/types";
import { MoodSelector } from "./MoodSelector";
import { RecommendationGrid } from "./RecommendationGrid";

export function RecommendSection() {
  const [items, setItems] = useState<UnifiedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindRecommendations = async (mood: MoodOption) => {
    console.log("[RecommendSection] Find recommendations clicked, mood:", mood);
    setIsLoading(true);
    setItems([]);
    setError(null);
    try {
      const url = `/api/recommend?mood=${encodeURIComponent(mood.id)}`;
      console.log("[RecommendSection] Fetching:", url);
      const res = await fetch(url);
      const data = await res.json();
      const newItems = data?.items ?? [];
      const apiError = data?.error;
      console.log("[RecommendSection] API response - status:", res.status, "items:", newItems.length, "error:", apiError, "data:", data);
      if (apiError) {
        setError(apiError);
        setItems([]);
      } else {
        setItems(newItems);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[RecommendSection] Fetch error:", msg, err);
      setError(msg);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mt-6">
        <MoodSelector onFindRecommendations={handleFindRecommendations} />
      </div>
      <section className="mt-12">
        <h3 className="font-display text-xl font-semibold text-foreground">
          For you
        </h3>
        <div className="mt-4">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <p className="font-medium">Recommendation error</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-xs opacity-80">
                Pick by Mood uses TMDB (movies/TV) and Jikan (anime). Add a valid TMDB_API_KEY from{" "}
                <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="underline">
                  themoviedb.org
                </a>
              </p>
            </div>
          )}
          <RecommendationGrid items={items} isLoading={isLoading} />
        </div>
      </section>
    </>
  );
}
