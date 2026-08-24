@AGENTS.md

# Closer Clinic

AI patient-roleplay sales trainer for medical providers (podiatry first). Next.js 16
(App Router, Turbopack) + Supabase (auth/Postgres/storage) + Anthropic (patient,
grader, generators) + ElevenLabs (voice). Mobile-first: every screen is designed and
verified at 390×844.

## Architecture invariants

- **Store abstraction** (`lib/store/index.ts`): one `Store` interface, two backends —
  `MemoryStore` (dev, no env keys, auto dev-user, `DEV_SEED_STATS=1` seeds realistic
  history) and `SupabaseStore` (RLS everywhere). `getStore()` switches on
  `isSupabaseConfigured()`. Never query Supabase outside a store or an admin route.
- **Canonical content is code**: scenarios (`lib/scenarios.ts`), training packs
  (`lib/training/*`), packs (`lib/packs.ts`). `npm run seed` upserts them to Supabase.
  Dev reads code directly; prod reads rows.
- **Snapshot rule**: anything priced is snapshotted at write time — encounters carry
  a price snapshot in `meta`, outcome logs carry `amount_cents` — so later price
  edits never rewrite history.
- **Base rows never mutate**: per-user price changes live in `scenario_overrides`;
  `resolveScenarioForUser` applies them everywhere content is consumed (patient
  prompt, grader, cards, audio hashing, revenue defaults).
- **Rubric shape is fixed**: `{rapport, framing, price, objections, close}` 0–20
  each. Roles reinterpret labels/definitions (see below) but never the keys —
  trends, letters, and assignments depend on the shape.
- **Fictional patients only.** No path accepts real patient audio or PHI. Free text
  is scrubbed (`lib/scrub.ts`); prep consults are built from structured fields only.

## Entities (beyond the obvious)

- `scenarios.role` — `'provider' | 'front_desk'`. Front-desk stations grade
  scheduling outcome (framing), deposit ask (price), and locking the calendar
  (close) via a role-specific rubric in `lib/prompts.ts`; labels via
  `rubricLabelsFor(role)`. `profiles.seat_role` mirrors it per seat (clinic admin
  can flip it in Team training).
- `outcome_logs` — consult logger rows: `station_slug`, `amount_cents` (snapshot,
  midpoint of the price range by default), `amount_entered` (true only when the
  provider typed the number; any default in a window renders revenue as "est.").
  Revenue math is pure in `lib/revenue.ts`.
- `packs` / `pack_codes` / `pack_unlocks` — vendor station packs.
  `scenarios.pack_id` gates visibility via RLS (public packs, or unlocked by code).
  Codes are unreadable by users; redemption validates with the service role.
  Admin at `/admin/packs`, gated by `ADMIN_EMAILS` (comma list).
- `audio_assets` — cached "Common close / The fix" pairs and personal replays.
  **Cache key: `(kind, station_slug, content_hash, take)`** where `content_hash`
  covers the resolved scenario content + `PAIR_SCRIPT_VERSION` — default stations
  share one global entry; a customized station regenerates on edit and never
  otherwise. Pairs live in the public `audio-pairs` bucket; replays are per-rep in
  private `audio-replays` behind signed URLs. `tts_usage` tracks monthly generated
  characters against `TTS_MONTHLY_CHAR_CAP` (soft stop → "audio unavailable").
- `script_cards` — per-(user, station) Claude-tightened lines for the printable
  5.5×8.5in PDF (`lib/script-card-pdf.tsx`, @react-pdf/renderer), cached on a
  content hash.

## Dev environment quirks

- No system Node on this Mac; a standalone Node 22 must be on PATH for npm/next.
- `next dev` under the preview harness panics (Turbopack worker spawn); run it from
  a plain shell. With Supabase keys in `.env.local`, dev requires real login — for
  the keyless dev-user loop, blank the Supabase env vars explicitly.
- Lint baseline: 2 pre-existing react-compiler errors (encounter-client,
  settings-client). Do not "fix" or add to them.
- The Supabase dashboard SQL editor shows a confirmation dialog for destructive
  statements (`drop …`) — a migration is not applied until that dialog is
  confirmed, and the success toast can be stale.

## Commit sequence (2026-08 feature batch)

1. Revenue attribution on Progress (migration 0006) — closed revenue, payback,
   leak table, weekly $ chart series, amount-on-close logger.
2. Audio pairs + personal replays (0007) — Listen sections, beat-pin player,
   lazy generation, `scripts/seed-audio.mjs` pre-warm.
3. Front-desk stations and seat roles (0008).
4. Script cards (0009) — per-station and print-all PDFs.
5. Vendor packs foundation (0010) — Northwind demo behind `NORTHWIND-DEMO`.
6. Activation: one-tap first rep.
7. This documentation.
