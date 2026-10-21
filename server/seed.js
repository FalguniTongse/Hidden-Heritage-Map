// DEMO DATA ONLY. Nagpur entries are illustrative samples for the prototype;
// verify every fact with real sources/community before public use.
const now = () => new Date().toISOString();
const base = { published: true, vouches: [], corrections: [], conditionHistory: [], media: [], createdAt: now() };

export const seed = {
  users: [
    { id: 'u-demo', name: 'Demo Explorer', role: 'user', xp: 0, xpLog: [], badges: [], stamps: [], discovered: [], progress: {} },
    { id: 'u-asha', name: 'Asha (Student)', role: 'user', xp: 180, xpLog: [{ key: 'seed1', points: 180, reason: 'Sample history', district: 'Nagpur', at: now() }], badges: ['First Steps'], stamps: [], discovered: [], progress: {} },
    { id: 'u-ravi', name: 'Ravi (Local Guide)', role: 'user', xp: 320, xpLog: [{ key: 'seed2', points: 320, reason: 'Sample history', district: 'Nagpur', at: now() }], badges: ['First Steps', 'Storyteller'], stamps: [], discovered: [], progress: {} },
    { id: 'u-admin', name: 'Admin Reviewer', role: 'admin', xp: 0, xpLog: [], badges: [], stamps: [], discovered: [], progress: {} },
    { id: 'u-expert', name: 'Dr. Expert (Historian)', role: 'expert', xp: 0, xpLog: [], badges: [], stamps: [], discovered: [], progress: {} }
  ],
  heritage: [
    { ...base, id: 'h-stepwell', name: 'Old Stepwell', localName: 'Purani Baoli', category: 'Architecture', tags: ['water heritage', 'community'], lat: 21.153, lng: 79.11, locality: 'Old city', district: 'Nagpur', state: 'Maharashtra',
      period: 'approx. 18th century (uncertain)', description: 'A step-down water structure used by neighbourhoods for centuries.', significance: 'Community gathering and water heritage.',
      localStory: 'Elders say families gathered here on summer evenings and the steps were cleaned together before the monsoon.', localStoryLabel: 'Community-sourced', language: 'English',
      sources: ['Local oral history (community-sourced)'], verification: { status: 'Community Verified', verifier: 'Community (3 vouches)', date: now() }, condition: 'Needs Attention', submittedBy: 'u-ravi' },
    { ...base, id: 'h-sitabuldi', name: 'Sitabuldi Fort', localName: 'Sitabuldi Qila', category: 'Monument', tags: ['fort', 'history'], lat: 21.156, lng: 79.084, locality: 'Sitabuldi', district: 'Nagpur', state: 'Maharashtra',
      period: 'Early 19th century', description: 'Hill fort associated with the 1817 Battle of Sitabuldi.', significance: 'Marks a turning point in the region\'s history.',
      localStory: '', localStoryLabel: '', language: 'English', sources: ['Public historical records'], verification: { status: 'Expert Verified', verifier: 'Dr. Expert', date: now() }, condition: 'Good', submittedBy: 'u-admin' },
    { ...base, id: 'h-zeromile', name: 'Zero Mile Stone', localName: 'Zero Mile', category: 'Monument', tags: ['survey', 'colonial'], lat: 21.1497, lng: 79.0806, locality: 'Civil Lines', district: 'Nagpur', state: 'Maharashtra',
      period: 'Early 20th century', description: 'A survey marker symbolising the geographic centre of India.', significance: 'A landmark of the Great Trigonometrical Survey legacy.',
      localStory: '', localStoryLabel: '', language: 'English', sources: ['Public records'], verification: { status: 'Community Verified', verifier: 'Admin', date: now() }, condition: 'Good', submittedBy: 'u-admin' },
    { ...base, id: 'h-deeksha', name: 'Deekshabhoomi', localName: 'Deekshabhoomi', category: 'Religious', tags: ['stupa', 'social history'], lat: 21.1263, lng: 79.051, locality: 'South Nagpur', district: 'Nagpur', state: 'Maharashtra',
      period: '1956 onwards', description: 'Sacred monument and pilgrimage site of the Ambedkarite Buddhist community.', significance: 'Site of the 1956 mass conversion led by Dr B. R. Ambedkar.',
      localStory: '', localStoryLabel: '', language: 'English', sources: ['Public records'], verification: { status: 'Community Verified', verifier: 'Admin', date: now() }, condition: 'Good', submittedBy: 'u-admin' },
    { ...base, id: 'h-itwari', name: 'Itwari Market Lanes', localName: 'Itwari Bazaar', category: 'Craft', tags: ['market', 'trade'], lat: 21.145, lng: 79.103, locality: 'Itwari', district: 'Nagpur', state: 'Maharashtra',
      period: 'Historic market (approx. dates unknown)', description: 'Old market lanes where traders and craftspeople have worked for generations.', significance: 'A living trading tradition that is rarely documented.',
      localStory: 'Traders describe family stalls passed down through generations.', localStoryLabel: 'Community-sourced', language: 'English', sources: ['Community source'], verification: { status: 'Community Submitted', verifier: '', date: now() }, condition: 'Needs Attention', submittedBy: 'u-asha' },
    { ...base, id: 'h-marbat', name: 'Marbat Procession', localName: 'Marbat', category: 'Festival', tags: ['pola', 'folk tradition'], lat: 21.148, lng: 79.1, locality: 'Old city', district: 'Nagpur', state: 'Maharashtra',
      period: 'Traditional / annual', description: 'A local folk procession tradition associated with the monsoon festival season.', significance: 'Intangible heritage carried by neighbourhoods.',
      localStory: '', localStoryLabel: '', language: 'English', sources: ['Community source'], verification: { status: 'Community Submitted', verifier: '', date: now() }, condition: 'Good', submittedBy: 'u-ravi' },
    { ...base, id: 'h-tarri', name: 'Tarri Poha Tradition', localName: 'Tarri Poha', category: 'Food', tags: ['street food', 'local cuisine'], lat: 21.1458, lng: 79.0882, locality: 'Central Nagpur', district: 'Nagpur', state: 'Maharashtra',
      period: 'Traditional', description: 'A beloved breakfast tradition of poha served with spicy tarri (curry).', significance: 'Food heritage that defines morning culture.',
      localStory: '', localStoryLabel: '', language: 'English', sources: ['Community source'], verification: { status: 'Community Submitted', verifier: '', date: now() }, condition: 'Good', submittedBy: 'u-asha' }
  ],
  quizzes: [
    { id: 'q-stepwell', heritageId: 'h-stepwell', status: 'approved', questions: [
      { q: 'What was the Old Stepwell mainly used for?', options: ['Trade', 'Community gathering and water', 'Military defence'], answer: 1 },
      { q: 'Roughly when is it believed to date from?', options: ['18th century (uncertain)', '1990s', '5th century BCE'], answer: 0 }] },
    { id: 'q-sitabuldi', heritageId: 'h-sitabuldi', status: 'approved', questions: [
      { q: 'Which battle is Sitabuldi Fort associated with?', options: ['Battle of Plassey', 'Battle of Sitabuldi (1817)', 'Battle of Panipat'], answer: 1 }] },
    { id: 'q-zeromile', heritageId: 'h-zeromile', status: 'approved', questions: [
      { q: 'What does the Zero Mile Stone symbolise?', options: ['Geographic centre of India', 'A royal tomb', 'A river source'], answer: 0 }] }
  ],
  events: [
    { id: 'e-nagpur-fest', title: 'Nagpur Heritage Festival Challenge', description: 'Explore Nagpur\'s hidden heritage and take part in cultural challenges.', lat: 21.1458, lng: 79.0882, district: 'Nagpur', heritageId: 'h-stepwell',
      startsAt: '2026-10-01', endsAt: '2026-12-31', badge: 'Nagpur Heritage Explorer', status: 'published',
      missions: [
        { id: 'm-quiz', type: 'quiz', title: 'Take the Old Stepwell quiz', quizId: 'q-stepwell', xp: 20 },
        { id: 'm-draw', type: 'drawing', title: 'Submit "My Heritage, My Nagpur" drawing', xp: 50 },
        { id: 'm-song', type: 'song', title: 'Upload a folk song or dance', xp: 50 },
        { id: 'm-photo', type: 'photo', title: 'Complete a photo mission: an architecture detail', xp: 30 },
        { id: 'm-elder', type: 'storytelling', title: 'Record an elder explaining a local tradition', xp: 50 }
      ] }
  ],
  entries: [],
  hunts: [
    { id: 'hunt-nagpur', title: 'Nagpur Heritage Hunt', difficulty: 'Easy', startsAt: '2026-10-01', endsAt: '2026-12-31', badge: 'Heritage Hunter',
      safety: 'Stay in public, safe areas. Never enter closed, protected or unsafe structures. Photo proof is enough.',
      locations: [
        { heritageId: 'h-zeromile', clue: 'Find the marker that claims to be the centre of the country.', keywords: ['zero', 'centre', 'center', 'india'], question: 'What does the Zero Mile Stone symbolise?', options: ['Geographic centre of India', 'A river source', 'A royal tomb'], answer: 0, mission: 'Take a photo of the marker from a safe public spot.' },
        { heritageId: 'h-sitabuldi', clue: 'A hill fort tied to an 1817 battle.', keywords: ['1817', 'battle', 'sitabuldi'], question: 'Which battle is associated with Sitabuldi Fort?', options: ['Battle of Sitabuldi', 'Battle of Plassey', 'Battle of Haldighati'], answer: 0, mission: 'Photograph the view toward the city from a permitted viewpoint.' }
      ] }
  ],
  conditionReports: [],
  misinformationReports: [],
  aiDrafts: []
};
