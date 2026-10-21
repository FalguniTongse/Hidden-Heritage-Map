import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Quiz from '../components/Quiz.jsx';
import { Media } from '../components/Badges.jsx';

const ICON = { quiz: '❓', drawing: '🎨', song: '🎵', dance: '💃', photo: '📷', storytelling: '🎙️', craft: '🧵' };

export default function EventDetail() {
  const { id } = useParams(); const { user } = useAuth();
  const [ev, setEv] = useState(null); const [open, setOpen] = useState(null); const [text, setText] = useState(''); const [file, setFile] = useState(null); const [msg, setMsg] = useState('');
  const load = () => api.get('/events/' + id).then(setEv);
  useEffect(() => { load(); }, [id, user?.id]);
  if (!ev) return <p className="p-6">Loading…</p>;
  const send = async (m) => {
    try { const d = new FormData(); d.append('missionId', m.id); d.append('text', text); if (file) d.append('media', file); const r = await api.post(`/events/${id}/entries`, d); setMsg(r.message); setOpen(null); setText(''); setFile(null); } catch (e) { setMsg(e.message); }
  };
  const done = ev.missions.filter((m) => m.done).length;
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <Link to="/events" className="text-sm underline">← All events</Link>
      <h1 className="text-3xl font-extrabold">★ {ev.title}</h1><p>{ev.description}</p>
      {ev.heritageId && <Link className="btn-ghost" to={`/heritage/${ev.heritageId}`}>Open the verified heritage story</Link>}
      <p className="font-semibold">Progress: {done}/{ev.missions.length} missions · Complete all to earn the “{ev.badge}” badge and a passport stamp.</p>
      {msg && <p className="font-semibold text-water" role="status">{msg}</p>}
      <ul className="space-y-3">
        {ev.missions.map((m) => (
          <li key={m.id} className="panel">
            <div className="flex items-center justify-between gap-2">
              <div><span className="mr-2">{ICON[m.type]}</span><b>{m.title}</b> <span className="text-xs text-slate2">+{m.xp} XP</span></div>
              {m.done ? <span className="font-bold text-leaf">✓ Done</span> : <button className="btn-alt" disabled={!user} onClick={() => setOpen(open === m.id ? null : m.id)}>{m.type === 'quiz' ? 'Start quiz' : 'Submit entry'}</button>}
            </div>
            {open === m.id && (m.type === 'quiz'
              ? <div className="mt-3"><Quiz quizId={m.quizId} onDone={load} /></div>
              : <div className="mt-3 space-y-2"><textarea className="input" placeholder="Add a short note or story" value={text} onChange={(e) => setText(e.target.value)} /><input type="file" accept="image/*,audio/*,video/*" onChange={(e) => setFile(e.target.files[0])} /><button className="btn" onClick={() => send(m)}>Send for moderation</button></div>)}
          </li>
        ))}
      </ul>
      {ev.gallery?.length > 0 && <section><h2 className="mb-2 font-bold">Accepted entries</h2>{ev.gallery.map((g) => <div key={g.id} className="mb-3"><p className="text-sm font-semibold">{g.title} by {g.userName}</p>{g.text && <p className="story text-sm">{g.text}</p>}<Media items={g.media} /></div>)}</section>}
      {!user && <p className="text-sm">Log in (top right) to take part.</p>}
    </div>
  );
}
