import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-foreground/10 bg-surface px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          WhaToWatch
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/recommend"
            className="text-sm font-medium text-muted transition-colors duration-300 ease-out hover:text-foreground"
          >
            Pick by mood
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-3xl flex-1">
          <h1 className="mb-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Chat with AI
          </h1>
          <p className="mb-6 text-muted">
            Describe what you want to watch and get personalized recommendations.
          </p>
          <div className="h-[min(60vh,600px)]">
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  );
}
