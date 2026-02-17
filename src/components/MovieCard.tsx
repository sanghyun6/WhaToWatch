import type { UnifiedRecommendation } from "@/types";

interface MovieCardProps {
  item: UnifiedRecommendation;
  onClick?: (item: UnifiedRecommendation) => void;
}

function typeLabel(type: UnifiedRecommendation["type"]): string {
  switch (type) {
    case "movie":
      return "Movie";
    case "tv":
      return "TV";
    case "anime":
      return "Anime";
  }
}

export function MovieCard({ item, onClick }: MovieCardProps) {
  const Wrapper = onClick ? "button" : "article";
  const wrapperProps = onClick
    ? { type: "button" as const, onClick: () => onClick(item), className: "w-full text-left" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group relative overflow-hidden rounded-xl border border-foreground/10 bg-surface-muted/30 transition-all hover:border-foreground/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-muted">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            No image
          </div>
        )}

        {/* Hover overlay with overview */}
        <div
          className="absolute inset-0 flex origin-bottom flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 transition-all duration-300 ease-out group-hover:opacity-100"
          aria-hidden
        >
          <p className="max-h-[60%] px-4 pb-4 pt-8 text-sm leading-relaxed text-white/95 line-clamp-6">
            {item.overview || "No overview available."}
          </p>
        </div>

        {/* Type badge - top left */}
        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {typeLabel(item.type)}
        </span>
      </div>

      <div className="p-3">
        <h3 className="font-display text-sm font-semibold text-foreground line-clamp-2">
          {item.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
          {item.rating > 0 && (
            <span className="flex items-center gap-0.5">
              <span className="text-amber-500" aria-hidden>
                ★
              </span>
              {item.rating.toFixed(1)}
            </span>
          )}
          {item.year != null && <span>{item.year}</span>}
        </div>
      </div>
    </Wrapper>
  );
}
