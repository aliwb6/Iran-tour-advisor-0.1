import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, Bell, CalendarDays, MessageCircle,
  User, Settings, LogOut, Loader2,
} from 'lucide-react';

const NAV = [
  { id: 'overview',    label: 'Overview',         Icon: LayoutDashboard },
  { id: 'new-request', label: 'New Trip Request',  Icon: PlusCircle },
  { id: 'my-requests', label: 'My Requests',       Icon: Bell },
  { id: 'bookings',    label: 'My Bookings',       Icon: CalendarDays },
  { id: 'chat',        label: 'Messages',          Icon: MessageCircle },
  { id: 'manage',      label: 'Manage Profile',    Icon: User },
  { id: 'settings',    label: 'Settings',          Icon: Settings },
];

function EmptySection({ section }) {
  const item = NAV.find(n => n.id === section) || NAV[0];
  const { Icon, label } = item;
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-white/20" />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">{label}</h2>
        <p className="text-white/40 text-sm max-w-xs">Coming soon — we'll build this in the next phase</p>
      </div>
    </div>
  );
}

function Sidebar({ section, onNavigate, userName, onLogout }) {
  const activeId = section || 'overview';

  return (
    <aside className="w-[190px] flex-shrink-0 h-screen sticky top-0 bg-[hsl(222,55%,8%)] border-r border-white/[0.07] flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[hsl(178,85%,32%)] flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm leading-tight">
            Iran Tour<br />
            <span className="text-[hsl(38,62%,58%)] font-normal text-[10px] tracking-wider uppercase">Profile</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/[0.07]">
        <div className="w-9 h-9 rounded-xl bg-[hsl(178,85%,32%)] flex items-center justify-center mb-2">
          <span className="text-white text-sm font-bold">
            {userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </span>
        </div>
        <p className="text-white text-xs font-medium leading-tight truncate">{userName || 'Tourist'}</p>
        <p className="text-white/40 text-[10px] capitalize mt-0.5">Tourist</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all duration-150 ${
              activeId === item.id
                ? 'bg-[hsl(178,85%,32%)]/20 text-[hsl(178,85%,50%)]'
                : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <item.Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-white/[0.07] pt-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { section = 'overview' } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (prof?.role === 'guide' || prof?.role === 'agency') {
        navigate('/dashboard');
        return;
      }
      if (prof?.role === 'admin') {
        navigate('/admin');
        return;
      }

      setProfile(prof || {});
      setLoading(false);
    }
    init();
  }, [navigate]);

  const nav = (sec) => navigate(sec === 'overview' ? '/profile' : `/profile/${sec}`);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(222,55%,8%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[hsl(178,85%,45%)] animate-spin" />
          <p className="text-white/40 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(222,50%,10%)] flex" style={{ fontFamily: 'inherit' }}>
      <Sidebar
        section={section}
        onNavigate={nav}
        userName={profile?.full_name}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <EmptySection section={section} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
