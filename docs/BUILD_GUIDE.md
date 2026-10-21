# Build guide: Hidden Heritage Map

## 0. What you have
A working prototype (React + Vite + Tailwind client, Express API with a JSON datastore). This guide shows how to run it, understand it, demo it, and upgrade each part to the production stack in your deck.

## 1. Run it
1. Install Node.js 18 or newer.
2. In the project root: `npm run setup` then `npm run dev`.
3. Open http://localhost:5173. Log in with the demo dropdown.
4. Reset data any time: stop the server and delete `server/data/db.json`.

## 2. Folder map
```
client/src/pages      Map, Heritage, AddHeritage, Events, EventDetail, Hunt, Passport, Leaderboard, Admin, Assistant
client/src/components Badges (verification, condition, media), Quiz
server/index.js       REST API, moderation rules, XP/badges/stamps
server/ai.js          AI assistant with safe fallbacks
server/seed.js        Demo data (replace with real, verified data)
database/schema.sql   PostgreSQL + PostGIS production schema
```

## 3. Rules the code enforces (from the deck)
- New submissions are `Community Submitted` and **unpublished** until an admin approves.
- 3 distinct community vouches → `Community Verified`; experts/admin can set `Expert Verified`; reject keeps it hidden.
- Duplicate guard: same name within 100 m is refused.
- Consent checkbox is required when a local story is included.
- XP is idempotent per action key (no repeat rewards); rejected items earn nothing.
- Condition reports change public status only after admin approval; history is stored.
- Hunt: clues unlock in order, answers come from verified content, photo proof required, GPS never required, safety banner shown.
- AI output is flagged `needsHumanReview`; quiz drafts go to an admin queue; search answers only from approved entries with citations and uncertainty.
- AI keys are read only on the server (`server/.env`).

## 4. Suggested 5-phase plan (adjust to your hackathon length)
| Phase | Goal | Done when |
|---|---|---|
| 1. Foundation (day 1) | Run prototype, replace seed with 15–25 real local sites, fix team name and branding | Map shows real data |
| 2. Core loop | Add Heritage → admin approve → appears on map; story → quiz → XP | Loop works end to end |
| 3. Engagement | Event with 3+ missions, one Hunt, passport, leaderboard | Live demo of rewards |
| 4. Trust and AI | Condition reports, corrections, AI categorize/translate/search with API key | Human-review flow visible |
| 5. Polish and ship | Mobile pass, deploy, record backup demo video, rehearse pitch | Public URL works |

Team split for 4 people: (A) map and detail UI, (B) API and data, (C) events/hunt/gamification, (D) content, design, AI and pitch.

## 5. Customising
- **Categories/XP:** edit `CATEGORIES` in `client/src/api.js` and the `XP` table in `server/index.js`.
- **New event:** Admin tab → Create event (default 1 photo mission). For richer missions add them in `server/seed.js` or extend `/api/admin/events`.
- **New hunt:** add an object to `hunts` in `seed.js` (stops reference `heritageId`; use verified entries only).
- **Other cities:** change map centre in `MapPage.jsx` and `AddHeritage.jsx`, and district defaults.
- **Colours/fonts:** `client/tailwind.config.js`.

## 6. Upgrading to the deck's production stack
1. **PostgreSQL + PostGIS:** run `database/schema.sql`; replace the `db` object reads/writes in `server/index.js` with `pg` queries. "Near me" becomes `ST_DWithin`. Keep response shapes identical so the client needs no changes.
2. **Firebase Authentication:** add Firebase web SDK in the client; send the ID token as `Authorization: Bearer`; in `userOf()` verify it with `firebase-admin` and map `uid` to your `users` row. Keep the role column for admin/expert.
3. **Media storage:** swap multer disk storage for Cloudinary or Firebase Storage upload; store returned URLs in `media`. Keep the 25 MB and type limits; scan or moderate uploads.
4. **AI:** set `ANTHROPIC_API_KEY`. For transcription and Hindi/Marathi speech, add a speech-to-text provider in `aiTranscribe()` (currently a placeholder) and keep the transcript editable.
5. **TypeScript:** optional; rename files to `.tsx` and add types once the flow is stable.

## 7. Deployment
- **Single service (simplest):** `npm run build`, then deploy the repo to Render/Railway/Fly.io with start command `npm start` after `npm run setup && npm run build`. Express serves `client/dist`. Note that a JSON file and local uploads are wiped on redeploy for many hosts, so use PostgreSQL + cloud storage for anything persistent.
- **Split deploy (as in the deck):** client on Vercel/Netlify (set a rewrite from `/api` and `/uploads` to your API URL, or add an API base URL env), API on Render/Railway/Fly.io.
- Set env vars on the host, never in the repo. Push to GitHub with `.gitignore` as provided.

## 8. Security and ethics checklist
- Never expose keys in the client. Rate-limit write endpoints (`express-rate-limit`) before going public.
- Validate and size-limit uploads; add an admin review for all media (already moderated).
- Respect consent for elders' stories; allow takedown requests.
- Label community-sourced stories; show uncertainty in periods; never present unverified claims as fact.
- Safety messaging on hunts; no trespassing or protected-structure access.
- Add a privacy note: location use is optional and not stored by the prototype.

## 9. Testing checklist (manual)
1. Log in as Demo Explorer → Map → open a site → "I read this story" (+5 XP, First Steps badge).
2. Take the Old Stepwell quiz (answers: 2nd, then 1st option) → +20 XP.
3. Add Heritage (drop pin, tick consent) → shows nothing on map yet.
4. Switch to Admin Reviewer → approve it → switch back → it appears; contributor receives XP.
5. Vouch for a "Community Submitted" site with 3 different users → becomes Community Verified.
6. Event page: finish the quiz mission; submit a drawing; admin accepts it; check Passport and Leaderboard.
7. Hunt: read Zero Mile Stone story, keyword "zero", answer, upload any image → unlocks stop 2 → badge.
8. Report condition on a site → admin approves → status and history update.
9. Ask AI: "water heritage".

## 10. Demo script (3 minutes)
1. **Hook (20s):** "Heritage disappears quietly before it is documented." Show the map with hidden sites.
2. **Discover (40s):** search, filter At Risk, open Old Stepwell, show verification + community-sourced story.
3. **Participate (50s):** quiz, hunt step, XP and badge, passport.
4. **Contribute and trust (40s):** add a site, admin approves, status ladder, correction/consent rules.
5. **AI with guardrails (20s):** translate story, ask the archive, show citations and "needs review".
6. **Close (10s):** "We are turning people into participants in preservation."

## 11. Judging Q&A prep
- *How do you stop misinformation?* Unpublished until review, status ladder, corrections, labelled community stories, AI never decides truth.
- *How do you stop spam?* Idempotent XP, duplicate checks, rejected content earns nothing, moderation.
- *Safety/privacy?* GPS optional, photo proof, safety banner, consent for elders.
- *Scalability?* PostGIS, district/category model, no core changes for new regions.
- *Sustainability?* Partnerships with local organisations, historians, authorities; offline mobile in future scope.

## 12. Known prototype limits
JSON datastore (not for concurrent production load), demo login instead of Firebase, local file uploads, speech-to-text placeholder, GPS/QR verification not implemented (optional by design), no automated tests yet, and the app has not been run through a full browser test in the build environment. Run through section 9 after installing.
