import { NavLink, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './auth.jsx';
import MapPage from './pages/MapPage.jsx';
import HeritagePage from './pages/HeritagePage.jsx';
import AddHeritage from './pages/AddHeritage.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Hunt from './pages/Hunt.jsx';
import Passport from './pages/Passport.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Admin from './pages/Admin.jsx';
import Assistant from './pages/Assistant.jsx';

const link = ({ isActive }) => `px-3 py-1.5 rounded-md text-sm font-semibold ${isActive ? 'bg-marigold text-ink' : 'text-white hover:bg-white/15'}`;

function LoginBox() {
  const { user, users, login, register, logout } = useAuth();
  const [name, setName] = useState('');
  if (user) return (
    <div className="flex items-center gap-2 text-white text-sm">
      <span>{user.name} <span className="opacity-70">({user.role})</span></span>
      <button className="underline" onClick={logout}>Log out</button>
    </div>
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Demo login" className="rounded-md px-2 py-1 text-sm text-ink" defaultValue="" onChange={(e) => e.target.value && login(e.target.value)}>
        <option value="">Demo login…</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
      </select>
      <input aria-label="New name" className="rounded-md px-2 py-1 text-sm text-ink w-28" placeholder="New name" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="btn-alt !py-1" onClick={() => name.trim() && register(name.trim())}>Join</button>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <header className="bg-water">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <NavLink to="/" className="text-lg font-extrabold text-white">Hidden Heritage Map <span className="ml-2 hidden text-xs font-normal opacity-80 md:inline">Explore. Participate. Preserve.</span></NavLink>
          <nav className="flex flex-wrap gap-1" aria-label="Main">
            <NavLink to="/" end className={link}>Map</NavLink>
            <NavLink to="/events" className={link}>Events</NavLink>
            <NavLink to="/hunt" className={link}>Heritage Hunt</NavLink>
            <NavLink to="/add" className={link}>Add Heritage</NavLink>
            <NavLink to="/assistant" className={link}>Ask AI</NavLink>
            <NavLink to="/leaderboard" className={link}>Leaderboard</NavLink>
            {user && <NavLink to="/passport" className={link}>My Passport</NavLink>}
            {['admin', 'expert'].includes(user?.role) && <NavLink to="/admin" className={link}>Admin</NavLink>}
          </nav>
          <LoginBox />
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/heritage/:id" element={<HeritagePage />} />
          <Route path="/add" element={<AddHeritage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/hunt" element={<Hunt />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<p className="p-6">Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
