import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { seed } from './seed.js';
import { aiCategorize, aiTranslate, aiStructureStory, aiTranscribe, aiSuggestEvents, aiSearch, aiQuizDraft } from './ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const UPLOADS = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

// ---------- tiny JSON "database" (swap for PostgreSQL/PostGIS: see /database/schema.sql) ----------
let db = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) : structuredClone(seed);
const save = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
save();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOADS));

const upload = multer({
  storage: multer.diskStorage({ destination: UPLOADS, filename: (_r, f, cb) => cb(null, randomUUID() + path.extname(f.originalname)) }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_r, f, cb) => cb(null, /^(image|audio|video)\//.test(f.mimetype))
});
const mediaOf = (req) => (req.files || []).map((f) => ({ url: '/uploads/' + f.filename, type: f.mimetype.split('/')[0], name: f.originalname, credit: req.body.credit || '' }));

// ---------- auth (demo). Replace with Firebase Auth: verify ID token in this middleware ----------
const userOf = (req) => db.users.find((u) => u.id === req.header('x-user-id'));
const needUser = (req, res, next) => { const u = userOf(req); if (!u) return res.status(401).json({ error: 'Please log in.' }); req.user = u; next(); };
const needAdmin = (req, res, next) => { const u = userOf(req); if (!u || !['admin', 'expert'].includes(u.role)) return res.status(403).json({ error: 'Admin/expert only.' }); req.user = u; next(); };

// ---------- gamification ----------
export const XP = { story: 5, quiz: 20, location: 30, photo: 20, localStory: 50, creative: 50, hunt: 100, acceptedBonus: 25 };
function awardXP(user, key, points, reason, extra = {}) {
  if (user.xpLog.some((l) => l.key === key)) return 0; // never reward the same action twice (anti-spam)
  user.xp += points;
  user.xpLog.push({ key, points, reason, at: new Date().toISOString(), ...extra });
  checkBadges(user);
  return points;
}
function giveBadge(user, badge) { if (!user.badges.includes(badge)) user.badges.push(badge); }
function checkBadges(user) {
  const n = (p) => user.xpLog.filter((l) => l.key.startsWith(p)).length;
  if (n('read:') >= 1) giveBadge(user, 'First Steps');
  if (n('quiz:') >= 3) giveBadge(user, 'Quiz Whiz');
  if (n('storyaccepted:') >= 1) giveBadge(user, 'Storyteller');
  if (n('conditionaccepted:') >= 1) giveBadge(user, 'Heritage Guardian');
  if (user.xp >= 500) giveBadge(user, 'Heritage Champion');
}
function stamp(user, label, kind, refId) {
  if (!user.stamps.some((s) => s.refId === refId && s.kind === kind)) user.stamps.push({ label, kind, refId, at: new Date().toISOString() });
}
function discover(user, id) { if (!user.discovered.includes(id)) user.discovered.push(id); }
const hById = (id) => db.heritage.find((h) => h.id === id);
const eventProgress = (user, ev) => ev.missions.map((m) => ({ ...m, done: user.xpLog.some((l) => l.key === `mission:${ev.id}:${m.id}`) }));
function checkEventBadge(user, ev) {
  if (eventProgress(user, ev).every((m) => m.done)) { giveBadge(user, ev.badge); stamp(user, ev.badge, 'event', ev.id); }
}

// ---------- heritage ----------
const distance = (a, b, c, d) => { const R = 6371, t = (x) => (x * Math.PI) / 180; const dl = t(c - a), dg = t(d - b);
  const x = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const publicHeritage = () => db.heritage.filter((h) => h.published);

app.get('/api/health', (_q, r) => r.json({ ok: true }));
app.get('/api/users', (_q, r) => r.json(db.users.map(({ id, name, role }) => ({ id, name, role }))));
app.post('/api/login', (q, r) => { const u = db.users.find((x) => x.id === q.body.userId); u ? r.json({ id: u.id, name: u.name, role: u.role }) : r.status(404).json({ error: 'No such user' }); });
app.post('/api/register', (q, r) => {
  const name = (q.body.name || '').trim(); if (!name) return r.status(400).json({ error: 'Name required' });
  const u = { id: 'u-' + randomUUID().slice(0, 8), name, role: 'user', xp: 0, xpLog: [], badges: [], stamps: [], discovered: [], progress: {} };
  db.users.push(u); save(); r.json({ id: u.id, name: u.name, role: u.role });
});

app.get('/api/heritage', (q, r) => {
  const { q: text, category, district, verification, risk, lat, lng, radius, event } = q.query;
  let list = publicHeritage();
  if (text) { const t = text.toLowerCase(); list = list.filter((h) => [h.name, h.localName, h.category, h.locality, h.district, h.state, h.description, ...(h.tags || [])].join(' ').toLowerCase().includes(t)); }
  if (category) { const cats = category.split(','); list = list.filter((h) => cats.includes(h.category)); }
  if (district) list = list.filter((h) => h.district.toLowerCase() === district.toLowerCase());
  if (verification) list = list.filter((h) => h.verification.status === verification);
  if (risk === 'true') list = list.filter((h) => ['Needs Attention', 'Deteriorating', 'At Risk'].includes(h.condition));
  if (lat && lng && radius) list = list.filter((h) => distance(+lat, +lng, h.lat, h.lng) <= +radius).map((h) => ({ ...h, distanceKm: +distance(+lat, +lng, h.lat, h.lng).toFixed(2) }));
  if (event) { const ev = db.events.find((e) => e.id === event); if (ev) list = list.filter((h) => h.id === ev.heritageId); }
  r.json(list);
});
app.get('/api/heritage/:id', (q, r) => {
  const h = hById(q.params.id);
  if (!h || (!h.published && userOf(q)?.role === undefined)) return r.status(404).json({ error: 'Not found' });
  const related = db.events.filter((e) => e.heritageId === h.id).map(({ id, title }) => ({ id, title }));
  const nearby = publicHeritage().filter((x) => x.id !== h.id).map((x) => ({ id: x.id, name: x.name, km: +distance(h.lat, h.lng, x.lat, x.lng).toFixed(1) })).sort((a, b) => a.km - b.km).slice(0, 3);
  const quiz = db.quizzes.find((z) => z.heritageId === h.id && z.status === 'approved');
  r.json({ ...h, related, nearby, hasQuiz: !!quiz, quizId: quiz?.id });
});

// duplicate guard + submission. Always starts as "Community Submitted" and UNPUBLISHED until reviewed.
app.post('/api/heritage', needUser, upload.array('media', 6), (q, r) => {
  const b = q.body;
  if (!b.name || !b.category || !b.lat || !b.lng || !b.description) return r.status(400).json({ error: 'Name, category, map pin and description are required.' });
  if (b.hasLocalStory === 'true' && b.consent !== 'true') return r.status(400).json({ error: 'Please confirm consent before sharing stories or details about elders/contributors.' });
  const dup = db.heritage.find((h) => h.name.toLowerCase() === b.name.toLowerCase() && distance(h.lat, h.lng, +b.lat, +b.lng) < 0.1);
  if (dup) return r.status(409).json({ error: `"${dup.name}" is already on the map nearby. Add a correction or media to it instead.` });
  const h = {
    id: 'h-' + randomUUID().slice(0, 8), name: b.name, localName: b.localName || '', category: b.category, tags: (b.tags || '').split(',').map((s) => s.trim()).filter(Boolean),
    lat: +b.lat, lng: +b.lng, locality: b.locality || '', district: b.district || '', state: b.state || '', period: b.period || 'Unknown (uncertainty allowed)',
    description: b.description, significance: b.significance || '', localStory: b.localStory || '', localStoryLabel: b.localStory ? 'Community-sourced' : '', language: b.language || 'English',
    sources: (b.sources || 'Local community source').split('\n').filter(Boolean), media: mediaOf(q), condition: 'Good', published: false,
    verification: { status: 'Community Submitted', verifier: '', date: new Date().toISOString() }, vouches: [], corrections: [], conditionHistory: [], submittedBy: q.user.id, createdAt: new Date().toISOString(), reviewNote: ''
  };
  db.heritage.push(h); save(); res_ok(r, { id: h.id, message: 'Submitted! An admin will review it before it appears on the map.' });
});
const res_ok = (r, o) => r.json({ ok: true, ...o });

app.post('/api/heritage/:id/read', needUser, (q, r) => {
  const h = hById(q.params.id); if (!h) return r.sendStatus(404);
  discover(q.user, h.id); const gained = awardXP(q.user, `read:${h.id}`, XP.story, `Read ${h.name}`, { district: h.district });
  if (gained) stamp(q.user, h.name, 'site', h.id); save(); res_ok(r, { gained, xp: q.user.xp });
});
// community verification: 3 distinct vouches raise status to "Community Verified"
app.post('/api/heritage/:id/vouch', needUser, (q, r) => {
  const h = hById(q.params.id); if (!h) return r.sendStatus(404);
  if (!h.vouches.includes(q.user.id)) h.vouches.push(q.user.id);
  if (h.vouches.length >= 3 && h.verification.status === 'Community Submitted') h.verification = { status: 'Community Verified', verifier: `Community (${h.vouches.length} vouches)`, date: new Date().toISOString() };
  save(); res_ok(r, { vouches: h.vouches.length, status: h.verification.status });
});
app.post('/api/heritage/:id/correction', needUser, (q, r) => {
  const h = hById(q.params.id); if (!h) return r.sendStatus(404);
  db.misinformationReports.push({ id: randomUUID(), heritageId: h.id, by: q.user.id, text: q.body.text, kind: q.body.kind || 'correction', status: 'open', at: new Date().toISOString() });
  save(); res_ok(r, { message: 'Thanks. An admin will review your report.' });
});
// Heritage at Risk: user report (photo + note). Public status only changes after admin review.
app.post('/api/heritage/:id/condition', needUser, upload.array('media', 3), (q, r) => {
  const h = hById(q.params.id); if (!h) return r.sendStatus(404);
  db.conditionReports.push({ id: randomUUID(), heritageId: h.id, by: q.user.id, condition: q.body.condition, notes: q.body.notes || '', media: mediaOf(q), status: 'pending', at: new Date().toISOString() });
  save(); res_ok(r, { message: 'Report received. The public status will change only after admin review.' });
});

// ---------- quizzes ----------
app.get('/api/quizzes/:id', (q, r) => {
  const z = db.quizzes.find((x) => x.id === q.params.id && x.status === 'approved'); if (!z) return r.sendStatus(404);
  r.json({ id: z.id, heritageId: z.heritageId, questions: z.questions.map(({ q, options }) => ({ q, options })) });
});
app.post('/api/quizzes/:id/answer', needUser, (q, r) => {
  const z = db.quizzes.find((x) => x.id === q.params.id && x.status === 'approved'); if (!z) return r.sendStatus(404);
  const answers = q.body.answers || []; const score = z.questions.filter((x, i) => answers[i] === x.answer).length;
  const passed = score === z.questions.length; const h = hById(z.heritageId); let gained = 0;
  if (passed) {
    gained += awardXP(q.user, `quiz:${z.id}`, XP.quiz, `Quiz: ${h?.name}`, { district: h?.district });
    db.events.filter((e) => e.heritageId === z.heritageId).forEach((ev) => ev.missions.filter((m) => m.quizId === z.id).forEach((m) => {
      awardXP(q.user, `mission:${ev.id}:${m.id}`, 0, m.title, { eventId: ev.id, district: ev.district }); checkEventBadge(q.user, ev); }));
    if (h) discover(q.user, h.id);
  }
  save(); res_ok(r, { score, total: z.questions.length, passed, gained, correct: z.questions.map((x) => x.answer) });
});

// ---------- events & competitions ----------
app.get('/api/events', (_q, r) => r.json(db.events.filter((e) => e.status === 'published')));
app.get('/api/events/:id', (q, r) => {
  const ev = db.events.find((e) => e.id === q.params.id); if (!ev) return r.sendStatus(404);
  const u = userOf(q); const entries = db.entries.filter((e) => e.eventId === ev.id && e.status === 'approved');
  r.json({ ...ev, missions: u ? eventProgress(u, ev) : ev.missions, gallery: entries });
});
app.post('/api/events/:id/entries', needUser, upload.array('media', 3), (q, r) => {
  const ev = db.events.find((e) => e.id === q.params.id); if (!ev) return r.sendStatus(404);
  const m = ev.missions.find((x) => x.id === q.body.missionId); if (!m || m.type === 'quiz') return r.status(400).json({ error: 'Invalid mission.' });
  if (!q.files?.length && !q.body.text) return r.status(400).json({ error: 'Add a file or a short text.' });
  db.entries.push({ id: randomUUID(), eventId: ev.id, missionId: m.id, type: m.type, title: m.title, userId: q.user.id, userName: q.user.name, text: q.body.text || '', media: mediaOf(q), status: 'pending', at: new Date().toISOString() });
  save(); res_ok(r, { message: 'Entry submitted for moderation. XP is awarded once accepted.' });
});

// ---------- Heritage Hunt ----------
app.get('/api/hunts', (q, r) => {
  const u = userOf(q);
  r.json(db.hunts.map((h) => ({ ...h, locations: h.locations.map(({ answer, keywords, ...rest }, i) => ({ ...rest, heritageName: hById(rest.heritageId)?.name, locked: u ? i > (u.progress[h.id] ?? 0) : i > 0 })), step: u ? u.progress[h.id] ?? 0 : 0 })));
});
app.post('/api/hunts/:id/step', needUser, upload.array('media', 1), (q, r) => {
  const hunt = db.hunts.find((x) => x.id === q.params.id); if (!hunt) return r.sendStatus(404);
  const step = q.user.progress[hunt.id] ?? 0; if (step >= hunt.locations.length) return r.status(400).json({ error: 'Hunt already completed.' });
  const loc = hunt.locations[step]; const { discovery = '', choice } = q.body;
  if (!loc.keywords.some((k) => discovery.toLowerCase().includes(k))) return r.status(400).json({ error: 'Not quite. Re-read the story for this site and try again.' });
  if (+choice !== loc.answer) return r.status(400).json({ error: 'Quiz answer is incorrect. Check the verified story.' });
  if (!q.files?.length) return r.status(400).json({ error: 'Add a photo as proof (GPS is optional, never required).' });
  const h = hById(loc.heritageId); let gained = awardXP(q.user, `hunt:${hunt.id}:${step}`, XP.location, `Hunt mission: ${h?.name}`, { district: h?.district });
  q.user.progress[hunt.id] = step + 1; if (h) { discover(q.user, h.id); stamp(q.user, h.name, 'site', h.id); }
  let finished = false;
  if (step + 1 >= hunt.locations.length) { finished = true; gained += awardXP(q.user, `hunt:${hunt.id}:done`, XP.hunt, `Completed ${hunt.title}`, { district: 'Nagpur' }); giveBadge(q.user, hunt.badge); stamp(q.user, hunt.badge, 'hunt', hunt.id); }
  save(); res_ok(r, { gained, finished, nextStep: step + 1 });
});

// ---------- leaderboard & passport ----------
app.get('/api/leaderboard', (q, r) => {
  const { district, eventId } = q.query;
  const rows = db.users.filter((u) => u.role === 'user').map((u) => {
    const logs = u.xpLog.filter((l) => (!district || l.district === district) && (!eventId || l.eventId === eventId));
    return { id: u.id, name: u.name, xp: logs.reduce((s, l) => s + l.points, 0), badges: u.badges.length };
  }).filter((x) => x.xp > 0).sort((a, b) => b.xp - a.xp);
  r.json(rows);
});
app.get('/api/passport/:id', (q, r) => {
  const u = db.users.find((x) => x.id === q.params.id); if (!u) return r.sendStatus(404);
  r.json({ id: u.id, name: u.name, xp: u.xp, badges: u.badges, stamps: u.stamps, discovered: u.discovered.map((id) => ({ id, name: hById(id)?.name })), log: u.xpLog.slice(-15).reverse(),
    stats: { sites: u.discovered.length, quizzes: u.xpLog.filter((l) => l.key.startsWith('quiz:')).length, events: u.stamps.filter((s) => s.kind === 'event').length, contributions: db.heritage.filter((h) => h.submittedBy === u.id).length } });
});

// ---------- admin: moderation / verification / events / risk ----------
app.get('/api/admin/queue', needAdmin, (_q, r) => r.json({
  heritage: db.heritage.filter((h) => !h.published && h.verification.status !== 'Rejected'),
  entries: db.entries.filter((e) => e.status === 'pending'),
  conditionReports: db.conditionReports.filter((c) => c.status === 'pending').map((c) => ({ ...c, heritageName: hById(c.heritageId)?.name })),
  reports: db.misinformationReports.filter((m) => m.status === 'open').map((c) => ({ ...c, heritageName: hById(c.heritageId)?.name })),
  aiDrafts: db.aiDrafts.filter((d) => d.status === 'draft')
}));
app.post('/api/admin/heritage/:id/review', needAdmin, (q, r) => {
  const h = hById(q.params.id); if (!h) return r.sendStatus(404); const { action, note = '' } = q.body; const author = db.users.find((u) => u.id === h.submittedBy);
  if (action === 'approve') { h.published = true; h.reviewNote = note;
    if (author) { if (h.localStory) awardXP(author, `storyaccepted:${h.id}`, XP.localStory, `Story accepted: ${h.name}`, { district: h.district });
      if (h.media.some((m) => m.type === 'image')) awardXP(author, `photo:${h.id}`, XP.photo, `Photo accepted: ${h.name}`, { district: h.district });
      awardXP(author, `accepted:${h.id}`, XP.acceptedBonus, `Contribution accepted: ${h.name}`, { district: h.district }); } }
  else if (action === 'reject') { h.verification = { status: 'Rejected', verifier: q.user.name, date: new Date().toISOString() }; h.reviewNote = note; h.published = false; }
  else if (action === 'verify_community') h.verification = { status: 'Community Verified', verifier: q.user.name, date: new Date().toISOString() };
  else if (action === 'verify_expert') { if (q.user.role !== 'expert' && q.user.role !== 'admin') return r.sendStatus(403); h.verification = { status: 'Expert Verified', verifier: q.user.name, date: new Date().toISOString() }; h.published = true; }
  else return r.status(400).json({ error: 'Unknown action' });
  save(); res_ok(r, { status: h.verification.status, published: h.published });
});
app.post('/api/admin/entries/:id/review', needAdmin, (q, r) => {
  const e = db.entries.find((x) => x.id === q.params.id); if (!e) return r.sendStatus(404);
  if (q.body.action === 'approve') { e.status = 'approved'; const u = db.users.find((x) => x.id === e.userId); const ev = db.events.find((x) => x.id === e.eventId); const m = ev?.missions.find((x) => x.id === e.missionId);
    if (u && ev && m) { awardXP(u, `mission:${ev.id}:${m.id}`, m.xp, m.title, { eventId: ev.id, district: ev.district }); checkEventBadge(u, ev); } }
  else e.status = 'rejected';
  save(); res_ok(r, {});
});
app.post('/api/admin/condition/:id/review', needAdmin, (q, r) => {
  const c = db.conditionReports.find((x) => x.id === q.params.id); if (!c) return r.sendStatus(404); const h = hById(c.heritageId);
  if (q.body.action === 'approve' && h) { h.conditionHistory.push({ from: h.condition, to: c.condition, notes: c.notes, media: c.media, at: new Date().toISOString(), by: q.user.name }); h.condition = c.condition; c.status = 'approved';
    const u = db.users.find((x) => x.id === c.by); if (u) awardXP(u, `conditionaccepted:${c.id}`, XP.location, `Condition report: ${h.name}`, { district: h.district }); }
  else c.status = 'rejected';
  save(); res_ok(r, {});
});
app.post('/api/admin/reports/:id/resolve', needAdmin, (q, r) => { const m = db.misinformationReports.find((x) => x.id === q.params.id); if (m) m.status = 'resolved'; save(); res_ok(r, {}); });
app.post('/api/admin/events', needAdmin, (q, r) => {
  const b = q.body; if (!b.title) return r.status(400).json({ error: 'Title required' });
  const ev = { id: 'e-' + randomUUID().slice(0, 6), title: b.title, description: b.description || '', lat: +b.lat || 21.1458, lng: +b.lng || 79.0882, district: b.district || 'Nagpur', heritageId: b.heritageId || '', startsAt: b.startsAt || '', endsAt: b.endsAt || '', badge: b.badge || b.title + ' Badge', status: 'published',
    missions: b.missions?.length ? b.missions : [{ id: 'm1', type: 'photo', title: 'Photo mission', xp: 30 }] };
  db.events.push(ev); save(); res_ok(r, { id: ev.id });
});
app.post('/api/admin/aidrafts/:id/review', needAdmin, (q, r) => {
  const d = db.aiDrafts.find((x) => x.id === q.params.id); if (!d) return r.sendStatus(404);
  if (q.body.action === 'approve') { d.status = 'approved'; db.quizzes.push({ id: 'q-' + d.heritageId + '-' + d.id.slice(0, 4), heritageId: d.heritageId, status: 'approved', questions: d.questions }); } else d.status = 'rejected';
  save(); res_ok(r, {});
});

// ---------- AI assistant (humans decide what is true) ----------
app.post('/api/ai/categorize', needUser, async (q, r) => r.json(await aiCategorize(q.body.text || '')));
app.post('/api/ai/translate', needUser, async (q, r) => r.json(await aiTranslate(q.body.text || '', q.body.target)));
app.post('/api/ai/structure-story', needUser, async (q, r) => r.json(await aiStructureStory(q.body.notes || '')));
app.post('/api/ai/transcribe', needUser, upload.single('audio'), (_q, r) => r.json(aiTranscribe()));
app.post('/api/ai/suggest-events', needAdmin, async (q, r) => r.json(await aiSuggestEvents(q.body.occasion)));
app.post('/api/ai/search', async (q, r) => r.json(await aiSearch(q.body.question || '', publicHeritage())));
app.post('/api/ai/quiz-draft/:heritageId', needAdmin, async (q, r) => {
  const h = hById(q.params.heritageId); if (!h) return r.sendStatus(404);
  const d = { id: randomUUID(), heritageId: h.id, heritageName: h.name, questions: await aiQuizDraft(h), status: 'draft', aiGenerated: true }; db.aiDrafts.push(d); save(); res_ok(r, { draft: d });
});

// ---------- serve built frontend in production ----------
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) { app.use(express.static(dist)); app.get('*', (_q, r) => r.sendFile(path.join(dist, 'index.html'))); }

app.use((err, _q, r, _n) => { console.error(err); r.status(500).json({ error: err.message || 'Server error' }); });
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Hidden Heritage Map API on http://localhost:${PORT}`));
