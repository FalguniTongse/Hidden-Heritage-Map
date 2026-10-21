import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Hunt() {
  const { user } = useAuth();
  const [hunts, setHunts] = useState([]); const [discovery, setDiscovery] = useState(''); const [choice, setChoice] = useState(null); const [file, setFile] = useState(null); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const load = () => api.get('/hunts').then(setHunts);
  useEffect(() => { load(); }, [user?.id]);
  const submit = async (hunt) => {
    setErr(''); setMsg('');
    try { const d = new FormData(); d.append('discovery', discovery); d.append('choice', choice ?? ''); if (file) d.append('media', file);
      const r = await api.post(`/hunts/${hunt.id}/step`, d); setMsg(r.finished ? `Hunt complete! +${r.gained} XP and the “${hunt.badge}” badge.` : `Location cleared! +${r.gained} XP. Next clue unlocked.`); setDiscovery(''); setChoice(null); setFile(null); load();
    } catch (e) { setErr(e.message); }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4">
      <h1 className="text-2xl font-extrabold">Heritage Hunt</h1>
      {hunts.map((h) => (
        <section key={h.id} className="panel space-y-3">
          <h2 className="text-xl font-bold">{h.title} <span className="text-sm font-normal">({h.difficulty}) · {h.startsAt} to {h.endsAt}</span></h2>
          <p className="rounded bg-marigold/30 p-2 text-sm"><b>Safety first:</b> {h.safety}</p>
          <p className="text-sm">Each stop: clue → find the answer in the verified story → quiz → photo mission → proof → badge. GPS and QR check-ins are optional extras, never required.</p>
          {h.locations.map((l, i) => {
            const state = i < h.step ? 'done' : i === h.step ? 'active' : 'locked';
            return (
              <div key={i} className={`rounded-md border p-3 ${state === 'active' ? 'border-water' : 'border-slate2/20 opacity-70'}`}>
                <b>Stop {i + 1}: {state === 'locked' ? '🔒 locked' : l.heritageName}</b> {state === 'done' && <span className="font-bold text-leaf">✓ cleared</span>}
                {state !== 'locked' && <p className="text-sm">Clue: {l.clue}</p>}
                {state === 'active' && (
                  <div className="mt-2 space-y-2">
                    <Link to={`/heritage/${l.heritageId}`} className="text-sm underline">Read the verified story for this site</Link>
                    <input className="input" placeholder="Type a keyword you found in the story" value={discovery} onChange={(e) => setDiscovery(e.target.value)} />
                    <fieldset><legend className="text-sm font-semibold">{l.question}</legend>
                      {l.options.map((o, j) => <label key={j} className="mr-4 text-sm"><input type="radio" name="hq" checked={choice === j} onChange={() => setChoice(j)} /> {o}</label>)}</fieldset>
                    <p className="text-sm">Mission: {l.mission}</p>
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                    <button className="btn" disabled={!user} onClick={() => submit(h)}>Submit proof</button>
                  </div>
                )}
              </div>
            );
          })}
          {!user && <p className="text-sm">Log in (top right) to play.</p>}
          {msg && <p className="font-semibold text-leaf" role="status">{msg}</p>}
          {err && <p className="font-semibold text-lac" role="alert">{err}</p>}
        </section>
      ))}
    </div>
  );
}
