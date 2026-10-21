import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Events() {
  const [evs, setEvs] = useState([]);
  useEffect(() => { api.get('/events').then(setEvs); }, []);
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <h1 className="text-2xl font-extrabold">Cultural events & competitions</h1>
      <p className="text-sm text-slate2">Each event is tied to a place or occasion. Entries are moderated before they are published.</p>
      {evs.map((e) => (
        <Link key={e.id} to={`/events/${e.id}`} className="panel block hover:border-water">
          <h2 className="text-lg font-bold">★ {e.title}</h2><p className="text-sm">{e.description}</p>
          <p className="mt-1 text-xs text-slate2">{e.startsAt} to {e.endsAt} · {e.missions.length} missions · Badge: {e.badge}</p>
        </Link>
      ))}
      {!evs.length && <p>No events yet.</p>}
    </div>
  );
}
