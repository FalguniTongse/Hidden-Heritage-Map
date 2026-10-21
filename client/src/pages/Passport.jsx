import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Passport() {
  const { user } = useAuth(); const [p, setP] = useState(null);
  useEffect(() => { if (user) api.get('/passport/' + user.id).then(setP); }, [user?.id]);
  if (!user) return <p className="p-6">Log in to see your Heritage Passport.</p>;
  if (!p) return <p className="p-6">Loading…</p>;
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <header className="rounded-lg bg-ink p-5 text-white">
        <p className="text-sm opacity-80">Digital Heritage Passport</p>
        <h1 className="text-3xl font-extrabold">{p.name}</h1>
        <p className="text-5xl font-extrabold text-marigold">{p.xp} <span className="text-base font-normal text-white">Heritage XP</span></p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[['Sites discovered', p.stats.sites], ['Quizzes done', p.stats.quizzes], ['Events completed', p.stats.events], ['Contributions', p.stats.contributions]].map(([k, v]) => <div key={k} className="panel text-center"><div className="text-2xl font-extrabold">{v}</div><div className="text-xs">{k}</div></div>)}
      </div>
      <section className="panel"><h2 className="font-bold">Badges</h2><div className="mt-2 flex flex-wrap gap-2">{p.badges.map((b) => <span key={b} className="rounded-full bg-marigold px-3 py-1 text-sm font-bold">🏅 {b}</span>)}{!p.badges.length && <p className="text-sm">No badges yet. Read a story to earn First Steps.</p>}</div></section>
      <section className="panel"><h2 className="font-bold">Stamps</h2><div className="mt-2 grid gap-2 sm:grid-cols-3">{p.stamps.map((s, i) => <div key={i} className="rounded border-2 border-dashed border-water p-3 text-center"><div className="font-bold">{s.label}</div><div className="text-xs">{s.kind} · {s.at.slice(0, 10)}</div></div>)}{!p.stamps.length && <p className="text-sm">Visit sites and finish events to collect stamps.</p>}</div></section>
      <section className="panel"><h2 className="font-bold">Recent activity</h2><ul className="text-sm">{p.log.map((l, i) => <li key={i} className="flex justify-between border-b py-1"><span>{l.reason}</span><b>+{l.points}</b></li>)}</ul></section>
    </div>
  );
}
