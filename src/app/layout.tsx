import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DebugHeight } from "@/components/DebugHeight";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WhaToWatch – Movie & Anime Recommendations",
  description: "Discover what to watch based on your mood or chat with AI for personalized recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var dark = stored === 'dark' || (stored !== 'light' && true);
                  document.documentElement.classList.toggle('dark', dark);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans bg-surface text-foreground">
        <DebugHeight />
        <ThemeProvider>
          <ViewTransitions>
            {children}
          </ViewTransitions>
        </ThemeProvider>
      </body>
    </html>
  );
}
