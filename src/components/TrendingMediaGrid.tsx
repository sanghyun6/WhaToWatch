"use client";

import { useState, useEffect, useCallback } from "react";
import type { UnifiedRecommendation } from "@/types";
import { MovieCard } from "./MovieCard";
import { MediaModal } from "./MediaModal";

interface TrendingMediaGridProps {
  items: UnifiedRecommendation[];
}

export function TrendingMediaGrid({ items: initialItems }: TrendingMediaGridProps) {
  const [selectedItem, setSelectedItem] = useState<UnifiedRecommendation | null>(null);
  const [items, setItems] = useState<UnifiedRecommendation[]>(initialItems);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(true);
  }, [initialItems]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    document.body.style.overflow = "hidden";
    const scrollY = window.scrollY;
    const handleScroll = () => window.scrollTo(0, scrollY);
    window.addEventListener("scroll", handleScroll);

    const unlock = () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "";
      setIsLoading(false);
    };

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/trending?page=${nextPage}`);
      const { items: newItems } = await res.json();
      if (newItems.length === 0) {
        setHasMore(false);
        setTimeout(unlock, 100);
        return;
      }
      setItems((prev) => [...prev, ...newItems]);
      setPage(nextPage);
      setTimeout(unlock, 100);
    } catch {
      setHasMore(false);
      setTimeout(unlock, 100);
    }
  }, [page, isLoading, hasMore]);

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((item, i) => (
          <div
            key={`${item.type}-${item.id}`}
            className="animate-slide-up"
            style={{ animationDelay: `${Math.min(700 + i * 50, 1500)}ms` }}
          >
            <MovieCard item={item} onClick={setSelectedItem} />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl border-2 border-foreground/20 bg-surface-muted/50 px-8 py-4 font-display font-semibold text-foreground transition-colors hover:border-foreground/40 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
      <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
