import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Media } from '../components/Badges.jsx';

export default function Admin() {
  const { user } = useAuth();
  const [qd, setQd] = useState(null); const [msg, setMsg] = useState(''); const [occ, setOcc] = useState(''); const [ideas, setIdeas] = useState([]);
  const [ev, setEv] = useState({ title: '', description: '', startsAt: '', endsAt: '' }); 
  const load = () => api.get('/admin/queue').then(setQd).catch((e) => setMsg(e.message));
  useEffect(() => { if (user) load(); }, [user?.id]);
  const go = async (p, body = {}) => { try { await api.post(p, body); load(); } catch (e) { setMsg(e.message); } };
  if (!['admin', 'expert'].includes(user?.role)) return <p className="p-6">Admin or expert access only. Use the demo login “Admin Reviewer”.</p>;
  if (!qd) return <p className="p-6">{msg || 'Loading…'}</p>;
  const Sec = ({ title, n, children }) => <section className="panel space-y-3"><h2 className="font-bold">{title} ({n})</h2>{n === 0 ? <p className="text-sm text-slate2">Nothing waiting.</p> : children}</section>;
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <h1 className="text-2xl font-extrabold">Admin dashboard</h1>
      {msg && <p className="text-lac">{msg}</p>}
      <Sec title="New heritage submissions" n={qd.heritage.length}>
        {qd.heritage.map((h) => (
          <div key={h.id} className="rounded border p-3">
            <Link to={`/heritage/${h.id}`} className="font-bold underline">{h.name}</Link> <span className="text-sm">{h.category} · {h.district}</span>
            <p className="text-sm">{h.description}</p>{h.localStory && <p className="story text-sm">“{h.localStory}”</p>}<Media items={h.media} />
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="btn" onClick={() => go(`/admin/heritage/${h.id}/review`, { action: 'approve' })}>Approve & publish</button>
              <button className="btn-ghost" onClick={() => go(`/admin/heritage/${h.id}/review`, { action: 'verify_expert' })}>Expert verify</button>
              <button className="btn-ghost !border-lac !text-lac" onClick={() => go(`/admin/heritage/${h.id}/review`, { action: 'reject', note: 'Needs correction' })}>Reject</button>
              <button className="btn-ghost" onClick={() => go(`/ai/quiz-draft/${h.id}`)}>AI quiz draft</button>
            </div>
          </div>
        ))}
      </Sec>
      <Sec title="Event / challenge entries" n={qd.entries.length}>
        {qd.entries.map((e) => (
          <div key={e.id} className="rounded border p-3"><b>{e.title}</b> by {e.userName}<p className="text-sm">{e.text}</p><Media items={e.media} />
            <div className="mt-2 flex gap-2"><button className="btn" onClick={() => go(`/admin/entries/${e.id}/review`, { action: 'approve' })}>Accept (+XP)</button><button className="btn-ghost !border-lac !text-lac" onClick={() => go(`/admin/entries/${e.id}/review`, { action: 'reject' })}>Reject</button></div></div>
        ))}
      </Sec>
      <Sec title="Condition reports (Heritage at Risk)" n={qd.conditionReports.length}>
        {qd.conditionReports.map((c) => (
          <div key={c.id} className="rounded border p-3"><b>{c.heritageName}</b> → {c.condition}<p className="text-sm">{c.notes}</p><Media items={c.media} />
            <div className="mt-2 flex gap-2"><button className="btn" onClick={() => go(`/admin/condition/${c.id}/review`, { action: 'approve' })}>Approve status change</button><button className="btn-ghost" onClick={() => go(`/admin/condition/${c.id}/review`, { action: 'reject' })}>Dismiss</button></div></div>
        ))}
      </Sec>
      <Sec title="Corrections & misinformation reports" n={qd.reports.length}>
        {qd.reports.map((m) => <div key={m.id} className="rounded border p-3"><b>{m.heritageName}</b>: {m.text}<div className="mt-2"><button className="btn-ghost" onClick={() => go(`/admin/reports/${m.id}/resolve`)}>Mark resolved</button></div></div>)}
      </Sec>
      <Sec title="AI-drafted quizzes awaiting human review" n={qd.aiDrafts.length}>
        {qd.aiDrafts.map((d) => (
          <div key={d.id} className="rounded border p-3"><b>{d.heritageName}</b> <span className="text-xs">(AI generated)</span>
            {d.questions.map((q, i) => <p key={i} className="text-sm">{q.q} → <i>{q.options[q.answer]}</i></p>)}
            <div className="mt-2 flex gap-2"><button className="btn" onClick={() => go(`/admin/aidrafts/${d.id}/review`, { action: 'approve' })}>Approve</button><button className="btn-ghost" onClick={() => go(`/admin/aidrafts/${d.id}/review`, { action: 'reject' })}>Reject</button></div></div>
        ))}
      </Sec>
      <section className="panel space-y-2">
        <h2 className="font-bold">Create an event</h2>
        <input className="input" placeholder="Event title" value={ev.title} onChange={(e) => setEv({ ...ev, title: e.target.value })} />
        <textarea className="input" placeholder="Description" value={ev.description} onChange={(e) => setEv({ ...ev, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-2"><input type="date" className="input" value={ev.startsAt} onChange={(e) => setEv({ ...ev, startsAt: e.target.value })} /><input type="date" className="input" value={ev.endsAt} onChange={(e) => setEv({ ...ev, endsAt: e.target.value })} /></div>
        <button className="btn" onClick={() => go('/admin/events', ev)}>Publish event</button>
        <div className="flex gap-2 pt-2"><input className="input" placeholder="Occasion (for AI challenge ideas)" value={occ} onChange={(e) => setOcc(e.target.value)} /><button className="btn-ghost" onClick={async () => setIdeas((await api.post('/ai/suggest-events', { occasion: occ })).ideas)}>AI ideas</button></div>
        <ul className="list-disc pl-5 text-sm">{ideas.map((i, k) => <li key={k}>{i}</li>)}</ul>
        {ideas.length > 0 && <p className="text-xs text-slate2">AI ideas are suggestions only. You approve what gets published.</p>}
      </section>
    </div>
  );
}
