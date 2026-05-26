// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, MapPin, Clock, Users, Wallet,
  Globe2, ChevronDown, Building2, Mountain, UtensilsCrossed,
  Leaf, Compass, Loader2, ArrowLeft, ArrowRight, DollarSign, Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/api.js';
import { avatarFor } from '@/lib/avatar';
import TripBuilder from '@/components/ai/TripBuilder';

// ── localStorage keys ──────────────────────────────────────────────────────────
const CHAT_STORAGE_KEY = 'iran_tour_ai_chat_history';
const MODEL_STORAGE_KEY = 'iran_tour_ai_selected_model';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  turq:     '#0D8B85',
  turqSoft: '#3FC7C1',
  turqDeep: '#0A6864',
  teal:     '#1A4A4A',
  white:    '#FFFFFF',
  mist:     '#F5FBFA',
  muted:    '#7A8C8C',
  ink:      '#0F2A2A',
  gold:     '#C9972B',
};

// ── Persian Rub-el-Hizb pattern ───────────────────────────────────────────────
function PersianPattern({ opacity = 0.06, color = C.turq, size = 72 }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full select-none pointer-events-none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        <pattern id="rub-el-hizb" width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="0.9">
            <rect x={size * 0.22} y={size * 0.22} width={size * 0.56} height={size * 0.56} />
            <rect
              x={size * 0.22} y={size * 0.22}
              width={size * 0.56} height={size * 0.56}
              transform={`rotate(45 ${size / 2} ${size / 2})`}
            />
            <circle cx={size / 2} cy={size / 2} r="1.6" fill={color} />
          </g>
          <g fill={color}>
            <circle cx="0" cy="0" r="1" /><circle cx={size} cy="0" r="1" />
            <circle cx="0" cy={size} r="1" /><circle cx={size} cy={size} r="1" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rub-el-hizb)" />
    </svg>
  );
}

// ── Aria avatar mark ──────────────────────────────────────────────────────────
function AriaMark({ size = 36, pulse = false }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 28%, ${C.turqSoft}, ${C.turq} 60%, ${C.turqDeep})`,
          boxShadow: `0 4px 12px ${C.turq}40, inset 0 0 0 1px ${C.turqDeep}80`,
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <Sparkles className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.2} />
      </div>
      {pulse && (
        <span className="absolute -inset-1 rounded-full animate-ping" style={{ background: `${C.turq}25` }} aria-hidden />
      )}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: C.muted }}
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Language switcher ─────────────────────────────────────────────────────────
const LANGS = [
  { code: 'en', label: 'English',  dir: 'ltr' },
  { code: 'fa', label: 'فارسی',    dir: 'rtl' },
  { code: 'ar', label: 'العربية',  dir: 'rtl' },
];

function ModelSelector({ model, onChange, open, setOpen }) {
  const current = AVAILABLE_MODELS.find((m) => m.id === model) || AVAILABLE_MODELS[0];
  return (
    <div className="relative z-[100]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
        style={{ background: '#ffffff70', backdropFilter: 'blur(12px)', border: `1px solid ${C.muted}30`, color: C.teal }}
        title="Select AI Model"
      >
        <span>🤖</span>
        <span>{current.name}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: C.muted }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 min-w-[200px] overflow-hidden rounded-2xl py-1 z-[9999]"
            style={{ background: C.white, border: `1px solid ${C.muted}25`, boxShadow: `0 12px 40px ${C.teal}15` }}
          >
            {AVAILABLE_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); }}
                className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                style={{ color: C.teal }}
              >
                <span>{m.name}</span>
                {m.id === model && <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.turq }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LanguageSwitcher({ lang, onChange }) {
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];
  return (
    <div className="relative z-[100]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
        style={{ background: '#ffffff70', backdropFilter: 'blur(12px)', border: `1px solid ${C.muted}30`, color: C.teal }}
      >
        <Globe2 className="h-4 w-4" style={{ color: C.turq }} />
        <span>{current.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: C.muted }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 min-w-[140px] overflow-hidden rounded-2xl py-1 z-[9999]"
            style={{ background: C.white, border: `1px solid ${C.muted}25`, boxShadow: `0 12px 40px ${C.teal}15` }}
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { onChange(l.code); setOpen(false); }}
                className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                style={{ color: C.teal }}
              >
                <span style={{ direction: l.dir }}>{l.label}</span>
                {l.code === lang && <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.turq }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Chat bubble ───────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flex w-full items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && <AriaMark size={32} />}
      <div className={`group max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <span className="mb-1 px-1 text-[11px] font-medium tracking-wide" style={{ color: C.muted }}>
            Aria
          </span>
        )}
        <div
          className={`relative rounded-3xl px-5 py-3.5 text-[14.5px] leading-relaxed shadow-sm ${
            isUser ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
          style={
            isUser
              ? { background: `linear-gradient(135deg, ${C.turq} 0%, ${C.turqDeep} 100%)`, color: '#FFFFFF', boxShadow: `0 6px 18px ${C.turq}30` }
              : { background: C.white, color: C.ink, border: `1px solid ${C.muted}20` }
          }
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <ReactMarkdown className="font-body text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
        {msg.cards && (msg.cards.tours.length > 0 || msg.cards.guides.length > 0) && (
          <div className="mt-3 space-y-3 w-full">
            {msg.cards.tours.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {msg.cards.tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
              </div>
            )}
            {msg.cards.guides.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {msg.cards.guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Profile chip ──────────────────────────────────────────────────────────────
function ProfileChip({ icon: Icon, label, value, filled, accent }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl p-4 transition-all"
      style={{
        background: filled ? C.white : `${C.muted}08`,
        border: `1px solid ${filled ? C.muted + '25' : C.muted + '15'}`,
        boxShadow: filled ? `0 4px 14px ${C.teal}08` : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: filled ? `${accent}15` : `${C.muted}10`, color: filled ? accent : C.muted }}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.08em]" style={{ color: C.muted }}>
            {label}
          </div>
          <div className="mt-0.5 truncate text-[14px] font-semibold" style={{ color: filled ? C.teal : `${C.muted}80` }}>
            {value || 'Listening…'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, title, trailing }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.turq }}>
          {eyebrow}
        </div>
        <h3 className="mt-1 text-[18px] font-bold leading-tight" style={{ color: C.teal }}>
          {title}
        </h3>
      </div>
      {trailing}
    </div>
  );
}

// ── Suggested replies ─────────────────────────────────────────────────────────
function SuggestedReplies({ suggestions, onPick }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-all hover:-translate-y-0.5"
          style={{ background: C.white, border: `1px solid ${C.muted}25`, color: C.teal }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ── Available AI models ────────────────────────────────────────────────────────
const AVAILABLE_MODELS = [
  { id: 'openrouter/auto', name: '🤖 Auto (Best Available)' },
  { id: 'openai/gpt-4-turbo', name: '⚡ GPT-4 Turbo' },
  { id: 'openai/gpt-3.5-turbo', name: '🔧 GPT-3.5 Turbo' },
  { id: 'meta-llama/llama-2-70b-chat', name: '🦙 Llama 2 70B' },
  { id: 'mistralai/mistral-7b-instruct', name: '✨ Mistral 7B' },
];

// ── System prompt ─────────────────────────────────────────────────────────────
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

// ── Recommendation parsing ────────────────────────────────────────────────────
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
    return { content: raw.replace(JSON_FENCE, '').trim(), tours: recTours, guides: recGuides };
  } catch {
    return { content: raw, tours: [], guides: [] };
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const { t, dir, lang, switchLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const cityHint = searchParams.get('city') || '';
  const initialMessage = location.state?.initialMessage || '';

  // Load messages from localStorage or initialize empty
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved).map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
  });

  // Load selected model from localStorage or use default
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const saved = localStorage.getItem(MODEL_STORAGE_KEY);
      return saved || 'openrouter/auto';
    } catch (error) {
      console.error('Error loading model selection:', error);
      return 'openrouter/auto';
    }
  });

  const [input, setInput] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [catalogue, setCatalogue] = useState({ tours: [], guides: [], ready: false });
  const [profile] = useState({ goal: '', duration: '', group: '', budget: '', vibes: [] });
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showTripBuilder, setShowTripBuilder] = useState(false);

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  // Initial greeting (only if no messages loaded)
  useEffect(() => {
    if (messages.length === 0) {
      const greet = cityHint
        ? (lang === 'fa'
            ? `سلام! دیدم به ${cityHint} علاقه داری — عالیه! چه چیزی تو را به این شهر می‌کشاند؟`
            : lang === 'ar'
            ? `مرحباً! أرى أنك مهتم بـ ${cityHint} — اختيار رائع! ما الذي يجذبك إلى هذه المدينة؟`
            : `Salaam! I see you're curious about ${cityHint} — great choice. What's drawing you there?`)
        : (lang === 'fa'
            ? 'سلام! من راهنمای سفر هوشمند ایران تور ادوایزر هستم. بگو ببینم، چه چیزی تو را به ایران می‌کشاند؟'
            : lang === 'ar'
            ? 'مرحباً! أنا مستشار سفرك إلى إيران من Iran Tour Advisor. أخبرني، ما الذي يجذبك إلى إيران؟'
            : "Salaam! I'm your Iran travel advisor at Iran Tour Advisor. Tell me — what's drawing you to Iran?");
      setMessages([{ role: 'assistant', content: greet }]);
    }
    if (cityHint && !input) {
      setInput(
        lang === 'fa'
          ? `می‌خواهم سفری به ${cityHint} برنامه‌ریزی کنم.`
          : lang === 'ar'
          ? `أرغب في التخطيط لرحلة إلى ${cityHint}.`
          : `I'd like to plan a trip to ${cityHint}.`
      );
    }
  }, [cityHint, lang, messages.length, input]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages]);

  // Save selected model to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    } catch (error) {
      console.error('Error saving model selection:', error);
    }
  }, [selectedModel]);

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
      setCatalogue({ tours: toursRes.data || [], guides: guidesRes.data || [], ready: true });
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!apiKey) {
      console.warn('[AIAssistant] VITE_OPENROUTER_API_KEY is missing. Did you restart the dev server after editing .env?');
    }
  }, [apiKey]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim().toLowerCase();
    if (!text || loading) return;

    // Check if user wants to create a custom trip
    const tripKeywords = ['custom trip', 'create trip', 'plan trip', 'custom itinerary', 'build trip'];
    const farsiKeywords = ['سفر سفارشی', 'سفر شخصی', 'برنامه‌ریزی سفر', 'ایجاد برنامه'];
    const arabicKeywords = ['رحلة مخصصة', 'خطة رحلة', 'خطة سفر'];

    const wantsTripBuilder = tripKeywords.some(kw => text.includes(kw)) ||
                           (lang === 'fa' && farsiKeywords.some(kw => text.includes(kw))) ||
                           (lang === 'ar' && arabicKeywords.some(kw => text.includes(kw)));

    if (wantsTripBuilder) {
      setShowTripBuilder(true);
      return;
    }

    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      const missing = lang === 'fa'
        ? 'کلید API موجود نیست. لطفاً فایل .env را بررسی کنید.'
        : lang === 'ar'
        ? 'مفتاح API مفقود. يرجى التحقق من ملف .env.'
        : 'API key is missing. Please check your .env file.';
      setMessages((prev) => [...prev, { role: 'assistant', content: missing }]);
      return;
    }

    const userMsg = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      console.log(`[API] Calling OpenRouter with model: ${selectedModel}`);
      const systemPromptText = buildSystemPrompt(catalogue.tours, catalogue.guides);
      const responseText = await sendChatMessage(nextMessages, systemPromptText, lang, selectedModel);
      console.log('[API] Success response received');
      const { content, tours, guides } = extractRecommendation(responseText, catalogue.tours, catalogue.guides);
      const assistantMsg = { role: 'assistant', content };
      if (tours.length > 0 || guides.length > 0) assistantMsg.cards = { tours, guides };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[APIError] request failed:', err);
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Sidebar recommendation data: use AI-picked cards if available, else catalogue slice
  const sidebarTours = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].cards?.tours?.length > 0) return messages[i].cards.tours.slice(0, 4);
    }
    return catalogue.tours.slice(0, 4);
  }, [messages, catalogue.tours]);

  const sidebarGuides = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].cards?.guides?.length > 0) return messages[i].cards.guides.slice(0, 3);
    }
    return catalogue.guides.slice(0, 3);
  }, [messages, catalogue.guides]);

  const hasRecommendations = catalogue.ready && (sidebarTours.length > 0 || sidebarGuides.length > 0);

  const suggestions = [
    t('ai_chip_architecture'),
    t('ai_chip_desert'),
    t('ai_chip_food'),
    t('ai_chip_history'),
  ];

  return (
    <div
      dir={dir}
      className="min-h-screen lg:h-screen w-full lg:overflow-hidden"
      style={{ background: C.white, color: C.ink }}
    >
      <div className="mx-auto flex flex-col lg:flex-row lg:h-full max-w-[1480px]">

        {/* ── Chat column ─────────────────────────────────────────────────── */}
        <section
          className="relative flex flex-col w-full lg:w-[60%] lg:border-r lg:h-full"
          style={{ borderColor: `${C.muted}20` }}
        >
          {/* Header */}
          <header className="relative overflow-visible px-6 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-9 shrink-0 z-50">
            <PersianPattern opacity={0.055} color={C.turq} size={64} />
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${C.turq}55, transparent)` }}
            />
            {/* Mobile back button — fixed top-left, only on small screens */}
            <button
              onClick={() => navigate(-1)}
              className="fixed left-4 top-4 z-20 lg:hidden flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
              style={{ background: C.white, border: `1px solid ${C.muted}20`, color: C.teal, boxShadow: `0 2px 8px ${C.teal}10` }}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Desktop back button — inline in header row */}
                <button
                  onClick={() => navigate(-1)}
                  className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl transition-colors shrink-0"
                  style={{ background: `${C.muted}10`, color: C.teal }}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <AriaMark size={48} pulse />
                <div>
                  <div
                    className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: C.turq }}
                  >
                    Iran Tour Advisor
                  </div>
                  <h1
                    className="mt-1 text-[22px] font-bold leading-tight sm:text-[28px]"
                    style={{ color: C.teal, letterSpacing: '-0.01em' }}
                  >
                    {t('ai_title')}
                  </h1>
                  <p className="mt-1 max-w-md text-[13px] leading-relaxed" style={{ color: C.muted }}>
                    {t('ai_subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <ModelSelector model={selectedModel} onChange={setSelectedModel} open={showModelPicker} setOpen={setShowModelPicker} />
                <button
                  onClick={() => {
                    if (window.confirm(lang === 'fa' ? 'آیا مطمئن هستید که می‌خواهید تاریخچه چت را پاک کنید؟' : lang === 'ar' ? 'هل تريد حذف سجل المحادثة؟' : 'Clear chat history?')) {
                      setMessages([]);
                      localStorage.removeItem(CHAT_STORAGE_KEY);
                    }
                  }}
                  className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ background: '#ffffff70', backdropFilter: 'blur(12px)', border: `1px solid ${C.muted}30`, color: C.teal }}
                  title={lang === 'fa' ? 'پاک کردن تاریخچه' : lang === 'ar' ? 'مسح السجل' : 'Clear chat'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <LanguageSwitcher lang={lang} onChange={switchLang} />
              </div>
            </div>
            {/* Decorative carpet hairline */}
            <div
              className="mt-6 h-[2px] w-full"
              style={{
                background: `repeating-linear-gradient(90deg, ${C.turq} 0 6px, transparent 6px 12px, ${C.muted} 12px 14px, transparent 14px 20px)`,
                opacity: 0.45,
              }}
            />
          </header>

          {/* Messages */}
          <div
            ref={scrollerRef}
            className="flex-1 min-h-0 overflow-y-auto px-6 py-6 sm:px-10"
            style={{ minHeight: 320 }}
          >
            <div className="mx-auto flex max-w-[680px] flex-col gap-5">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-end gap-3"
                >
                  <AriaMark size={32} />
                  <div
                    className="rounded-3xl rounded-bl-md px-5 py-3.5"
                    style={{ background: C.white, border: `1px solid ${C.muted}20` }}
                  >
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="relative px-6 pb-7 pt-4 sm:px-10 shrink-0" style={{ background: C.white }}>
            <SuggestedReplies
              suggestions={suggestions}
              onPick={(text) => { setInput(text); inputRef.current?.focus(); }}
            />
            <div
              className="mt-3 flex items-center gap-2 rounded-2xl pl-4 pr-2 py-2"
              style={{
                background: C.white,
                border: `1px solid ${C.muted}30`,
                boxShadow: `0 6px 24px ${C.teal}10`,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t('ai_placeholder')}
                disabled={loading}
                autoFocus
                className="flex-1 bg-transparent text-[14.5px] outline-none placeholder:opacity-60 disabled:opacity-60"
                style={{ color: C.teal }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${C.turq}, ${C.turqDeep})`,
                  color: '#FFFFFF',
                  boxShadow: `0 6px 18px ${C.turq}40`,
                }}
                aria-label="Send"
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
              </button>
            </div>
            <p className="mt-2.5 text-center text-[11px]" style={{ color: `${C.muted}AA` }}>
              {lang === 'fa'
                ? 'آریا می‌تواند با برنامه‌ریزی، ویزا، آداب محلی و راهنمایان کمک کند.'
                : lang === 'ar'
                ? 'يمكن لـ Aria المساعدة في المسارات والتأشيرات والعادات والمرشدين.'
                : 'Aria can help with itineraries, visas, customs, and local guides.'}
            </p>
          </div>
        </section>

        {/* ── Profile + Recommendations sidebar ───────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="flex flex-col w-full lg:w-[40%] lg:h-full"
          style={{ background: C.mist }}
        >
          {/* Profile panel */}
          <div className="px-6 pt-9 pb-6 sm:px-8 shrink-0">
            <SectionHeading
              eyebrow={lang === 'fa' ? 'حین گفتگو' : lang === 'ar' ? 'أثناء المحادثة' : 'As we talk'}
              title={lang === 'fa' ? 'پروفایل سفر شما' : lang === 'ar' ? 'ملفك السياحي' : 'Your Travel Profile'}
              trailing={
                <span className="text-[11px] font-medium" style={{ color: C.muted }}>
                  {Object.values(profile).filter((v) => typeof v === 'string' && v).length}/4
                </span>
              }
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProfileChip icon={Building2} label={lang === 'fa' ? 'هدف سفر' : lang === 'ar' ? 'هدف الرحلة' : 'Travel Goal'}   value={profile.goal}     filled={!!profile.goal}     accent={C.turq} />
              <ProfileChip icon={Clock}     label={lang === 'fa' ? 'مدت سفر'  : lang === 'ar' ? 'المدة'          : 'Duration'}     value={profile.duration} filled={!!profile.duration} accent={C.teal} />
              <ProfileChip icon={Users}     label={lang === 'fa' ? 'نوع گروه' : lang === 'ar' ? 'نوع المجموعة'  : 'Group Type'}   value={profile.group}    filled={!!profile.group}    accent={C.muted} />
              <ProfileChip icon={Wallet}    label={lang === 'fa' ? 'بودجه'    : lang === 'ar' ? 'الميزانية'     : 'Budget Level'} value={profile.budget}   filled={!!profile.budget}   accent={C.turq} />
            </div>
            {profile.vibes.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {profile.vibes.map((v) => (
                  <span
                    key={v.label}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-medium"
                    style={{ background: C.white, border: `1px solid ${C.muted}25`, color: C.teal }}
                  >
                    <v.icon className="h-3 w-3" style={{ color: C.turq }} />
                    {v.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            className="mx-6 h-px shrink-0 sm:mx-8"
            style={{ background: `linear-gradient(90deg, transparent, ${C.muted}40, transparent)` }}
          />

          {/* Recommendations */}
          <AnimatePresence>
            {hasRecommendations && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 min-h-0 overflow-y-auto px-6 py-6 sm:px-8"
              >
                <SectionHeading
                  eyebrow="Curated by Aria"
                  title={lang === 'fa' ? 'پیشنهادات برای شما' : lang === 'ar' ? 'موصى به لك' : 'Recommended for You'}
                />
                {sidebarTours.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {sidebarTours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
                  </div>
                )}
                {sidebarGuides.length > 0 && (
                  <div className="mt-7">
                    <SectionHeading
                      eyebrow={lang === 'fa' ? 'راهنمایان محلی' : lang === 'ar' ? 'مرشدون محليون' : 'Local hosts'}
                      title={lang === 'fa' ? 'راهنمایانی که منتظر دیدارتان هستند' : lang === 'ar' ? 'مرشدون يودّون مقابلتك' : "Guides who'd love to meet you"}
                    />
                    <div className="mt-4 flex flex-col gap-2.5">
                      {sidebarGuides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
                    </div>
                  </div>
                )}
                <Link
                  to="/tours"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[13.5px] font-semibold transition-all hover:opacity-90"
                  style={{ background: C.teal, color: C.white, boxShadow: `0 8px 22px ${C.teal}30` }}
                >
                  <Compass className="h-4 w-4" />
                  {lang === 'fa' ? 'ساخت برنامه سفر اختصاصی' : lang === 'ar' ? 'إنشاء خط سير مخصص' : 'Build a custom itinerary'}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      </div>

      {/* Trip Builder Modal */}
      <TripBuilder
        isOpen={showTripBuilder}
        onClose={() => setShowTripBuilder(false)}
        lang={lang}
        dir={dir}
      />
    </div>
  );
}

// ── TourCard ──────────────────────────────────────────────────────────────────
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

// ── GuideCard ─────────────────────────────────────────────────────────────────
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
      <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
