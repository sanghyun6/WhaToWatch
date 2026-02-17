"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(true);
  }, [initialItems]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/trending?page=${nextPage}`);
      const { items: newItems } = await res.json();
      if (newItems.length === 0) {
        setHasMore(false);
        return;
      }
      setItems((prev) => [...prev, ...newItems]);
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: "200px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

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
      <div ref={sentinelRef} className="h-4" aria-hidden />
      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}
      <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
