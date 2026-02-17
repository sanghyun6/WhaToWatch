"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatRecCard {
  title: string;
  year: string;
  type: "movie" | "tv" | "anime";
  reason: string;
}

type DisplaySegment =
  | { type: "text"; content: string }
  | { type: "rec"; card: ChatRecCard };

function parseStreamedContent(buffer: string): { segments: DisplaySegment[]; remaining: string } {
  const segments: DisplaySegment[] = [];
  const recRegex = /\[REC\]([\s\S]+?)\[\/REC\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = recRegex.exec(buffer)) !== null) {
    const textBefore = buffer.slice(lastIndex, match.index).trim();
    if (textBefore) {
      segments.push({ type: "text", content: textBefore });
    }
    const inner = match[1];
    const parts = inner.split("###");
    const title = parts[0]?.trim() ?? "";
    const year = parts[1]?.trim() ?? "N/A";
    const rawType = (parts[2]?.trim() ?? "movie").toLowerCase();
    const type =
      rawType === "tv" || rawType === "anime" ? rawType : ("movie" as const);
    const reason = parts.slice(3).join("###").trim() || "Great pick!";
    segments.push({
      type: "rec",
      card: { title, year, type, reason },
    });
    lastIndex = recRegex.lastIndex;
  }
  const remaining = buffer.slice(lastIndex);
  return { segments, remaining };
}

function RecCard({ card }: { card: ChatRecCard }) {
  return (
    <div className="my-2 rounded-xl border border-foreground/10 bg-surface-muted/50 p-4 transition-colors hover:border-foreground/20 dark:bg-surface-muted/80">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-display font-semibold text-foreground">
            {card.title}
          </h4>
          <p className="mt-0.5 text-xs text-muted">
            {card.year !== "N/A" && `${card.year} · `}
            <span className="capitalize">{card.type}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {card.reason}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
          {card.type === "anime" ? "Anime" : card.type === "tv" ? "TV" : "Movie"}
        </span>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: trimmed,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setStreamingContent(buffer);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: buffer,
        },
      ]);
      setStreamingContent("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Sorry, I couldn't process that. ${message}`,
        },
      ]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string) => {
    const { segments, remaining } = parseStreamedContent(content);
    return (
      <div className="space-y-1">
        {segments.map((seg, i) =>
          seg.type === "text" ? (
            <p key={i} className="whitespace-pre-wrap text-sm">
              {seg.content}
            </p>
          ) : (
            <RecCard key={i} card={seg.card} />
          )
        )}
        {remaining.trim() && (
          <p className="whitespace-pre-wrap text-sm">{remaining.trim()}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-foreground/10 bg-surface-muted/30">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && !isLoading && (
          <p className="text-center text-muted">
            Ask for a recommendation—e.g. &quot;Something cozy for a rainy
            day&quot; or &quot;Anime like Spy x Family&quot;.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-accent text-white"
                  : "bg-surface-muted text-foreground dark:bg-surface-muted/80"
              }`}
            >
              {msg.role === "user" ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                renderContent(msg.content)
              )}
            </div>
          </div>
        ))}
        {isLoading && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-2xl bg-surface-muted px-4 py-3 dark:bg-surface-muted/80">
              {renderContent(streamingContent)}
              <span className="inline-block h-3 w-0.5 animate-pulse bg-foreground/60" />
            </div>
          </div>
        )}
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-surface-muted px-4 py-3 dark:bg-surface-muted/80">
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
              <span className="ml-1 inline-block h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
              <span className="ml-1 inline-block h-2 w-2 animate-bounce rounded-full bg-muted" />
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-t border-foreground/10 p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to watch..."
            className="flex-1 rounded-lg border border-foreground/20 bg-surface px-4 py-3 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-accent px-5 py-3 font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
