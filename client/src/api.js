const uid = () => localStorage.getItem('hhm_user') ? JSON.parse(localStorage.getItem('hhm_user')).id : '';

async function req(path, opts = {}) {
  const headers = { 'x-user-id': uid(), ...(opts.headers || {}) };
  let body = opts.body;
  if (body && !(body instanceof FormData)) { headers['content-type'] = 'application/json'; body = JSON.stringify(body); }
  const res = await fetch('/api' + path, { ...opts, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
export const api = {
  get: (p) => req(p),
  post: (p, body) => req(p, { method: 'POST', body }),
};
export const CATEGORIES = ['Architecture', 'Monument', 'Religious', 'Craft', 'Folk Art', 'Music', 'Dance', 'Food', 'Festival', 'Local Story'];
export const CAT_ICON = { Architecture: '🏛️', Monument: '🗿', Religious: '🛕', Craft: '🧵', 'Folk Art': '🎨', Music: '🎵', Dance: '💃', Food: '🍲', Festival: '🎪', 'Local Story': '📜' };
export const CONDITIONS = ['Good', 'Needs Attention', 'Deteriorating', 'At Risk'];
export const photoOf = (h) =>
  h.media?.find((m) => (m.type || '').toLowerCase() === 'image' || /\.(jpe?g|png|webp|gif)$/i.test(m.url || ''))?.url;