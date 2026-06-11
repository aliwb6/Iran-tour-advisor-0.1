import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/supabaseClient';
import { MessageSquare, Search, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';

const CARD = 'bg-white/[0.03] border border-white/[0.07] rounded-2xl';

// Rule-violation detection: contact details or attempts to move off-platform.
const RULES = [
  { label: 'Phone number', test: (t) => (t.match(/\+?\d[\d\s().-]{7,}\d/g) || []).some(s => s.replace(/\D/g, '').length >= 9) },
  { label: 'Email', test: (t) => /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(t) },
  { label: 'External link', test: (t) => /\b(https?:\/\/|www\.)\S+/i.test(t) },
  { label: 'Telegram', test: (t) => /\btelegram\b|\bt\.me\b|تلگرام/i.test(t) },
  { label: 'WhatsApp', test: (t) => /\bwhatsapp\b|\bwa\.me\b|واتساپ|واتس\s?اپ/i.test(t) },
  { label: 'Instagram', test: (t) => /\binstagram\b|\binsta\b|اینستا/i.test(t) },
  { label: 'Social handle', test: (t) => /(^|\s)@[a-z0-9_.]{3,}/i.test(t) },
];
const detectViolations = (text) => (text ? RULES.filter(r => r.test(text)).map(r => r.label) : []);

const fmtTime = (ts) => {
  try {
    return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

export default function AdminChatMonitor() {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeKey, setActiveKey] = useState(null);
  const [search, setSearch] = useState('');
  const [onlyFlagged, setOnlyFlagged] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError('');
      try {
        const [{ data: msgs, error: mErr }, { data: profs, error: pErr }] = await Promise.all([
          supabase.from('messages')
            .select('id, sender_id, receiver_id, content, created_at, is_read')
            .not('sender_id', 'is', null)
            .not('receiver_id', 'is', null)
            .order('created_at', { ascending: true }),
          supabase.from('profiles').select('id, full_name, email, role, avatar_url'),
        ]);
        if (mErr) throw mErr;
        if (pErr) throw pErr;
        if (cancelled) return;
        const pMap = {};
        (profs || []).forEach(p => { pMap[p.id] = p; });
        setProfiles(pMap);
        setMessages(msgs || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const nameOf = (id) => profiles[id]?.full_name || profiles[id]?.email || 'Unknown';
  const roleOf = (id) => profiles[id]?.role || '—';

  const threads = useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      const pair = [m.sender_id, m.receiver_id].sort();
      const key = pair.join('__');
      if (!map.has(key)) map.set(key, { key, a: pair[0], b: pair[1], items: [] });
      map.get(key).items.push({ ...m, violations: detectViolations(m.content) });
    }
    const list = Array.from(map.values()).map(t => {
      const last = t.items[t.items.length - 1];
      const flaggedCount = t.items.filter(i => i.violations.length > 0).length;
      return { ...t, last, flaggedCount, count: t.items.length };
    });
    list.sort((x, y) => new Date(y.last.created_at) - new Date(x.last.created_at));
    return list;
  }, [messages]);

  const visibleThreads = useMemo(() => {
    let list = threads;
    if (onlyFlagged) list = list.filter(t => t.flaggedCount > 0);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(t => nameOf(t.a).toLowerCase().includes(q) || nameOf(t.b).toLowerCase().includes(q));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, onlyFlagged, search, profiles]);

  const active = threads.find(t => t.key === activeKey) || null;
  const totalFlagged = threads.reduce((s, t) => s + t.flaggedCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-[hsl(178,85%,45%)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white font-bold text-lg">Chat Monitor</h2>
          <p className="text-white/40 text-xs mt-0.5">Oversight of guide ↔ tourist conversations</p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-white/[0.06] text-white/60">{threads.length} conversations</span>
          {totalFlagged > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />{totalFlagged} flagged
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by participant name…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,32%)] transition"
          />
        </div>
        <button
          onClick={() => setOnlyFlagged(v => !v)}
          className={`px-3 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
            onlyFlagged
              ? 'bg-red-500/15 text-red-400 border-red-500/25'
              : 'bg-white/[0.05] text-white/55 border-white/10 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Flagged only
        </button>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-20rem)] min-h-[420px]">
        <div className={`${CARD} overflow-y-auto`}>
          {visibleThreads.length === 0 ? (
            <div className="p-6 text-center text-white/40 text-sm">No conversations found.</div>
          ) : (
            visibleThreads.map(t => {
              const isActive = t.key === activeKey;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className={`w-full text-left px-4 py-3 border-b border-white/[0.05] transition ${
                    isActive ? 'bg-[hsl(178,85%,32%)]/15' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-medium truncate">
                      {nameOf(t.a)} <span className="text-white/30">↔</span> {nameOf(t.b)}
                    </p>
                    {t.flaggedCount > 0 && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[9px] font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />{t.flaggedCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/[0.06] text-white/45 capitalize">{roleOf(t.a)}</span>
                    <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/[0.06] text-white/45 capitalize">{roleOf(t.b)}</span>
                  </div>
                  <p className="text-white/40 text-xs truncate mt-1.5">{t.last?.content}</p>
                  <p className="text-white/25 text-[10px] mt-1">{fmtTime(t.last?.created_at)} · {t.count} msgs</p>
                </button>
              );
            })
          )}
        </div>

        <div className={`${CARD} flex flex-col`}>
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-2">
              <MessageSquare className="w-8 h-8" />
              <p className="text-sm">Select a conversation to review</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
                <p className="text-white text-sm font-semibold">
                  {nameOf(active.a)} <span className="text-white/30">↔</span> {nameOf(active.b)}
                </p>
                {active.flaggedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-medium flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />{active.flaggedCount} flagged
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {active.items.map(m => {
                  const mine = m.sender_id === active.a;
                  const flagged = m.violations.length > 0;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        flagged
                          ? 'bg-red-500/10 border border-red-500/30 text-white'
                          : mine
                            ? 'bg-white/[0.06] text-white/90'
                            : 'bg-[hsl(178,85%,32%)]/15 text-white/90'
                      }`}>
                        <p className="text-[10px] text-white/40 mb-1">{nameOf(m.sender_id)} · {fmtTime(m.created_at)}</p>
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        {flagged && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {m.violations.map(v => (
                              <span key={v} className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[9px] font-medium flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />{v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
