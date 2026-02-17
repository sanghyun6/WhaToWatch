"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { UnifiedRecommendation } from "@/types";

interface MediaDetails {
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

const IMAGE_BASE = "https://image.tmdb.org/t/p/w92";

interface MediaModalProps {
  item: UnifiedRecommendation | null;
  onClose: () => void;
}

export function MediaModal({ item, onClose }: MediaModalProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    if (!item) return;
    setIsEntered(false);
    const t = setTimeout(() => setIsEntered(true), 10);
    return () => clearTimeout(t);
  }, [item]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    if (!item) return;

    setLoading(true);
    setError(null);
    setDetails(null);
    setIsClosing(false);

    const type = item.type === "anime" ? "anime" : item.type === "tv" ? "tv" : "movie";
    fetch(`/api/media/${type}/${item.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setDetails)
      .catch(() => setError("Could not load details."))
      .finally(() => setLoading(false));
  }, [item]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (item) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, handleClose]);

  if (!item) return null;

  const showContent = !loading && !error && details;

  const isVisible = isEntered && !isClosing;

  const modal = (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50"
      style={{ position: "fixed", inset: 0, zIndex: 50 }}
    >
      {/* Overlay - covers entire viewport */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden
      />

      {/* Content - centered, max-height 90vh, scrollable */}
      <div
        className={`fixed top-1/2 left-1/2 z-[60] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-foreground/10 bg-surface shadow-2xl -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-foreground transition-colors hover:bg-surface-muted/80 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center p-8">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-muted">
            <p>{error}</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent/90"
            >
              Close
            </button>
          </div>
        )}

        {showContent && details && (
          <div className="p-6 pb-8">
            <h2 id="modal-title" className="pr-12 font-display text-2xl font-bold text-foreground sm:text-3xl">
              {details.title}
            </h2>

            {/* Trailer */}
            {details.trailerKey && (
              <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=0`}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}

            {/* Genre tags */}
            {details.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {details.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-lg bg-accent/15 px-3 py-1 text-sm font-medium text-accent"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {details.overview && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground">Overview</h3>
                <p className="mt-1 text-muted leading-relaxed">{details.overview}</p>
              </div>
            )}

            {/* Director & Cast (TMDB only) */}
            {(details.director || details.cast.length > 0) && (
              <div className="mt-4">
                {details.director && (
                  <p className="text-sm text-muted">
                    <span className="font-medium text-foreground">Director:</span> {details.director}
                  </p>
                )}
                {details.cast.length > 0 && (
                  <p className="mt-1 text-sm text-muted">
                    <span className="font-medium text-foreground">Cast:</span>{" "}
                    {details.cast.map((c) => (c.character ? `${c.name} (${c.character})` : c.name)).join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Where to watch (US) */}
            {(details.watchProviders.flatrate?.length ?? 0) + (details.watchProviders.rent?.length ?? 0) > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground">Where to watch (US)</h3>
                <div className="mt-2 flex flex-wrap gap-3">
                  {details.watchProviders.flatrate?.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-surface-muted/50 px-3 py-2"
                    >
                      {p.logoPath && (
                        <img
                          src={`${IMAGE_BASE}${p.logoPath}`}
                          alt=""
                          className="h-6 w-6 rounded object-contain"
                        />
                      )}
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                      <span className="text-xs text-muted">Stream</span>
                    </div>
                  ))}
                  {details.watchProviders.rent?.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-surface-muted/50 px-3 py-2"
                    >
                      {p.logoPath && (
                        <img
                          src={`${IMAGE_BASE}${p.logoPath}`}
                          alt=""
                          className="h-6 w-6 rounded object-contain"
                        />
                      )}
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                      <span className="text-xs text-muted">Rent</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">Data by JustWatch</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
