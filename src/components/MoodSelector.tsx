"use client";

import { useState } from "react";
import type { MoodOption } from "@/types";

const DEFAULT_MOODS: MoodOption[] = [
  { id: "rainy", label: "Rainy day", icon: "🌧️" },
  { id: "cry", label: "Need a good cry", icon: "😢" },
  { id: "hype", label: "Hype me up", icon: "🔥" },
  { id: "date", label: "Date night", icon: "💕" },
  { id: "sleepless", label: "Can't sleep", icon: "🌙" },
  { id: "adventure", label: "Feel like an adventure", icon: "🗺️" },
  { id: "funny", label: "Something funny", icon: "😂" },
  { id: "mindblowing", label: "Mind-blowing", icon: "🤯" },
];

interface MoodSelectorProps {
  selectedId?: string;
  onSelect?: (mood: MoodOption) => void;
  onFindRecommendations?: (mood: MoodOption) => void;
  moods?: MoodOption[];
}

export function MoodSelector({
  selectedId: controlledSelectedId,
  onSelect,
  onFindRecommendations,
  moods = DEFAULT_MOODS,
}: MoodSelectorProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>();
  const selectedId = controlledSelectedId ?? internalSelectedId;

  const handleSelect = (mood: MoodOption) => {
    console.log("Selected mood:", mood);
    if (controlledSelectedId === undefined) {
      setInternalSelectedId(mood.id);
    }
    onSelect?.(mood);
  };

  const selectedMood = moods.find((m) => m.id === selectedId);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {moods.map((mood) => {
          const isSelected = selectedId === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => handleSelect(mood)}
              className={`
                flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-5
                font-sans text-sm font-medium
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface
                hover:-translate-y-1 hover:shadow-lg
                active:scale-[0.98]
                ${
                  isSelected
                    ? "border-accent bg-accent/10 text-accent shadow-md shadow-accent/20 ring-2 ring-accent/30"
                    : "border-foreground/15 bg-surface-muted/50 text-foreground hover:border-foreground/25 hover:bg-surface-muted dark:border-foreground/20 dark:bg-surface-muted/80 dark:hover:border-foreground/30"
                }
              `}
            >
              {mood.icon && (
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {mood.icon}
                </span>
              )}
              <span className="text-center">{mood.label}</span>
            </button>
          );
        })}
      </div>

      {selectedMood && (
        <div className="mt-8 flex animate-slide-up justify-center">
          <button
            type="button"
            onClick={() => {
              console.log("Find recommendations button clicked, mood:", selectedMood);
              onFindRecommendations?.(selectedMood);
            }}
            className="rounded-xl bg-accent px-8 py-4 font-display text-lg font-semibold text-white shadow-lg transition-[color,background-color,box-shadow,transform] duration-300 ease-out hover:bg-accent/90 hover:shadow-xl active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
          >
            Find recommendations
          </button>
        </div>
      )}
    </div>
  );
}
