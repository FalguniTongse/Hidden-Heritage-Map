import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, CONDITIONS } from '../api.js';
import { useAuth } from '../auth.jsx';
import { VerifyBadge, ConditionBadge, Media } from '../components/Badges.jsx';
import Quiz from '../components/Quiz.jsx';

const Row = ({ k, v }) => v ? <div className="grid grid-cols-[9rem_1fr] gap-2 border-b border-slate2/15 py-2 text-sm"><dt className="font-semibold">{k}</dt><dd>{v}</dd></div> : null;

export default function HeritagePage() {
  const { id } = useParams(); const { user } = useAuth();
  const [h, setH] = useState(null); const [msg, setMsg] = useState(''); const [tr, setTr] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false); const [corr, setCorr] = useState(''); const [cond, setCond] = useState('Needs Attention'); const [notes, setNotes] = useState(''); const [file, setFile] = useState(null);
  const load = () => api.get('/heritage/' + id).then(setH).catch((e) => setMsg(e.message));
  useEffect(() => { load(); setTr(null); setShowQuiz(false); }, [id]);
  const act = async (fn) => { try { const r = await fn(); setMsg(r.message || (r.gained ? `+${r.gained} XP` : 'Done.')); load(); } catch (e) { setMsg(e.message); } };
  if (!h) return <p className="p-6">{msg || 'Loading…'}</p>;
  const sources = h.sources || [];

  return (
    <article className="mx-auto max-w-4xl space-y-5 p-4">
      <Link to="/" className="text-sm underline">← Back to map</Link>
      <header>
        <h1 className="text-3xl font-extrabold">{h.name}{h.localName && <span className="ml-2 text-lg font-normal text-slate2">({h.localName})</span>}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2"><VerifyBadge status={h.verification.status} /><ConditionBadge condition={h.condition} /><span className="text-sm">{h.category}{h.tags?.length ? ' · ' + h.tags.join(', ') : ''}</span></div>
        {!h.published && <p className="mt-2 rounded bg-marigold/30 p-2 text-sm">This entry is awaiting admin review and is not public yet.</p>}
      </header>
      <Media items={h.media} />
      <dl className="panel">
        <Row k="Location" v={`${h.locality}, ${h.district}, ${h.state} (${h.lat.toFixed(4)}, ${h.lng.toFixed(4)})`} />
        <Row k="Period" v={h.period} /><Row k="Description" v={h.description} /><Row k="Significance" v={h.significance} />
        <Row k="Verification" v={`${h.verification.status}${h.verification.verifier ? ' by ' + h.verification.verifier : ''}${h.verification.date ? ' on ' + h.verification.date.slice(0, 10) : ''}`} />
        <Row k="Condition" v={h.condition} /><Row k="Language" v={h.language} />
      </dl>
      {h.localStory && (
        <section className="panel">
          <h2 className="font-bold">Local story <span className="ml-2 rounded bg-slate2/15 px-2 py-0.5 text-xs">{h.localStoryLabel || 'Community-sourced'}</span></h2>
          <p className="story mt-2">{tr ? tr.translated : h.localStory}</p>
          {tr?.originalPreserved && <p className="text-xs text-slate2">AI translation (needs human review). Original preserved: “{h.localStory.slice(0, 60)}…”</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => act(async () => { setTr(await api.post('/ai/translate', { text: h.localStory, target: 'Hindi' })); return {}; })} disabled={!user}>Translate to Hindi (AI)</button>
            {tr && <button className="btn-ghost" onClick={() => setTr(null)}>Show original</button>}
          </div>
        </section>
      )}
      <section className="panel"><h2 className="font-bold">Sources</h2><ul className="list-disc pl-5 text-sm">{sources.map((s, i) => <li key={i}>{s}</li>)}{!sources.length && <li>No sources yet. Add a correction with a source.</li>}</ul></section>
      {h.related?.length > 0 && <section className="panel"><h2 className="font-bold">Related events</h2>{h.related.map((e) => <Link key={e.id} to={`/events/${e.id}`} className="mr-3 underline">{e.title}</Link>)}</section>}
      {h.nearby?.length > 0 && <section className="panel"><h2 className="font-bold">Nearby heritage</h2>{h.nearby.map((n) => <Link key={n.id} to={`/heritage/${n.id}`} className="mr-3 underline">{n.name} ({n.km} km)</Link>)}</section>}

      <section className="panel space-y-3">
        <h2 className="font-bold">Take part</h2>
        {!user && <p className="text-sm">Log in (top right) to earn Heritage XP and vouch for this entry.</p>}
        <div className="flex flex-wrap gap-2">
          <button className="btn" disabled={!user} onClick={() => act(() => api.post(`/heritage/${id}/read`))}>I read this story (+5 XP)</button>
          {h.hasQuiz && <button className="btn-alt" onClick={() => setShowQuiz(!showQuiz)}>Take the quiz (+20 XP)</button>}
          {h.verification.status === 'Community Submitted' && <button className="btn-ghost" disabled={!user} onClick={() => act(() => api.post(`/heritage/${id}/vouch`))}>Vouch this is accurate ({h.vouches?.length || 0}/3)</button>}
        </div>
        {showQuiz && <Quiz quizId={h.quizId} onDone={load} />}
        {msg && <p className="text-sm font-semibold text-water" role="status">{msg}</p>}
      </section>

      <section className="panel space-y-2">
        <h2 className="font-bold">Heritage at Risk: report this site’s condition</h2>
        <p className="text-sm text-slate2">Never enter unsafe or restricted areas. Photograph from public spots. An admin reviews every report before the public status changes.</p>
        <select className="input" value={cond} onChange={(e) => setCond(e.target.value)}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select>
        <textarea className="input" placeholder="What did you notice?" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <button className="btn" disabled={!user} onClick={() => act(() => { const f = new FormData(); f.append('condition', cond); f.append('notes', notes); if (file) f.append('media', file); return api.post(`/heritage/${id}/condition`, f); })}>Send condition report</button>
        {h.conditionHistory?.length > 0 && <div className="text-sm"><b>Condition history</b>{h.conditionHistory.map((c, i) => <div key={i}>{c.at.slice(0, 10)}: {c.from} → {c.to}. {c.notes}</div>)}</div>}
      </section>

      <section className="panel space-y-2">
        <h2 className="font-bold">Report a correction or misinformation</h2>
        <textarea className="input" placeholder="What is wrong, and what is your source?" value={corr} onChange={(e) => setCorr(e.target.value)} />
        <button className="btn-ghost" disabled={!user || !corr} onClick={() => act(async () => { const r = await api.post(`/heritage/${id}/correction`, { text: corr }); setCorr(''); return r; })}>Send report</button>
      </section>
    </article>
  );
}
