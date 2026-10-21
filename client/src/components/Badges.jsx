const V = { 'Expert Verified': 'bg-leaf text-white', 'Community Verified': 'bg-water text-white', 'Community Submitted': 'bg-marigold text-ink', Rejected: 'bg-slate2 text-white' };
const C = { Good: 'bg-leaf/15 text-leaf', 'Needs Attention': 'bg-marigold/30 text-ink', Deteriorating: 'bg-orange-200 text-orange-900', 'At Risk': 'bg-lac text-white' };

export function VerifyBadge({ status }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-bold ${V[status] || 'bg-slate2 text-white'}`} title="Verification status">{status}</span>;
}
export function ConditionBadge({ condition }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-bold ${C[condition] || ''}`} title="Heritage condition">{condition}</span>;
}
export function Media({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((m, i) => (
        <figure key={i} className="panel p-2">
          {m.type === 'image' && <img src={m.url} alt={m.name} className="w-full rounded" />}
          {m.type === 'audio' && <audio controls src={m.url} className="w-full" />}
          {m.type === 'video' && <video controls src={m.url} className="w-full rounded" />}
          <figcaption className="mt-1 text-xs text-slate2">{m.name}{m.credit ? ` — credit: ${m.credit}` : ''}</figcaption>
        </figure>
      ))}
    </div>
  );
}
