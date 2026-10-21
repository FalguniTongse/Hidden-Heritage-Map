import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Leaderboard() {
  const [rows, setRows] = useState([]); const [scope, setScope] = useState('global'); const [events, setEvents] = useState([]); const [ev, setEv] = useState('');
  useEffect(() => { api.get('/events').then(setEvents); }, []);
  useEffect(() => { const p = scope === 'location' ? '?district=Nagpur' : scope === 'event' && ev ? '?eventId=' + ev : ''; api.get('/leaderboard' + p).then(setRows); }, [scope, ev]);
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4">
      <h1 className="text-2xl font-extrabold">Leaderboard</h1>
      <div className="flex flex-wrap gap-2">
        {['global', 'location', 'event'].map((s) => <button key={s} className={`chip ${scope === s ? 'chip-on' : ''}`} onClick={() => setScope(s)}>{s === 'location' ? 'Nagpur' : s[0].toUpperCase() + s.slice(1)}</button>)}
        {scope === 'event' && <select className="input !w-auto" value={ev} onChange={(e) => setEv(e.target.value)}><option value="">Choose event</option>{events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select>}
      </div>
      <ol className="space-y-2">{rows.map((r, i) => <li key={r.id} className="panel flex items-center justify-between"><span><b className="mr-3">#{i + 1}</b>{r.name}</span><span><b>{r.xp}</b> XP · {r.badges} badges</span></li>)}</ol>
      {!rows.length && <p className="text-sm">No scores yet. Read a story to get on the board.</p>}
      <p className="text-xs text-slate2">Duplicate, low-quality or rejected submissions never earn permanent rewards.</p>
    </div>
  );
}
