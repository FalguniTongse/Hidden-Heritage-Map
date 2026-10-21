# Hidden Heritage Map: Explore. Participate. Preserve.

Working prototype of the Hidden Heritage Map hackathon deck (Theme: Heritage & Culture).
Runs with **zero external setup**: no database, no API keys. Optional keys unlock real AI.

## Quick start (Node.js 18+)
```bash
npm run setup      # installs root, server and client dependencies
npm run dev        # API on :4000, web app on http://localhost:5173
```
Open http://localhost:5173 and use **Demo login** (top right):
- `Demo Explorer` for a normal user
- `Admin Reviewer` or `Dr. Expert` to open the **Admin** tab

Production-style run: `npm run build` then `npm start` (Express serves the built client on :4000).

## What is built (matches the deck's "MVP must build" list)
| MVP item | Where |
|---|---|
| Interactive map (Leaflet + OpenStreetMap) | `client/src/pages/MapPage.jsx` |
| Heritage database | `server/data/db.json` (auto-created from `server/seed.js`), PostGIS schema in `database/schema.sql` |
| Search + filters (+ Near me / radius, At Risk, verification) | MapPage + `GET /api/heritage` |
| Detail pages (all 11 standard fields) | `HeritagePage.jsx` |
| Add Heritage (pin, media, language, sources, consent) | `AddHeritage.jsx` + `POST /api/heritage` |
| Basic verification / admin | `Admin.jsx`, vouch (3 = Community Verified), expert verify |
| Events and quizzes | `Events.jsx`, `EventDetail.jsx`, `Quiz.jsx` |
| At least one competition type | drawing, song/dance, photo, storytelling entries, moderated |
| Heritage Hunt | `Hunt.jsx` (clue, discovery, quiz, photo proof, badge; GPS/QR optional) |
| XP, badges, leaderboard | `server/index.js` (`awardXP`, `checkBadges`), `Leaderboard.jsx` |
| Heritage Passport | `Passport.jsx` |
| Heritage at Risk reporting | HeritagePage form, Admin review, condition history |
| AI assistant (human review required) | `server/ai.js`, `Assistant.jsx` |

## Optional: real AI
Copy `.env.example` to `server/.env` and set `ANTHROPIC_API_KEY`. Keys live on the backend only.
Without a key, rule-based fallbacks keep every AI feature demonstrable.

## Demo data notice
Seed sites in Nagpur are illustrative samples. Verify facts with real sources and the community before real use.

Read `docs/BUILD_GUIDE.md` for the full roadmap, architecture, how to swap in Firebase/PostGIS/Cloudinary, deployment and the demo script.
