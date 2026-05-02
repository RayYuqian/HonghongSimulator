# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Honghong Simulator" (哄哄模拟器) — an EQ training chat game. The player selects a character, draws a conflict scenario, and must navigate a tense chat conversation to raise the character's mood. After ~6 rounds of dialogue (or when mood hits 0/100), the game generates an EQ report card.

Single-page React app with no routing — just a 3-screen state machine managed in `App.tsx`.

## Commands

```bash
npm run dev       # Start Vite dev server (HMR)
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint (flat config)
npm run preview   # Preview production build locally
```

## Architecture

```
src/
├── main.tsx                  # React entry point
├── App.tsx                   # Game state machine (intro → chat → results)
├── index.css                 # Global styles + CSS custom properties
├── App.css                   # #root overrides for mobile feel
├── data/
│   ├── characters.ts         # 6 character definitions + their scenarios
│   └── scenarios.ts          # Gender-pairing-specific conflict scenarios (M/M, M/F, F/F, F/M)
├── components/
│   ├── IntroScreen.tsx       # Gender selection + character picker
│   ├── ChatScreen.tsx        # Real-time chat with mood bar
│   └── ResultScreen.tsx      # EQ report card with score, highlights, improvements
└── services/
    └── llm.ts                # OpenRouter API calls + prompt engineering
```

### Game Flow

1. **IntroScreen**: User selects their gender and a character to "comfort"
2. **ChatScreen**: A random conflict scenario is drawn from the gender-appropriate pool. The LLM plays the upset character; the user must de-escalate via chat. Mood starts at 30-60 (random) and changes per response. Game ends after 6 rounds or when mood reaches 0 or 100.
3. **ResultScreen**: The LLM generates a snarky EQ report with score (0-100), highlights, and improvement suggestions.

### LLM Strategy (`src/services/llm.ts`)

- **Chat responses**: `deepseek/deepseek-v3.2` via OpenRouter, with `response_format: json_object`. Each response returns `{ reply, moodChange }`. The system prompt enforces character personality, short messages (10-40 chars, no punctuation), and sharp logical rebuttals.
- **EQ reports**: `google/gemini-2.5-flash-lite` via OpenRouter. Returns `{ score, summary, highlights[], improvements[] }`.
- Scenario selection is client-side random (not LLM-generated), picked from gender-pairing-specific arrays in `scenarios.ts`.
- API key is read from `import.meta.env.OPENROUTER_API_KEY`, `VITE_OPENROUTER_API_KEY`, or localStorage.

### Styling

CSS custom properties defined in `index.css` (soft green palette). Components use inline `styles` objects with `React.CSSProperties`. The app targets a mobile-first 500px max-width container with rounded corners on desktop.

## Environment

The Vite config exposes env vars with `OPENROUTER_` and `VITE_` prefixes. The API key must be set as `OPENROUTER_API_KEY` or `VITE_OPENROUTER_API_KEY`.
