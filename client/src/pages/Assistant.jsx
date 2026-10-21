import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Assistant() {
  const [q, setQ] = useState(''); const [r, setR] = useState(null); const [busy, setBusy] = useState(false);
  const ask = async () => { setBusy(true); try { setR(await api.post('/ai/search', { question: q })); } finally { setBusy(false); } };
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4">
      <h1 className="text-2xl font-extrabold">Ask the heritage archive</h1>
      <p className="text-sm text-slate2">Answers come only from approved entries, with sources and uncertainty shown. AI never decides what is historically true.</p>
      <div className="flex gap-2"><input className="input" placeholder="e.g. Which sites are water heritage?" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && q && ask()} /><button className="btn" disabled={!q || busy} onClick={ask}>Ask</button></div>
      {r && (
        <div className="panel space-y-2">
          <p className="story whitespace-pre-line">{r.answer}</p>
          <p className="text-sm text-slate2">{r.uncertainty}</p>
          <div className="flex flex-wrap gap-2">{r.citations.map((c) => <Link key={c.id} to={`/heritage/${c.id}`} className="chip">{c.name} · {c.status}</Link>)}</div>
        </div>
      )}
    </div>
  );
}
