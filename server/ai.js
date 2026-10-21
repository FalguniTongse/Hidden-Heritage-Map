// AI is an ASSISTANT. Everything returned is flagged needsHumanReview.
// Keys stay on the backend. If ANTHROPIC_API_KEY is missing, rule-based fallbacks are used.
const KEY = () => process.env.ANTHROPIC_API_KEY;
const MODEL = () => process.env.AI_MODEL || 'claude-sonnet-4-6';

export async function callLLM(system, prompt) {
  if (!KEY()) return null;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY(), 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL(), max_tokens: 800, system, messages: [{ role: 'user', content: prompt }] })
    });
    const j = await r.json();
    return j.content?.map((c) => c.text || '').join('') || null;
  } catch { return null; }
}

const CATS = {
  Architecture: ['stepwell', 'baoli', 'temple', 'palace', 'haveli', 'building', 'gate', 'wada'],
  Monument: ['fort', 'tomb', 'memorial', 'statue', 'pillar', 'stone'],
  Religious: ['mosque', 'church', 'shrine', 'stupa', 'gurudwara', 'dargah', 'monastery'],
  Craft: ['craft', 'weav', 'pottery', 'artisan', 'handloom', 'market', 'metalwork'],
  'Folk Art': ['folk', 'painting', 'mural', 'rangoli', 'puppet'],
  Music: ['song', 'music', 'instrument', 'bhajan', 'lavani'],
  Dance: ['dance', 'garba', 'dhol'],
  Food: ['food', 'recipe', 'poha', 'sweet', 'cuisine', 'street food'],
  Festival: ['festival', 'procession', 'fair', 'jatra', 'pola'],
  'Local Story': ['story', 'legend', 'myth', 'oral']
};

export function categorize(text = '') {
  const t = text.toLowerCase();
  const scored = Object.entries(CATS).map(([c, ws]) => [c, ws.filter((w) => t.includes(w)).length]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
  const tags = [...new Set(scored.flatMap(([c]) => CATS[c].filter((w) => t.includes(w))))].slice(0, 6);
  return { category: scored[0]?.[0] || 'Local Story', tags, suggestedOnly: true, needsHumanReview: true };
}

export async function aiCategorize(text) {
  const llm = await callLLM('You classify cultural heritage entries. Reply ONLY JSON {"category":string,"tags":string[]}. Categories: ' + Object.keys(CATS).join(', '), text);
  try { if (llm) return { ...JSON.parse(llm.replace(/```json|```/g, '')), suggestedOnly: true, needsHumanReview: true, source: 'llm' }; } catch {}
  return { ...categorize(text), source: 'rules' };
}

export async function aiTranslate(text, target = 'Hindi') {
  const llm = await callLLM('Translate faithfully. Do not add facts. Return only the translation.', `Translate to ${target}:\n${text}`);
  return { original: text, translated: llm || `[Translation to ${target} needs an AI key. Original preserved below]\n${text}`, target, originalPreserved: true, needsHumanReview: true, source: llm ? 'llm' : 'fallback' };
}

export async function aiStructureStory(notes) {
  const llm = await callLLM('Turn raw oral-history notes into a readable short draft. NEVER invent facts, dates or names. Keep uncertainty.', notes);
  const fallback = notes.split(/[.\n]+/).map((s) => s.trim()).filter(Boolean).map((s) => '• ' + s).join('\n');
  return { draft: llm || fallback, neverInventsFacts: true, needsHumanReview: true, source: llm ? 'llm' : 'fallback' };
}

export function aiTranscribe() {
  return { transcript: '[Transcript placeholder: connect a speech-to-text API (e.g. Whisper / Google STT) on the backend. The transcript is editable by the contributor before submit.]', editable: true, needsHumanReview: true };
}

export async function aiSuggestEvents(occasion = 'a local festival') {
  const llm = await callLLM('Suggest 5 short challenge ideas for a cultural heritage event. One per line.', occasion);
  const fallback = [`Drawing: "My Heritage" inspired by ${occasion}`, 'Photography: a craft or tradition nearby', 'Storytelling: record an elder\'s memory', 'Quiz on verified local sites', 'Heritage Hunt across 3 sites'];
  return { ideas: llm ? llm.split('\n').filter(Boolean) : fallback, needsAdminApproval: true };
}

// Search assistant answers ONLY from approved content and cites sources.
export async function aiSearch(question, items) {
  const words = question.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const scored = items.map((h) => {
    const blob = [h.name, h.localName, h.category, h.description, h.significance, h.localStory, h.locality, ...(h.tags || [])].join(' ').toLowerCase();
    return [h, words.filter((w) => blob.includes(w)).length];
  }).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h]) => h);
  if (!scored.length) return { answer: 'I could not find this in the approved archive. It may be undocumented. Consider adding it via Add Heritage.', citations: [], uncertainty: 'No verified content found.' };
  const ctx = scored.map((h) => `[${h.id}] ${h.name}: ${h.description} ${h.significance} Period: ${h.period}. Status: ${h.verification.status}. ${h.localStory ? 'Community story: ' + h.localStory : ''}`).join('\n');
  const llm = await callLLM('Answer ONLY from the provided archive entries. Cite entry ids in [brackets]. Say when something is uncertain or community-sourced. If not covered, say so.', `Question: ${question}\n\nArchive:\n${ctx}`);
  return {
    answer: llm || scored.map((h) => `${h.name}: ${h.description} (${h.period}; ${h.verification.status})`).join('\n'),
    citations: scored.map((h) => ({ id: h.id, name: h.name, status: h.verification.status })),
    uncertainty: scored.some((h) => h.verification.status === 'Community Submitted') ? 'Some sources are community-submitted and not yet verified.' : 'Based on approved archive entries.',
    source: llm ? 'llm' : 'fallback'
  };
}

export async function aiQuizDraft(h) {
  const llm = await callLLM('Create 2 multiple-choice questions ONLY from the text. Reply JSON [{"q":string,"options":string[3],"answer":0-2}].', `${h.name}. ${h.description} ${h.significance} Period: ${h.period}`);
  try { if (llm) return JSON.parse(llm.replace(/```json|```/g, '')); } catch {}
  return [{ q: `Which category best describes ${h.name}?`, options: [h.category, 'Space technology', 'Modern sport'], answer: 0 },
          { q: `Why does ${h.name} matter?`, options: [h.significance, 'It has no significance', 'It is a private home'], answer: 0 }];
}
