import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { api, CATEGORIES } from '../api.js';
import { useAuth } from '../auth.jsx';

const blank = { name: '', localName: '', category: 'Architecture', tags: '', locality: '', district: 'Nagpur', state: 'Maharashtra', period: '', description: '', significance: '', localStory: '', language: 'English', sources: '', credit: '', consent: false };

export default function AddHeritage() {
  const { user } = useAuth();
  const [f, setF] = useState(blank); const [pos, setPos] = useState(null); const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [ai, setAi] = useState('');
  const el = useRef(null); const marker = useRef(null); const map = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  useEffect(() => {
    map.current = L.map(el.current).setView([21.1458, 79.0882], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map.current);
    map.current.on('click', (e) => { setPos(e.latlng); if (marker.current) marker.current.setLatLng(e.latlng); else marker.current = L.marker(e.latlng).addTo(map.current); });
    return () => map.current.remove();
  }, []);

  const suggest = async () => {
    try { const r = await api.post('/ai/categorize', { text: `${f.name} ${f.description} ${f.localStory}` });
      setF((x) => ({ ...x, category: CATEGORIES.includes(r.category) ? r.category : x.category, tags: r.tags?.join(', ') || x.tags })); setAi('AI suggestion applied. Please confirm the category and tags yourself.'); } catch (e) { setErr(e.message); }
  };
  const structure = async () => {
    try { const r = await api.post('/ai/structure-story', { notes: f.localStory }); setF((x) => ({ ...x, localStory: r.draft })); setAi('AI tidied your notes without adding facts. Edit freely before submitting.'); } catch (e) { setErr(e.message); }
  };
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    if (!pos) return setErr('Click the map to drop a pin on the location.');
    const d = new FormData();
    Object.entries(f).forEach(([k, v]) => d.append(k, v));
    d.append('lat', pos.lat); d.append('lng', pos.lng); d.append('hasLocalStory', String(!!f.localStory));
    files.forEach((x) => d.append('media', x));
    try { const r = await api.post('/heritage', d); setMsg(r.message); setF(blank); setFiles([]); } catch (e2) { setErr(e2.message); }
  };

  if (!user) return <p className="p-6">Please log in (top right) to add heritage.</p>;
  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-2">
      <div className="space-y-3">
        <h1 className="text-2xl font-extrabold">Add a hidden heritage site</h1>
        <p className="text-sm text-slate2">Your entry starts as “Community Submitted” and appears publicly only after review.</p>
        <div><label className="label">Name *</label><input className="input" required value={f.name} onChange={set('name')} /></div>
        <div><label className="label">Local / alternate name</label><input className="input" value={f.localName} onChange={set('localName')} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="label">Category *</label><select className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label">Tags (comma separated)</label><input className="input" value={f.tags} onChange={set('tags')} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="label">Locality</label><input className="input" value={f.locality} onChange={set('locality')} /></div>
          <div><label className="label">District</label><input className="input" value={f.district} onChange={set('district')} /></div>
          <div><label className="label">State</label><input className="input" value={f.state} onChange={set('state')} /></div>
        </div>
        <div><label className="label">Period (approximate is fine)</label><input className="input" placeholder="e.g. approx. 18th century, not sure" value={f.period} onChange={set('period')} /></div>
        <div><label className="label">Description *</label><textarea required className="input" rows={3} value={f.description} onChange={set('description')} /></div>
        <div><label className="label">Cultural significance</label><textarea className="input" rows={2} value={f.significance} onChange={set('significance')} /></div>
        <div><label className="label">Local story (optional)</label><textarea className="input" rows={4} value={f.localStory} onChange={set('localStory')} /></div>
        <div className="flex flex-wrap gap-2"><button type="button" className="btn-ghost" onClick={suggest}>AI: suggest category</button><button type="button" className="btn-ghost" disabled={!f.localStory} onClick={structure}>AI: tidy my story notes</button></div>
        {ai && <p className="text-sm text-water">{ai}</p>}
      </div>
      <div className="space-y-3">
        <div><label className="label">Drop a pin on the map *</label><div ref={el} className="h-72 rounded-lg border" />{pos && <p className="text-xs">Pin: {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}</p>}</div>
        <div><label className="label">Language of story</label><select className="input" value={f.language} onChange={set('language')}>{['English', 'Hindi', 'Marathi', 'Other'].map((l) => <option key={l}>{l}</option>)}</select></div>
        <div><label className="label">Photos, audio or video (max 25 MB each)</label><input type="file" multiple accept="image/*,audio/*,video/*" onChange={(e) => setFiles([...e.target.files])} /></div>
        <div><label className="label">Credit for media</label><input className="input" value={f.credit} onChange={set('credit')} /></div>
        <div><label className="label">Sources / evidence (one per line)</label><textarea className="input" rows={2} placeholder="Book, link, or “local community source”" value={f.sources} onChange={set('sources')} /></div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.consent} onChange={set('consent')} className="mt-1" />I have consent to share any stories or details about elders or other people. I will not share private information without permission.</label>
        {err && <p className="font-semibold text-lac" role="alert">{err}</p>}
        {msg && <p className="font-semibold text-leaf" role="status">{msg}</p>}
        <button className="btn">Submit for review</button>
      </div>
    </form>
  );
}
