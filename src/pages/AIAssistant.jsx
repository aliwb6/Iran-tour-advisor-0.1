import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Loader2, ArrowLeft, ArrowRight, MapPin, Clock, DollarSign, MessageCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { avatarFor } from '@/lib/avatar';

// ── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(tours, guides) {
  const toursList = tours.length
    ? tours.map((t) => {
        const cities = Array.isArray(t.cities) ? t.cities.join(', ') : (t.cities || '');
        return [
          `- slug: ${t.slug || t.id}`,
          `  title: ${t.title || ''}`,
          `  cities: ${t.city || cities || t.location || ''}`,
          `  duration: ${t.duration ?? '?'} days`,
          `  price: ${t.price != null ? `$${t.price}` : '—'}`,
          `  theme: ${Array.isArray(t.theme) ? t.theme.join(', ') : (t.theme || '')}`,
          `  purpose: ${Array.isArray(t.purpose) ? t.purpose.join(', ') : (t.purpose || '')}`,
          `  description: ${(t.description || '').slice(0, 160)}`,
        ].join('\n');
      }).join('\n\n')
    : '(no published tours available right now)';

  const guidesList = guides.length
    ? guides.map((g) => {
        const specialties = Array.isArray(g.specialties) ? g.specialties.join(', ') : (g.specialties || '');
        return [
          `- id: ${g.id}`,
          `  name: ${g.full_name || ''}`,
          `  city: ${g.city || ''}`,
          `  specialties: ${specialties}`,
          `  bio: ${(g.bio || '').slice(0, 140)}`,
        ].join('\n');
      }).join('\n\n')
    : '(no guides available right now)';

  return `You are a warm, knowledgeable Iranian travel advisor for Iran Tour Advisor. You chat with international travellers like a friendly local expert who happens to know everyone and everything in Iran.

HOW TO CHAT:
- Have a real, flowing conversation. Ask ONE natural question at a time and react to what the traveller says before moving on. Never present checklists, numbered steps, or bullet menus.
- Over the course of the conversation, gently learn: what draws them to Iran (interests/purpose), how long they're staying, which cities or regions appeal to them, their travel style / budget, and whether they're travelling solo / as a couple / in a group / with family.
- Keep replies tight (2–4 sentences). Warm, culturally sensitive. Sprinkle a Persian word when natural ("salaam", "khosh amadid", "befarmaid"). No emoji spam.
- Always reply in the same language the traveller writes in (English / Persian / Arabic).

HOW TO RECOMMEND:
- Once you have enough context to recommend confidently (usually after 3–5 exchanges), write a friendly recommendation paragraph naming 2–3 specific tours and 1–2 specific guides FROM THE CATALOGUE BELOW.
- IMMEDIATELY AFTER your recommendation paragraph, append a fenced JSON block on its own line — exactly this shape, no extra prose around it:
\`\`\`json
{"tour_slugs": ["slug-1", "slug-2"], "guide_ids": ["uuid-1"]}
\`\`\`
- Use slugs and ids EXACTLY as they appear below. Do NOT invent. Use empty arrays if you genuinely have nothing matching.
- Do NOT include the JSON block while you are still asking questions. Only emit it on the turn where you are actually recommending. You may emit it again later if the traveller asks for different options.

AVAILABLE TOURS:
${toursList}

LOCAL GUIDES:
${guidesList}`;
}

// ── Recommendation parsing ─────────────────────────────────────────────────

const JSON_FENCE = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;

function extractRecommendation(raw, tours, guides) {
  if (!raw) return { content: '', tours: [], guides: [] };
  const match = raw.match(JSON_FENCE);
  if (!match) return { content: raw, tours: [], guides: [] };
  try {
    const json = JSON.parse(match[1]);
    const slugs = Array.isArray(json.tour_slugs) ? json.tour_slugs : [];
    const ids = Array.isArray(json.guide_ids) ? json.guide_ids : [];
    const recTours = slugs
      .map((s) => tours.find((tr) => tr.slug === s || String(tr.id) === String(s)))
      .filter(Boolean);
    const recGuides = ids
      .map((id) => guides.find((g) => String(g.id) === String(id)))
      .filter(Boolean);
    return {
      content: raw.replace(JSON_FENCE, '').trim(),
      tours: recTours,
      guides: recGuides,
    };
  } catch {
    return { content: raw, tours: [], guides: [] };
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AIAssistant() {
  const { t, dir, lang } = useI18n();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [catalogue, setCatalogue] = useState({ tours: [], guides: [], ready: false });

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  // Initial greeting (instant, no API call)
  useEffect(() => {
    const greet = lang === 'fa'
      ? 'سلام! من راهنمای سفر هوشمند ایران تور ادوایزر هستم. بگو ببینم، چه چیزی تو را به ایران می‌کشاند؟'
      : lang === 'ar'
      ? 'مرحباً! أنا مستشار سفرك إلى إيران من Iran Tour Advisor. أخبرني، ما الذي يجذبك إلى إيران؟'
      : "Salaam! I'm your Iran travel advisor at Iran Tour Advisor. Tell me — what's drawing you to Iran?";
    setMessages([{ role: 'assistant', content: greet }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch tours + guides once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [toursRes, guidesRes] = await Promise.all([
        supabase.from('tours').select('*').eq('status', 'published'),
        supabase.from('profiles').select('*').in('role', ['guide', 'agency']),
      ]);
      if (cancelled) return;
      if (toursRes.error) console.error('[AIAssistant] tours fetch:', toursRes.error);
      if (guidesRes.error) console.error('[AIAssistant] guides fetch:', guidesRes.error);
      setCatalogue({
        tours: toursRes.data || [],
        guides: guidesRes.data || [],
        ready: true,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!apiKey) {
      console.warn('[AIAssistant] VITE_OPENROUTER_API_KEY is missing. Did you restart the dev server after editing .env?');
    }
  }, [apiKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!apiKey) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Missing VITE_OPENROUTER_API_KEY. Add it to .env and restart the dev server.',
      }]);
      return;
    }

    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(catalogue.tours, catalogue.guides);
      const history = nextMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content }) => ({ role, content }));

      const body = {
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
        ],
      };
      console.log('[AIAssistant] OpenRouter request', { model: body.model, turns: history.length });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Iran Tour Advisor',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        console.error('[AIAssistant] OpenRouter error', response.status, detail);
        throw new Error(`OpenRouter ${response.status}: ${detail || response.statusText}`);
      }
      const json = await response.json();
      const raw = json?.choices?.[0]?.message?.content;
      if (!raw) {
        console.error('[AIAssistant] Empty OpenRouter response', json);
        throw new Error('Empty response from the assistant');
      }

      const { content, tours, guides } = extractRecommendation(raw, catalogue.tours, catalogue.guides);
      const assistantMsg = { role: 'assistant', content };
      if (tours.length > 0 || guides.length > 0) {
        assistantMsg.cards = { tours, guides };
      }
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[AIAssistant] request failed', err);
      const friendly = lang === 'fa'
        ? `متأسفم، در ارتباط با دستیار مشکلی پیش آمد. (${err.message})`
        : lang === 'ar'
        ? `عذراً، تعذر الاتصال بالمساعد. (${err.message})`
        : `Sorry — I couldn't reach the assistant. (${err.message})`;
      setMessages((prev) => [...prev, { role: 'assistant', content: friendly }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div dir={dir} className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="relative px-4 sm:px-6 py-6 text-center border-b border-border/30">
        <Link
          to="/"
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-secondary hover:bg-accent/10 flex items-center justify-center transition-colors"
          aria-label="Home"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-body text-xs text-accent font-medium">AI-Powered</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-light text-foreground">{t('ai_title')}</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">{t('ai_subtitle')}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3 shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-accent text-white rounded-br-md'
                        : 'bg-card border border-border/50 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ReactMarkdown className="font-body text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {msg.cards && (msg.cards.tours.length > 0 || msg.cards.guides.length > 0) && (
                    <div className="mt-3 space-y-3">
                      {msg.cards.tours.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.cards.tours.map((tour) => (
                            <TourCard key={tour.id} tour={tour} />
                          ))}
                        </div>
                      )}
                      {msg.cards.guides.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.cards.guides.map((guide) => (
                            <GuideCard key={guide.id} guide={guide} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3 mt-1">
                <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-4 sm:px-6 bg-background">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('ai_placeholder')}
            disabled={loading}
            autoFocus
            className="flex-1 bg-secondary rounded-xl px-4 py-3 font-body text-sm border border-border/50 focus:border-accent/50 outline-none transition-colors disabled:opacity-60"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
            aria-label="Send"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card components ─────────────────────────────────────────────────────────

function TourCard({ tour }) {
  const cities = Array.isArray(tour.cities) ? tour.cities.join(' · ') : (tour.cities || tour.location || '');
  const img = tour.image_url || (Array.isArray(tour.gallery) && tour.gallery[0]) ||
    'https://images.unsplash.com/photo-1564960723835-2898c9df9297?w=600&h=400&fit=crop';
  const href = tour.slug ? `/tours/${tour.slug}` : '/tours';
  return (
    <Link
      to={href}
      className="group flex gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-accent/40 hover:shadow-md transition-all"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary">
        <img src={img} alt={tour.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
          {tour.title || 'Untitled tour'}
        </p>
        {cities && (
          <p className="font-body text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-accent" />
            {cities}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
          {tour.duration != null && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tour.duration}d
            </span>
          )}
          {tour.price != null && (
            <span className="flex items-center gap-1 text-accent font-semibold">
              <DollarSign className="w-3 h-3" />
              {Number(tour.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground self-center shrink-0 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function GuideCard({ guide }) {
  const specialties = Array.isArray(guide.specialties) ? guide.specialties.slice(0, 2).join(' · ') : '';
  return (
    <Link
      to={`/guides/${guide.id}`}
      className="group flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-accent/40 hover:shadow-md transition-all"
    >
      <img
        src={avatarFor(guide)}
        alt=""
        className="w-12 h-12 rounded-full object-cover border-2 border-gold/40 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-heading text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
          {guide.full_name || 'Local guide'}
        </p>
        {guide.city && (
          <p className="font-body text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-accent" />
            {guide.city}
          </p>
        )}
        {specialties && (
          <p className="font-body text-[11px] text-muted-foreground truncate mt-0.5">{specialties}</p>
        )}
      </div>
      <MessageCircle className="w-3.5 h-3.5 text-accent shrink-0" />
    </Link>
  );
}
