# Summary of the deck: Hidden Heritage Map

**Tagline:** Explore. Participate. Preserve. **Theme:** Heritage & Culture. **Team:** [Your Team Name] (to fill in).
**One line:** A community-powered digital heritage platform for lesser-known cultural places, stories and traditions.

## 1. The problem
- Hidden sites are unknown: people know famous monuments, not small local sites, old markets, crafts, folk practices, food traditions.
- Oral history is fragile: knowledge lives in families and communities and can vanish if not documented.
- Maps are for navigation: they do not preserve cultural context or community memories.
- Passive for young users: conventional heritage information is hard for youth to engage with.
- No single place: discovery, education, participation and preservation are scattered.
- **Gap:** one platform to discover, learn, contribute and protect heritage together.

## 2. The solution
Map-first, community-powered platform: discover sites, read verified stories, join challenges, contribute media, earn recognition. Six pillars: Community-Powered Map, Digital Archive, Cultural Events, Challenges & Quizzes, Gamification (Heritage XP, badges, leaderboard, Heritage Passport), Verification (community, admin, expert).
Principle: people should discover, interact with, contribute to and help preserve heritage, not just read about it.

## 3. How it works (7-step loop)
1 Location (discover on map) → 2 Story (read/watch/listen) → 3 Challenge (quiz, drawing, song, dance, photo, hunt) → 4 Contribution (story, photo, artwork, audio, video) → 5 Verification (community/admin/source) → 6 Reward (XP, badges, rank, passport stamp) → 7 Preservation (accepted content joins archive). Preserved content feeds new discovery, so it is a loop.

## 4. Interactive map
Map is the primary interface. Search by place/category/district/state/heritage type. "Near me" and radius with location permission. Filters: Architecture, Monument, Religious, Craft, Folk Art, Music, Dance, Food, Festival, Local Story, At Risk. Category-based markers; separate marker style for active events. Marker opens a preview card (e.g. Old Stepwell, Community Verified, Needs Attention, View Story), then the full page. Verification and risk status on every card. MVP uses Leaflet + OpenStreetMap.

## 5. Heritage detail page (standard structure)
Name (official, common, local), Location (lat/long, locality, district, state), Category (primary + tags), Period (approximate, uncertainty allowed), Description, Significance, Local Story (community oral history, clearly labelled), Media (photos, audio, video with credits), Sources (links, references), Verification (status, verifier, date), Condition (risk level), Related (events, nearby heritage). Example: Old Stepwell, Nagpur, approx. 18th century.

## 6. Community contribution
Flow: User Submit → Validation → Moderation/Verification → Publish → Archive.
Add Heritage form: name, category, location (map pin), description and significance, optional local story, photo/audio/video upload, language, source/evidence or community source. Starts as "Community Submitted".
Trust rules: admin reviews obvious issues; community or expert verification raises status; approved content becomes searchable and appears on map; rejected items stay hidden and are returned for correction; corrections and misinformation reports allowed; no private information about contributors or elders without consent. Never present unverified claims as fact.

## 7. Cultural events and competitions
Tied to an occasion, cultural theme or location; moderated before publication. Types: Drawing/Painting, Singing, Dance, Photography, Storytelling, Quiz, Heritage Hunt, Craft Challenge.
Example, Nagpur Heritage Festival Challenge: event marker opens a verified story; take a location quiz; submit "My Heritage, My Nagpur" drawing; upload a song or dance; complete a photo mission; record an elder explaining a tradition. Each accepted activity gives Heritage XP; location/event badge on completing required missions; moderated entries join the archive.

## 8. Heritage Hunt
Six steps: Clue → Discovery (at site or on page) → Quiz (verified content) → Mission (photo or audio) → Proof (photo, optional GPS or QR) → Badge (unlock next clue; finish for badge).
Rules: clues only from verified stored content; start/end date and difficulty; GPS optional, never mandatory (privacy, device limits); QR codes at participating sites. Safety: never encourage unsafe access, trespassing or interaction with protected/dangerous structures; photo proof keeps people in safe public areas.

## 9. Gamification
Heritage XP rewards meaningful participation, never spam. Suggested XP: read/complete story 5; complete quiz 20; visit/complete location mission 30; upload useful photo 20; submit local story 50; art/music/dance challenge 50; complete Heritage Hunt 100; accepted/verified contribution bonus.
Digital Heritage Passport: locations discovered, contributions, events joined, quizzes done, badges, location-specific stamps. Leaderboards by location, event and global. Anti-spam: duplicate, low-quality or rejected submissions earn no permanent rewards.

## 10. AI as an assistant
Principle: AI helps people contribute; humans decide what is true. Features: Categorization (suggests category/tags; user/admin confirms), Translation (Hindi, English and more; original preserved), Transcription (oral-history audio to editable text), Story structuring (raw notes to draft; never invents facts), Quiz generation (from verified content; admin reviews first), Event suggestions (admin approves), Search assistant (answers from approved content, cites sources, shows uncertainty). Human verification is mandatory before AI content becomes public. Guardrail: AI never automatically establishes historical truth; secrets and AI credentials stay on the backend.

## 11. Heritage at Risk
Conditions: Good, Needs Attention, Deteriorating, At Risk. Users report a site's condition with photos and notes; admin reviews before any public status change; condition history stored for comparison. Map layer/filter, status on every card. Can grow into partnerships with local organizations, historians and authorities.

## 12. Technology stack
Frontend React + Vite + TypeScript/JavaScript; Styling Tailwind CSS; Map Leaflet + OpenStreetMap; Backend Node.js + Express (REST); Database PostgreSQL + PostGIS; Auth Firebase Authentication; Media Cloudinary / Firebase Storage; AI LLM API + speech/translation; Deploy Vercel/Netlify + Render/Railway/Fly.io; Version control Git + GitHub. Demonstrable without AR/VR.

## 13. Architecture
Frontend (React: Map, Event, Heritage, Passport) → Express REST API (auth, validation, business logic) → PostgreSQL/PostGIS (heritage, users, events), Cloud Storage (photos, audio, video), AI Services (structured output) → Human review (required before public use) → Admin Dashboard (moderation, verification, event management) → Public Archive (verified, searchable). Secrets stay in backend environment config; frontend never exposes AI or database credentials.

## 14. Impact
Preserves local stories; engages youth; searchable cultural memory; identifies heritage at risk; empowers communities as authors and guardians; scales to new states, districts, categories and events without core changes. Judge takeaway: heritage is discovered, understood, documented, shared and preserved through active community participation.

## 15. Future scope
AR overlays, VR tours, 3D reconstruction, computer-vision identification, offline-first mobile app, institution/authority integration, live event streaming, advanced judging automation, recommendation engine, IoT/environmental monitoring.
**MVP must build:** Interactive map | Heritage database | Search + filters | Detail pages | Add Heritage | Basic verification/admin | Events and quizzes | At least one competition type | XP, badges, leaderboard | Heritage Passport | Heritage at Risk reporting.

## 16. Closing
"We are not just putting heritage on a map. We are turning people into participants in its preservation." Explore. Participate. Preserve.
