import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n.jsx';
import { avatarFor } from '@/lib/avatar';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, Loader2, MessageCircle } from 'lucide-react';

export default function Chat() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { lang, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const [guide, setGuide] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);

  // Auth guard
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoadingAuth, isAuthenticated, navigate]);

  // Initial load: guide profile + message history
  useEffect(() => {
    if (!user || !guideId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [guideRes, msgsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', guideId).single(),
          supabase
            .from('messages')
            .select('*')
            .or(
              `and(sender_id.eq.${user.id},receiver_id.eq.${guideId}),and(sender_id.eq.${guideId},receiver_id.eq.${user.id})`
            )
            .order('created_at', { ascending: true }),
        ]);

        if (cancelled) return;
        if (guideRes.error) throw guideRes.error;
        if (msgsRes.error) throw msgsRes.error;

        setGuide(guideRes.data);
        setMessages(msgsRes.data || []);

        const unreadIds = (msgsRes.data || [])
          .filter((m) => m.receiver_id === user.id && !m.is_read)
          .map((m) => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, guideId]);

  // Realtime: incoming messages from this guide
  useEffect(() => {
    if (!user || !guideId) return;
    const channel = supabase
      .channel(`chat-${user.id}-${guideId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const m = payload.new;
          if (m.sender_id !== guideId) return;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          await supabase.from('messages').update({ is_read: true }).eq('id', m.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, guideId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !user || !guideId || sending) return;
    setSending(true);
    setInput('');
    try {
      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: guideId,
          content: text,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      if (data) {
        setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data]));
      }
    } catch (err) {
      setError(err.message);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (isLoadingAuth || (loading && !error)) {
    return (
      <div dir={dir} className="min-h-screen bg-[hsl(222,55%,8%)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[hsl(178,85%,45%)] animate-spin" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div dir={dir} className="min-h-screen bg-[hsl(222,55%,8%)] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-white/25" />
          </div>
          <p className="text-white font-heading text-2xl mb-2">
            {lang === 'fa' ? 'کاربر یافت نشد' : lang === 'ar' ? 'المستخدم غير موجود' : 'User not found'}
          </p>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <Link to="/guides" className="text-[hsl(178,85%,55%)] hover:underline text-sm">
            ← {lang === 'fa' ? 'بازگشت' : lang === 'ar' ? 'رجوع' : 'Back'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-[hsl(222,55%,8%)] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.07] bg-[hsl(222,50%,10%)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Back"
          >
            <BackArrow className="w-4 h-4" />
          </button>
          <img
            src={avatarFor(guide)}
            alt={guide.full_name || ''}
            className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{guide.full_name || 'Guide'}</p>
            {guide.city && <p className="text-white/40 text-xs truncate">{guide.city}</p>}
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(178,85%,32%)]/15 text-[hsl(178,85%,55%)] border border-[hsl(178,85%,32%)]/25">
            {lang === 'fa' ? 'آنلاین' : lang === 'ar' ? 'متصل' : 'Live'}
          </span>
        </div>
      </header>

      {/* Message list */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/50 text-sm">
                {lang === 'fa'
                  ? 'هنوز پیامی رد و بدل نشده است'
                  : lang === 'ar'
                  ? 'لا توجد رسائل بعد'
                  : 'No messages yet'}
              </p>
              <p className="text-white/30 text-xs mt-1">
                {lang === 'fa'
                  ? 'گفت‌وگو را با یک سلام آغاز کنید'
                  : lang === 'ar'
                  ? 'ابدأ المحادثة بتحية'
                  : 'Start the conversation with a hello'}
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === user.id;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      mine
                        ? 'bg-[hsl(178,85%,32%)] text-white rounded-br-md'
                        : 'bg-white/[0.06] text-white/90 border border-white/[0.05] rounded-bl-md'
                    }`}
                  >
                    {m.content}
                    <div className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-white/40'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-white/[0.07] bg-[hsl(222,50%,10%)]">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              lang === 'fa'
                ? 'پیام خود را بنویسید...'
                : lang === 'ar'
                ? 'اكتب رسالتك...'
                : 'Type a message...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,32%)]/50 transition"
            dir="auto"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="w-10 h-10 rounded-xl bg-[hsl(178,85%,32%)] flex items-center justify-center text-white hover:bg-[hsl(178,85%,38%)] disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Send"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
