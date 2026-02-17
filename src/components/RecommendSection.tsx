"use client";

import { useState } from "react";
import type { MoodOption, UnifiedRecommendation } from "@/types";
import { MoodSelector } from "./MoodSelector";
import { RecommendationGrid } from "./RecommendationGrid";

export function RecommendSection() {
  const [items, setItems] = useState<UnifiedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindRecommendations = async (mood: MoodOption) => {
    setIsLoading(true);
    setItems([]);
    try {
      const res = await fetch(`/api/recommend?mood=${encodeURIComponent(mood.id)}`);
      const { items: newItems } = await res.json();
      setItems(newItems ?? []);
    } catch {
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
          <RecommendationGrid items={items} isLoading={isLoading} />
        </div>
      </section>
    </>
  );
}
