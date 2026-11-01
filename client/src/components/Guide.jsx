import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------
   WHAT THE GUIDE SAYS. Key = the page the button opens.
   Edit the text freely. Remove a line to make that button open directly.
------------------------------------------------------------------- */
export const GUIDE_MESSAGES = {
  '/map': 'Let’s explore! Tap any pin on the map to meet a hidden heritage story near you.',
  '/add': 'Ohh wow, you’ve got something new! Go ahead and add it. Make your contribution!',
  '/events': 'Festivals and challenges! Join one, complete the missions and earn Heritage XP.',
  '/hunt': 'Ready for an adventure? Follow the clues, but stay in safe public places.',
  '/assistant': 'Curious about a place? Ask away. I answer only from verified heritage entries.',
  '/leaderboard': 'See who is leading! Read stories and take quizzes to climb the ranks.',
  '/passport': 'This is your Heritage Passport. Every stamp is a place you discovered.',
};

/* ------------------------------------------------------------------
   THE GIRL: a layered, shaded illustration in a traditional saree
   (maang tikka, bindi, jhumkas, bangles, braid) with floating,
   blinking and waving animation for a soft 3D feel.
------------------------------------------------------------------- */
function GuideGirlDrawn({ className = '', waving = true }) {
  return (
    <svg viewBox="0 0 200 300" className={className} role="img" aria-label="Friendly guide wearing a traditional saree">
      <defs>
        <radialGradient id="gSkin" cx="45%" cy="40%" r="65%"><stop offset="0" stopColor="#F8D2AC" /><stop offset="1" stopColor="#D49565" /></radialGradient>
        <linearGradient id="gSaree" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C62E2E" /><stop offset="1" stopColor="#6E0F22" /></linearGradient>
        <linearGradient id="gBlouse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#12707F" /><stop offset="1" stopColor="#083943" /></linearGradient>
        <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD35C" /><stop offset="1" stopColor="#C98A00" /></linearGradient>
        <linearGradient id="gHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3A2A22" /><stop offset="1" stopColor="#120C0A" /></linearGradient>
      </defs>

      <ellipse cx="100" cy="288" rx="56" ry="8" fill="rgba(0,0,0,.28)" />

      {/* braid */}
      <path d="M126 70 C158 100 160 170 142 222" stroke="url(#gHair)" strokeWidth="15" fill="none" strokeLinecap="round" />
      <path d="M126 70 C158 100 160 170 142 222" stroke="#5a463a" strokeWidth="2" strokeDasharray="3 7" fill="none" />
      <circle cx="142" cy="227" r="5" fill="url(#gGold)" />
      <path d="M142 231 L138 244 M142 231 L142 246 M142 231 L146 244" stroke="url(#gGold)" strokeWidth="2" strokeLinecap="round" />

      {/* saree skirt, pleats and golden hem */}
      <path d="M60 148 Q100 160 140 148 L162 282 Q100 292 38 282 Z" fill="url(#gSaree)" />
      <path d="M82 158 L76 284 M100 160 L100 288 M118 158 L124 284" stroke="rgba(255,255,255,.2)" strokeWidth="2" />
      <path d="M39 270 Q100 280 161 270 L162 282 Q100 292 38 282 Z" fill="url(#gGold)" />

      {/* blouse and pallu */}
      <path d="M70 108 Q100 98 130 108 L136 152 Q100 160 64 152 Z" fill="url(#gBlouse)" />
      <path d="M68 104 L90 100 L146 188 L152 262 L122 268 L116 192 Z" fill="url(#gSaree)" opacity=".96" />
      <path d="M90 100 L146 188 L152 262" stroke="url(#gGold)" strokeWidth="4" fill="none" />

      {/* resting arm with bangles */}
      <path d="M72 114 Q60 140 62 168" stroke="#E2AC7E" strokeWidth="12" fill="none" strokeLinecap="round" />
      <circle cx="62" cy="172" r="6.5" fill="#E2AC7E" />
      <path d="M56 158 L68 160 M56 164 L68 166" stroke="url(#gGold)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="72" cy="114" r="10" fill="url(#gBlouse)" />

      {/* neck, hair, head */}
      <rect x="92" y="88" width="16" height="22" rx="6" fill="#D49565" />
      <ellipse cx="100" cy="58" rx="35" ry="37" fill="url(#gHair)" />
      <ellipse cx="70" cy="70" rx="4" ry="6" fill="#D9A075" />
      <ellipse cx="130" cy="70" rx="4" ry="6" fill="#D9A075" />
      <ellipse cx="100" cy="66" rx="30" ry="33" fill="url(#gSkin)" />
      <path d="M68 62 C70 34 130 34 132 62 C124 50 112 46 100 46 C88 46 76 50 68 62 Z" fill="url(#gHair)" />

      {/* maang tikka, bindi, jhumkas */}
      <path d="M100 46 L100 54" stroke="url(#gGold)" strokeWidth="1.6" />
      <circle cx="100" cy="57" r="3" fill="url(#gGold)" />
      <circle cx="100" cy="64" r="2.4" fill="#B3261E" />
      <circle cx="70" cy="78" r="3.2" fill="url(#gGold)" />
      <path d="M67 80 L73 80 L70 89 Z" fill="url(#gGold)" />
      <circle cx="130" cy="78" r="3.2" fill="url(#gGold)" />
      <path d="M127 80 L133 80 L130 89 Z" fill="url(#gGold)" />

      {/* face */}
      <path d="M81 64 Q88 60 95 63 M105 63 Q112 60 119 64" stroke="#1B1210" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g className="g-blink"><ellipse cx="88" cy="72" rx="5.2" ry="3.6" fill="#fff" /><circle cx="88" cy="72" r="2.5" fill="#2b1a14" /><circle cx="89" cy="71" r=".8" fill="#fff" /><path d="M82 70 Q88 66 94 70" stroke="#1B1210" strokeWidth="1.8" fill="none" /></g>
      <g className="g-blink"><ellipse cx="112" cy="72" rx="5.2" ry="3.6" fill="#fff" /><circle cx="112" cy="72" r="2.5" fill="#2b1a14" /><circle cx="113" cy="71" r=".8" fill="#fff" /><path d="M106 70 Q112 66 118 70" stroke="#1B1210" strokeWidth="1.8" fill="none" /></g>
      <path d="M100 74 Q97 82 101 83" stroke="#B97B4E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="82" cy="83" r="5" fill="#E8837B" opacity=".3" />
      <circle cx="118" cy="83" r="5" fill="#E8837B" opacity=".3" />
      <path d="M92 89 Q100 98 108 89 Q100 92 92 89 Z" fill="#C2475A" />

      {/* necklace */}
      <path d="M84 108 Q100 124 116 108" stroke="url(#gGold)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="121" r="3" fill="url(#gGold)" />

      {/* waving arm */}
      <g className={waving ? 'g-wave' : ''}>
        <path d="M128 116 Q150 100 160 74" stroke="#E2AC7E" strokeWidth="12" fill="none" strokeLinecap="round" />
        <circle cx="161" cy="66" r="8" fill="#E2AC7E" />
        <path d="M156 60 L154 52 M161 58 L161 49 M166 60 L168 52" stroke="#E2AC7E" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M147 92 L157 96 M151 84 L161 88" stroke="url(#gGold)" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="128" cy="114" r="10" fill="url(#gBlouse)" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------
   THE GUIDE: your photo-style girl (public/guide/girl.png).
   If the picture is missing, the drawn girl above is shown instead.
------------------------------------------------------------------- */
export function GuideGirl({ className = '', talking = false }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <GuideGirlDrawn className={className} />;
  return (
    <img
      src="/guide/girl.png"
      alt="Friendly guide wearing a traditional saree"
      className={`${className} ${talking ? 'g-talk' : ''} select-none`}
      draggable="false"
      onError={() => setBroken(true)}
    />
  );
}

/* ------------------------------------------------------------------
   VOICE: uses the browser's built-in speech (free, no key needed).
   Browsers only allow sound after the visitor clicks or taps something.
------------------------------------------------------------------- */
if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.getVoices(); // warm up the voice list

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  const indian = voices.filter((v) => /en[-_]IN/i.test(v.lang));
  const pool = indian.length ? indian : voices.filter((v) => /^en/i.test(v.lang));
  return pool.find((v) => /heera|neerja|veena|female|zira|samantha|natural/i.test(v.name)) || pool[0] || null;
}

export function speak(text, onEnd) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  if (!synth) { onEnd?.(); return false; }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'en-IN'; }
  u.rate = 0.95;
  u.pitch = 1.15; // a little higher, friendlier voice
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
  return true;
}
export function stopSpeaking() { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); }

const GREETING = 'Namaste! Welcome to the Heritage of India. I am your guide. Let me show you the stories hiding in plain sight.';

function Mandala({ className = '' }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      {[92, 78, 62, 46].map((r, i) => <circle key={r} r={r} strokeWidth={i % 2 ? 1 : 2} strokeDasharray={i % 2 ? '2 5' : undefined} />)}
      {Array.from({ length: 12 }).map((_, i) => <ellipse key={i} rx="9" ry="30" cy="-62" transform={`rotate(${i * 30})`} strokeWidth="1.5" />)}
      {Array.from({ length: 8 }).map((_, i) => <ellipse key={'b' + i} rx="6" ry="20" cy="-34" transform={`rotate(${i * 45 + 22.5})`} strokeWidth="1.5" />)}
    </svg>
  );
}

/* ------------------------------------------------------------------
   FIRST-VISIT WELCOME SCREEN
   - Closes by itself after 6 seconds.
   - "Hear my greeting" speaks the welcome, then opens Home when she finishes.
------------------------------------------------------------------- */
export function Splash({ onDone }) {
  const { voiceOn } = useGuide();
  const [leaving, setLeaving] = useState(false);
  const [talking, setTalking] = useState(false);
  const done = useRef(false);
  const timer = useRef(null);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    stopSpeaking();
    setTalking(false);
    setLeaving(true);
    setTimeout(onDone, 600);
  };
  useEffect(() => { timer.current = setTimeout(finish, 6000); return () => clearTimeout(timer.current); }, []);

  const hear = () => {
    clearTimeout(timer.current); // wait for her to finish instead of the 6-second timer
    setTalking(true);
    speak(GREETING, () => { setTalking(false); setTimeout(finish, 800); });
  };

  return (
    <div
      className={`fixed inset-0 z-[3000] flex flex-col items-center justify-end overflow-hidden px-4 text-center text-white transition-all duration-500 ${leaving ? 'scale-105 opacity-0' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(circle at 50% 60%, #1d7f90 0%, #0B5563 38%, #12202B 100%)' }}
      role="dialog"
      aria-label="Welcome"
    >
      <Mandala className="spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 text-marigold/20" />
      <div className="relative z-10 mb-4 flex flex-col items-center">
        <h1 className="fade-up text-3xl font-extrabold sm:text-5xl">Namaste! 🙏</h1>
        <p className="fade-up delay-1 mt-2 max-w-xl text-xl font-semibold text-marigold sm:text-2xl">Welcome to the Heritage of India</p>
        <p className="fade-up delay-2 mt-2 max-w-md text-sm opacity-90">I’m your guide. Let me show you the stories hiding in plain sight.</p>
        <div className="fade-up delay-3 mt-4 flex flex-wrap justify-center gap-2">
          {voiceOn && <button className="btn-alt !px-5 !py-2.5" onClick={hear}>🔊 Hear my greeting</button>}
          <button className="btn-ghost !border-white !px-5 !py-2.5 !text-white hover:!bg-white hover:!text-ink" onClick={finish}>Enter</button>
        </div>
        <div className="mt-4 h-1 w-48 overflow-hidden rounded bg-white/25"><div className="h-full bg-marigold" style={{ animation: 'fillBar 6s linear forwards' }} /></div>
      </div>
      <GuideGirl talking={talking} className="g-float relative z-10 -mb-2 w-52 drop-shadow-2xl sm:w-64 md:w-72" />
    </div>
  );
}

/* ------------------------------------------------------------------
   GUIDE POPUP: appears small when a main button is clicked.
   She speaks the tip; after "Glad!" the page opens as normal.
------------------------------------------------------------------- */
const Ctx = createContext({ go: () => false, enabled: true, setEnabled: () => {}, voiceOn: true, setVoiceOn: () => {} });
export const useGuide = () => useContext(Ctx);

export function GuideProvider({ children }) {
  const navigate = useNavigate();
  const [enabled, setEnabledState] = useState(() => localStorage.getItem('hhm_guide') !== 'off');
  const [voiceOn, setVoiceOnState] = useState(() => localStorage.getItem('hhm_voice') !== 'off');
  const [talk, setTalk] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const setEnabled = (v) => {
    localStorage.setItem('hhm_guide', v ? 'on' : 'off');
    setEnabledState(v);
    if (!v) { setTalk(null); stopSpeaking(); }
  };
  const setVoiceOn = (v) => {
    localStorage.setItem('hhm_voice', v ? 'on' : 'off');
    setVoiceOnState(v);
    if (!v) { stopSpeaking(); setSpeaking(false); }
  };
  const seen = () => { try { return JSON.parse(sessionStorage.getItem('hhm_guide_seen') || '[]'); } catch { return []; } };

  // Returns true when the guide takes over (the caller then stops the normal click).
  const go = (to) => {
    const msg = GUIDE_MESSAGES[to];
    if (!enabled || !msg || seen().includes(to)) return false; // each tip shows once per visit
    sessionStorage.setItem('hhm_guide_seen', JSON.stringify([...seen(), to]));
    setTalk({ to, msg });
    if (voiceOn) { setSpeaking(true); speak(msg, () => setSpeaking(false)); }
    return true;
  };
  const glad = () => { const t = talk; stopSpeaking(); setSpeaking(false); setTalk(null); if (t) navigate(t.to); };

  useEffect(() => {
    if (!talk) return;
    const onKey = (e) => { if (e.key === 'Escape') glad(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [talk]);

  return (
    <Ctx.Provider value={{ go, enabled, setEnabled, voiceOn, setVoiceOn }}>
      {children}
      {talk && (
        <div className="pop-in fixed bottom-0 right-3 z-[2500] flex max-w-md items-end gap-1" role="dialog" aria-live="polite">
          <div className="relative mb-16 rounded-2xl bg-white p-4 text-ink shadow-2xl">
            <p className="text-sm font-semibold leading-snug">{talk.msg}</p>
            <button className="btn-alt mt-3" onClick={glad} autoFocus>Glad! 😊</button>
            <span className="absolute -right-2 bottom-5 h-4 w-4 rotate-45 bg-white" />
          </div>
          <GuideGirl talking={speaking} className="w-28 shrink-0 drop-shadow-xl sm:w-32" />
        </div>
      )}
    </Ctx.Provider>
  );
}
