# Closer Clinic

AI patient roleplay trainer for medical case acceptance. Providers pick a specialty station,
run a voice encounter against an AI patient with a randomized personality and difficulty,
ask for the close, and get an OSCE-style graded scorecard. Every rep is stored so close
rates and rubric scores trend over time.

**Phase 1** (this build): auth, 8 podiatry scenarios, 12-persona patient engine, voice
encounter loop (Web Speech API, iPhone-Safari-first), grading engine, encounter history +
progress dashboard, installable PWA. Billing, clinic seats, and more specialties come in
Phases 2–3 — see `SPEC` section below.

## Stack

- Next.js (App Router) · TypeScript · Tailwind v4 — deploys on Vercel
- Supabase — auth (email/password + Google), Postgres, row-level security
- Anthropic API — the AI patient and the grader, called **only from server routes**
- **Voice** behind swappable `SpeechToText`/`TextToSpeech` interfaces (`lib/voice/`):
  - Patient voice: **ElevenLabs** (Flash, streamed via `/api/tts`, persona-matched
    voices from `lib/voice/voice-map.ts`), silent fallback to browser speechSynthesis
  - Provider speech-to-text: **Deepgram** `nova-2-medical` via `/api/stt` with a
    boosted podiatry/dental vocabulary (`lib/voice/medical-terms.ts`), fallback to
    the browser Web Speech API
  - No voice keys set → everything falls back to browser APIs; encounters never break
- Per-encounter model + voice spend logged to `encounters.usage`; founder cost
  dashboard at `/founder` (gated by `FOUNDER_EMAIL` in production)

## Running locally

```bash
npm install
npm run dev
```

With no `.env.local` at all, the app runs in **dev mode**: an in-memory store, an
auto-signed-in dev user, and (without an Anthropic key) a canned stub patient. That's
enough to click through every screen.

For the real experience, copy `.env.example` to `.env.local` and fill in:

| Var | What |
|---|---|
| `ANTHROPIC_API_KEY` | Enables the real AI patient + grader (works even in dev mode) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Enables real auth + persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; needed for `npm run seed` |
| `ANTHROPIC_MODEL` | Optional model override (default `claude-sonnet-4-6`) |
| `ELEVENLABS_API_KEY` | Realistic streamed patient voice (else browser TTS) |
| `ELEVENLABS_MODEL` | Optional; default `eleven_flash_v2_5` (low latency) |
| `DEEPGRAM_API_KEY` | Accurate medical STT (else browser speech recognition) |
| `DEEPGRAM_MODEL` | Optional; default `nova-2-medical` |
| `FOUNDER_EMAIL` | Email allowed to view `/founder` costs in production |

Set the same vars in the Vercel project for production — the ElevenLabs, Deepgram, and
Anthropic keys are server-side only and never reach the client.

## Supabase setup (once)

1. Create a project at supabase.com.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (schema + RLS policies).
3. Seed the scenario library: `npm run seed`.
4. Auth → Providers: enable Email; enable Google (add OAuth credentials) if wanted.
5. Auth → URL Configuration: set the site URL and add `https://<domain>/auth/callback`
   to redirect URLs.

## Tests

```bash
npm test
```

Covers grade-JSON validation (schema, retry-relevant parse failures, server-side total
recomputation), entitlement gating (trial/active/grace/canceled), clinic seat math, and
stats/streak aggregation. RLS policies have pgTAP tests in `supabase/tests/rls.test.sql`
(run with `supabase test db` against a local stack — a user can never read another
user's transcripts).

## Deploying (Vercel)

1. Push to GitHub, import in Vercel.
2. Set the env vars above in the Vercel project.
3. Deploy. The PWA is installable from Safari (Share → Add to Home Screen).

## Guardrails baked in

- 25 encounters/day per user; 20 provider turns per encounter with a "patient glances
  at the clock" nudge at 12; transcript context truncated beyond 30 messages.
- The grader returns strict JSON, validated with zod, one retry, raw output stored in
  `grades.model_raw` for debugging.
- All patients are fictional — no PHI exists in the system. State this in onboarding
  and the privacy policy.

## Layout

```
app/                 screens + API routes (encounters, turns, grading, profile)
components/          client components (encounter room, charts, nav, auth)
lib/                 domain: scenarios, personas, prompts, grading, stats, stores
lib/voice/           STT/TTS interface + Web Speech implementation
supabase/            migration SQL (schema + RLS) and pgTAP RLS tests
scripts/seed.mjs     seeds the scenarios table from lib/scenarios.ts
```
