import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { api, CATEGORIES, CAT_ICON } from '../api.js';
import { VerifyBadge, ConditionBadge } from '../components/Badges.jsx';

const pin = (cat, risk) => L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 30],
  html: `<div class="hh-pin" style="background:${risk ? '#B3261E' : '#0B5563'}"><span>${CAT_ICON[cat] || '📍'}</span></div>` });
const eventIcon = L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15], html: '<div class="hh-event"><span>★</span></div>' });
const RISK = ['Needs Attention', 'Deteriorating', 'At Risk'];

export default function MapPage() {
  const mapEl = useRef(null); const map = useRef(null); const layer = useRef(null); const events = useRef(null);
  const [items, setItems] = useState([]); const [evs, setEvs] = useState([]);
  const [q, setQ] = useState(''); const [cats, setCats] = useState([]); const [risk, setRisk] = useState(false);
  const [ver, setVer] = useState(''); const [radius, setRadius] = useState(5); const [me, setMe] = useState(null);
  const [sel, setSel] = useState(null); const [msg, setMsg] = useState('');

  useEffect(() => {
    map.current = L.map(mapEl.current).setView([21.1458, 79.0882], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current); events.current = L.layerGroup().addTo(map.current);
    api.get('/events').then(setEvs);
    return () => map.current.remove();
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q); if (cats.length) p.set('category', cats.join(',')); if (risk) p.set('risk', 'true'); if (ver) p.set('verification', ver);
    if (me) { p.set('lat', me.lat); p.set('lng', me.lng); p.set('radius', radius); }
    api.get('/heritage?' + p).then(setItems);
  }, [q, cats, risk, ver, me, radius]);

  useEffect(() => {
    layer.current.clearLayers();
    items.forEach((h) => L.marker([h.lat, h.lng], { icon: pin(h.category, RISK.includes(h.condition)), title: h.name }).on('click', () => setSel(h)).addTo(layer.current));
    events.current.clearLayers();
    evs.forEach((e) => L.marker([e.lat, e.lng], { icon: eventIcon, title: e.title }).bindPopup(`<b>${e.title}</b><br/><a href="/events/${e.id}">Open event</a>`).addTo(events.current));
  }, [items, evs]);

  const near = () => {
    if (!navigator.geolocation) return setMsg('Location is not supported on this device.');
    navigator.geolocation.getCurrentPosition((pos) => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setMe(c); map.current.setView([c.lat, c.lng], 13); L.circleMarker([c.lat, c.lng], { radius: 8 }).addTo(map.current); setMsg(''); },
      () => setMsg('Location permission was denied. You can still search by place or district.'));
  };
  const toggle = (c) => setCats((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]));

  return (
    <div className="flex h-full flex-col md:flex-row">
      <aside className="w-full space-y-3 overflow-auto bg-white p-3 md:w-80 md:shrink-0">
        <input className="input" placeholder="Search place, category, district…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => <button key={c} className={`chip ${cats.includes(c) ? 'chip-on' : ''}`} onClick={() => toggle(c)}>{CAT_ICON[c]} {c}</button>)}
          <button className={`chip ${risk ? '!bg-lac !text-white' : ''}`} onClick={() => setRisk(!risk)}>⚠ At Risk</button>
        </div>
        <select className="input" value={ver} onChange={(e) => setVer(e.target.value)} aria-label="Verification filter">
          <option value="">Any verification status</option><option>Community Submitted</option><option>Community Verified</option><option>Expert Verified</option>
        </select>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={near}>📍 Near me</button>
          {me && <><select className="input !w-auto" value={radius} onChange={(e) => setRadius(e.target.value)}>{[1, 5, 10, 25].map((r) => <option key={r} value={r}>{r} km</option>)}</select><button className="underline text-sm" onClick={() => setMe(null)}>Clear</button></>}
        </div>
        {msg && <p className="text-sm text-lac">{msg}</p>}
        <p className="text-xs text-slate2">★ marks active cultural events. Red pins need attention. {items.length} sites shown.</p>
        <ul className="space-y-2">
          {items.map((h) => (
            <li key={h.id}><button className="panel w-full text-left hover:border-water" onClick={() => { setSel(h); map.current.setView([h.lat, h.lng], 15); }}>
              <div className="font-bold">{CAT_ICON[h.category]} {h.name}</div>
              <div className="mt-1 flex flex-wrap gap-1"><VerifyBadge status={h.verification.status} /><ConditionBadge condition={h.condition} />{h.distanceKm != null && <span className="text-xs">{h.distanceKm} km</span>}</div>
            </button></li>
          ))}
          {!items.length && <li className="text-sm text-slate2">Nothing matches yet. Try fewer filters, or add a hidden site yourself.</li>}
        </ul>
      </aside>
      <section className="relative min-h-[50vh] flex-1">
        <div ref={mapEl} className="absolute inset-0" />
        {sel && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] max-w-md rounded-lg bg-white p-4 shadow-xl md:left-auto">
            <button className="float-right text-xl leading-none" aria-label="Close preview" onClick={() => setSel(null)}>×</button>
            <h2 className="text-lg font-extrabold">{sel.name}</h2>
            <p className="text-sm text-slate2">{sel.category} · {sel.locality}, {sel.district}</p>
            <div className="my-2 flex flex-wrap gap-1"><VerifyBadge status={sel.verification.status} /><ConditionBadge condition={sel.condition} /></div>
            <p className="text-sm">{sel.description}</p>
            <Link to={`/heritage/${sel.id}`} className="btn mt-3">View story</Link>
          </div>
        )}
      </section>
    </div>
  );
}
