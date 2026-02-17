"use client";

import { useState } from "react";
import type { UnifiedRecommendation } from "@/types";
import { MovieCard } from "./MovieCard";
import { MediaModal } from "./MediaModal";

type TypeFilter = "all" | "movie" | "tv" | "anime";

const FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
  { value: "anime", label: "Anime" },
];

interface RecommendationGridProps {
  items: UnifiedRecommendation[];
  isLoading?: boolean;
}

function filterItems(items: UnifiedRecommendation[], filter: TypeFilter): UnifiedRecommendation[] {
  if (filter === "all") return items;
  return items.filter((item) => item.type === filter);
}

export function RecommendationGrid({ items, isLoading }: RecommendationGridProps) {
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [selectedItem, setSelectedItem] = useState<UnifiedRecommendation | null>(null);
  const filtered = filterItems(items, filter);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 flex gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled
              className="rounded-lg border border-foreground/20 bg-surface-muted/50 px-4 py-2 text-sm font-medium text-muted"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-xl bg-surface-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-foreground/20 bg-surface-muted/30 py-16 text-center text-muted">
        <p>No recommendations yet. Pick a mood or chat with AI to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.value;
          const count =
            opt.value === "all"
              ? items.length
              : items.filter((i) => i.type === opt.value).length;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface ${
                isActive
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-foreground/15 bg-surface-muted/50 text-foreground hover:border-foreground/25 hover:bg-surface-muted dark:border-foreground/20 dark:bg-surface-muted/80 dark:hover:border-foreground/30"
              }`}
            >
              {opt.label}
              <span className="ml-1.5 text-xs opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-foreground/20 bg-surface-muted/30 py-12 text-center text-muted">
          <p>No {filter === "all" ? "results" : filter === "movie" ? "movies" : filter === "tv" ? "TV shows" : "anime"} in this selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <MovieCard key={`${item.type}-${item.id}`} item={item} onClick={setSelectedItem} />
          ))}
        </div>
      )}
      <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
