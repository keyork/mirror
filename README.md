# Mirror

Mirror is a reflective AI companion for people who feel stuck in inertia and a little cut off from what they actually want. It is designed as a quiet, immersive web experience: a living central entity, slow conversational pacing, lightweight self-experiments, and a constellation view that grows from the user's own language over time.

The product goal is not productivity or habit tracking. It is to help someone get a little closer to their own signals, one small step at a time.

## What It Does

- Offers a conversational interface with a softer, more human tone
- Persists local memory in IndexedDB through Dexie
- Compresses long conversations into summary context so the chat can stay coherent
- Extracts keywords and sentiment from each reply to grow a personal constellation map
- Suggests lightweight experiments and tracks them as available, accepted, and completed
- Lets the user clear local memory in one action

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Zustand
- Dexie / IndexedDB
- React Three Fiber / Three.js
- OpenAI API
- Tailwind CSS 4

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Fill in the required environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults to `gpt-4o`
- `OPENAI_SUMMARY_MODEL` optional, defaults to `OPENAI_MODEL` then `gpt-4o-mini`
- `OPENAI_BASE_URL` optional, only needed for compatible providers or proxies

4. Start the dev server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
npm run start
```

## Project Notes

- Conversation history, constellation data, experiment state, and compressed summaries are stored locally in the browser.
- This project currently uses the Chat Completions API through a Next.js route at [`app/api/chat/route.ts`](./app/api/chat/route.ts).
- The product concept and design direction are documented in [`AGENT.md`](./AGENT.md).

## Repository Hygiene

- Do not commit `.env.local`
- Do not commit `.next/` or `node_modules/`
- If you change the prompt behavior, review both [`lib/prompts.ts`](./lib/prompts.ts) and [`app/api/chat/route.ts`](./app/api/chat/route.ts)

## License

Apache-2.0. See [`LICENSE`](./LICENSE).
