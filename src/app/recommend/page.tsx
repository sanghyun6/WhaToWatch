import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RecommendSection } from "@/components/RecommendSection";

export default function RecommendPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-foreground/10 bg-surface/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          WhaToWatch
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="text-sm font-medium text-muted transition-colors duration-300 ease-out hover:text-foreground"
          >
            Chat with AI
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            How are you feeling?
          </h2>
          <p className="mt-1 text-muted">
            Select a mood or situation to get tailored recommendations.
          </p>
          <RecommendSection />
        </section>
      </main>
    </div>
  );
}
