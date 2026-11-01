import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, CAT_ICON, photoOf } from '../api.js';
import { VerifyBadge } from '../components/Badges.jsx';
import { Reveal, CountUp } from '../components/Motion.jsx';
import { useGuide } from '../components/Guide.jsx';

const RISK = ['Needs Attention', 'Deteriorating', 'At Risk'];
const STEPS = [
  ['🧭', 'Explore', 'Find hidden sites, stories and traditions on the map.'],
  ['🎯', 'Participate', 'Take quizzes, join hunts and cultural challenges.'],
  ['📸', 'Contribute', 'Share a photo, story or memory from your community.'],
  ['🛡️', 'Preserve', 'Verified contributions join the heritage archive.'],
];

export default function Home() {
  const { go } = useGuide();
  const [sites, setSites] = useState([]);
  useEffect(() => { api.get('/heritage').then(setSites).catch(() => {}); }, []);

  const featured = [...sites].sort((a, b) => (photoOf(b) ? 1 : 0) - (photoOf(a) ? 1 : 0)).slice(0, 6);
  const stats = [
    [sites.length, 'sites mapped'],
    [sites.filter((h) => h.localStory).length, 'local stories'],
    [sites.filter((h) => RISK.includes(h.condition)).length, 'need attention'],
  ];

  return (
    <div>
      {/* Hero with slowly zooming photo */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(18,32,43,.55), rgba(18,32,43,.88)), url(/photos/hero.jpg)',
            animation: 'kenburns 18s ease-in-out infinite alternate',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28">
          <p className="fade-up mb-3 text-sm font-semibold uppercase tracking-widest text-marigold">Explore. Participate. Preserve.</p>
          <h1 className="fade-up delay-1 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">Discover the heritage hiding in your city</h1>
          <p className="fade-up delay-2 mt-4 max-w-2xl text-lg opacity-90">Old stepwells, forgotten markets, folk traditions and family stories. Explore them, add what you know, and help keep them alive.</p>
          <div className="fade-up delay-3 mt-8 flex flex-wrap gap-3">
            <Link to="/map" onClick={(e) => { if (go('/map')) e.preventDefault(); }} className="btn-alt !px-6 !py-3 !text-base">Explore the map</Link>
            <Link to="/add" onClick={(e) => { if (go('/add')) e.preventDefault(); }} className="btn-ghost !border-white !px-6 !py-3 !text-base !text-white hover:!bg-white hover:!text-ink">Add a hidden site</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-8">
            {stats.map(([n, label]) => (
              <div key={label}>
                <div className="text-4xl font-extrabold text-marigold"><CountUp to={n} /></div>
                <div className="text-sm opacity-90">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured sites */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Reveal>
          <h2 className="text-2xl font-extrabold">Featured heritage</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((h) => (
              <Link key={h.id} to={`/heritage/${h.id}`} className="panel lift overflow-hidden !p-0">
                {photoOf(h)
                  ? <img src={photoOf(h)} alt={h.name} className="h-44 w-full object-cover" />
                  : <div className="flex h-44 items-center justify-center bg-water text-5xl">{CAT_ICON[h.category]}</div>}
                <div className="p-3">
                  <h3 className="font-bold">{h.name}</h3>
                  <p className="text-sm text-slate2">{h.category} · {h.district}</p>
                  <div className="mt-2"><VerifyBadge status={h.verification.status} /></div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6"><Link to="/map" onClick={(e) => { if (go('/map')) e.preventDefault(); }} className="btn">See all on the map</Link></div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <Reveal>
            <h2 className="text-2xl font-extrabold">How it works</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([icon, title, text]) => (
                <div key={title} className="lift rounded-lg border border-slate2/20 p-4">
                  <div className="text-3xl">{icon}</div>
                  <h3 className="mt-2 font-bold">{title}</h3>
                  <p className="text-sm text-slate2">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-ink px-4 py-8 text-center text-white">
        <p className="font-semibold">We are not just putting heritage on a map. We are turning people into participants in its preservation.</p>
      </footer>
    </div>
  );
}
