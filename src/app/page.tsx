import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrendingMediaGrid } from "@/components/TrendingMediaGrid";
import type { UnifiedRecommendation } from "@/types";
import { getTrendingMovies, getTrendingTv } from "@/lib/tmdb";
import { getTopAnime } from "@/lib/jikan";

async function getTrending(): Promise<UnifiedRecommendation[]> {
  try {
    const [movies, tv, anime] = await Promise.all([
      getTrendingMovies(1),
      getTrendingTv(1),
      getTopAnime(20),
    ]);
    const combined = [...movies, ...tv, ...anime];
    return combined.slice(0, 12); // 2 rows of 6
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const trending = await getTrending();

  return (
    <div className="relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 bg-surface" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,hsl(var(--accent)/0.12),transparent_50%)]" />
      <div className="fixed bottom-0 left-0 right-0 h-2/5 -z-10 bg-gradient-to-t from-surface-muted/40 to-transparent pointer-events-none" />

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-foreground/5 bg-surface/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          WhaToWatch
        </Link>
        <ThemeToggle />
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24 lg:pt-28">
          <h1
            className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl animate-fade-in"
            style={{ animationDelay: "0ms" }}
          >
            What to watch
            <br />
            <span className="bg-gradient-to-r from-accent via-purple-400 to-accent bg-clip-text text-transparent">
              when you don’t know
            </span>
          </h1>
          <p
            className="mx-auto mt-8 max-w-2xl text-lg text-muted sm:text-xl animate-slide-up"
            style={{ animationDelay: "150ms" }}
          >
            Pick your mood, or Ask AI.
          </p>
          <p
            className="mx-auto mt-2 text-muted animate-slide-up sm:text-lg"
            style={{ animationDelay: "150ms" }}
          >
            Movies, TV, and anime—personalized for you.
          </p>

          {/* CTAs */}
          <div
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/chat"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-display text-lg font-semibold text-white shadow-lg shadow-accent/25 transition-[color,background-color,box-shadow,transform,border-color] duration-300 ease-out hover:bg-accent/90 hover:shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface sm:w-auto"
            >
              Ask AI
            </Link>
            <Link
              href="/recommend"
              className="inline-flex w-full items-center justify-center rounded-xl border-2 border-foreground/20 bg-surface-muted/50 px-8 py-4 font-display text-lg font-semibold text-foreground backdrop-blur-sm transition-[color,background-color,border-color,transform] duration-300 ease-out hover:border-foreground/40 hover:bg-surface-muted hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface sm:w-auto"
            >
              Pick by mood
            </Link>
          </div>
        </section>

        {/* Trending grid */}
        <section
          className="px-4 py-16 sm:px-6 lg:px-8 animate-slide-up-slow"
          style={{ animationDelay: "600ms" }}
        >
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Trending now
          </h2>
          <p className="mt-1 text-muted">
            Movies, TV, and anime people are watching.
          </p>

          {trending.length > 0 ? (
            <div className="mt-8">
              <TrendingMediaGrid items={trending} />
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-foreground/20 bg-surface-muted/30 py-16 text-center text-muted">
              <p className="text-sm">
                Connect TMDB and Jikan API keys in .env to see trending titles.
              </p>
              <Link
                href="/recommend"
                className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
              >
                Pick by mood instead →
              </Link>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-foreground/10 py-8 text-center text-sm text-muted">
        <p>WhaToWatch – Find your next watch.</p>
        <p className="mt-1">
          Movies & TV via TMDB · Anime via Jikan · AI by Gemini
        </p>
      </footer>
    </div>
  );
}
