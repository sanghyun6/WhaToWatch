# WhaToWatch

Movie and anime recommendation web app—pick by mood or chat with AI for personalized suggestions.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, dark/light mode
- **Data:** TMDB (movies & TV), Jikan (anime)
- **AI:** Google Gemini Flash
- **Deploy:** Vercel

## Setup

1. Clone and install:

   ```bash
   npm install
   ```

2. Copy env and add keys:

   ```bash
   cp .env.example .env.local
   ```

   Set:

   - `TMDB_API_KEY` – [TMDB](https://www.themoviedb.org/settings/api)
   - `GEMINI_API_KEY` – [Google AI](https://aistudio.google.com/apikey)
   - `NEXT_PUBLIC_APP_URL` – Your app URL (e.g. `https://whatowatch.vercel.app`)

3. Run dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/           # Routes: /, /recommend, /chat
├── components/    # MoodSelector, ChatInterface, MovieCard, etc.
├── lib/           # tmdb, jikan, gemini API clients
└── types/         # Shared TypeScript types
```

## Scripts

- `npm run dev` – Development
- `npm run build` – Production build
- `npm run start` – Production server
- `npm run lint` – ESLint
