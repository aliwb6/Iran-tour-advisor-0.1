// @ts-nocheck
import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, MapPin, Clock, Users, Wallet,
  Globe2, ChevronDown, Building2, Mountain, UtensilsCrossed,
  Leaf, Compass, Loader2, ArrowLeft, ArrowRight, DollarSign,
  Trash2, Plus, MessageSquare, Menu, X,
} from 'lucide-react';
import { sendChatMessage } from '../services/api.js';
import { toast } from 'sonner';
import { avatarFor } from '@/lib/avatar';
import TripBuilder from '@/components/ai/TripBuilder';
import { useChatHistory } from '@/hooks/useChatHistory';
import { ChatMessage } from '@/components/chat/ChatMessage';

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

// ── Available AI models ────────────────────────────────────────────────────────
const AVAILABLE_MODELS = [
  { id: 'openrouter/auto',                        name: 'Auto (Best Available)', icon: '⚡', free: false },
  { id: 'openai/gpt-4-turbo',                     name: 'GPT-4 Turbo',          icon: '✨', free: false },
  { id: 'openai/gpt-3.5-turbo',                   name: 'GPT-3.5 Turbo',        icon: '⚡', free: false },
  { id: 'meta-llama/llama-3.1-8b-instruct:free',  name: 'Llama 3.1 8B',         icon: '🦙', free: true  },
  { id: 'mistralai/mistral-7b-instruct:free',      name: 'Mistral 7B',           icon: '✨', free: true  },
];

const FREE_FALLBACK_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';
const MODEL_STORAGE_KEY = 'iran_tour_ai_selected_model';

function ModelBadge({ free }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
      style={
        free
          ? { background: '#dcfce7', color: '#15803d' }
          : { background: '#fef9c3', color: '#a16207' }
      }
    >
      {free ? 'FREE' : 'PRO'}
    </span>
  );
}

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
        <span>{current.icon}</span>
        <span>{current.name}</span>
        <ModelBadge free={current.free} />
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
            className="absolute right-0 mt-2 min-w-[220px] overflow-hidden rounded-2xl py-1 z-[9999]"
            style={{ background: C.white, border: `1px solid ${C.muted}25`, boxShadow: `0 12px 40px ${C.teal}15` }}
          >
            {AVAILABLE_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); }}
                className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                style={{ color: C.teal }}
              >
                <span className="flex items-center gap-2">
                  <span>{m.icon}</span>
                  <span>{m.name}</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <ModelBadge free={m.free} />
                  {m.id === model && <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.turq }} />}
                </span>
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

// MessageBubble is now the ChatMessage component from src/components/chat/ChatMessage.jsx.
// Card rendering for assistant messages is handled inline in the message list below.

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

// ── Conversation history sidebar ──────────────────────────────────────────────
function ConversationSidebar({ conversations, activeId, onNew, onSwitch, onDelete, lang, dir, open, onClose, isLoadingConvs, isLoggedIn }) {
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const locale = lang === 'fa' ? 'fa-IR' : lang === 'ar' ? 'ar-SA' : 'en-US';
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
      if (diffDays < 7) return date.toLocaleDateString(locale, { weekday: 'short' });
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const slideHidden = dir === 'rtl' ? 'translate-x-full' : '-translate-x-full';
  const fixedSide = dir === 'rtl' ? 'right-0' : 'left-0';

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={[
          'flex flex-col w-64 shrink-0 z-50',
          'fixed inset-y-0 lg:static lg:inset-auto',
          fixedSide,
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : `${slideHidden} lg:translate-x-0`,
        ].join(' ')}
        style={{
          background: C.mist,
          borderInlineEnd: `1px solid ${C.muted}20`,
          height: '100%',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${C.muted}15` }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.muted }}>
            {lang === 'fa' ? 'گفتگوها' : lang === 'ar' ? 'المحادثات' : 'Conversations'}
          </span>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10"
            style={{ color: C.muted }}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat button */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${C.turq}, ${C.turqDeep})`,
              color: C.white,
              boxShadow: `0 4px 14px ${C.turq}35`,
            }}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>{lang === 'fa' ? 'گفتگوی جدید' : lang === 'ar' ? 'محادثة جديدة' : 'New Chat'}</span>
          </button>
        </div>

        {/* Guest notice */}
        {!isLoggedIn && (
          <div
            className="mx-3 mb-2 px-3 py-2.5 rounded-xl text-[11px] leading-snug"
            style={{ background: `${C.turq}12`, color: C.turq, border: `1px solid ${C.turq}25` }}
          >
            {lang === 'fa'
              ? 'برای ذخیره گفتگوها وارد شوید'
              : lang === 'ar'
              ? 'سجّل دخولك لحفظ محادثاتك'
              : 'Login to save your conversations'}
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {isLoadingConvs ? (
            <div className="space-y-1.5 px-1 pt-1">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl" style={{ background: `${C.muted}08` }}>
                  <div className="h-3 rounded-full animate-pulse" style={{ background: `${C.muted}25`, width: `${60 + n * 10}%` }} />
                  <div className="h-2 rounded-full animate-pulse" style={{ background: `${C.muted}15`, width: '40%' }} />
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="h-8 w-8 mb-3" style={{ color: `${C.muted}60` }} />
              <p className="text-xs" style={{ color: C.muted }}>
                {lang === 'fa' ? 'هنوز گفتگویی ندارید' : lang === 'ar' ? 'لا توجد محادثات بعد' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  className="group flex items-start gap-2 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: isActive ? C.white : 'transparent',
                    boxShadow: isActive ? `0 2px 8px ${C.teal}10` : 'none',
                  }}
                  onClick={() => { onSwitch(conv.id); onClose(); }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = `${C.white}80`; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className="text-[12.5px] font-medium leading-snug line-clamp-2"
                      style={{ color: isActive ? C.turq : C.teal }}
                    >
                      {conv.title || (lang === 'fa' ? 'گفتگوی جدید' : lang === 'ar' ? 'محادثة جديدة' : 'New conversation')}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: C.muted }}>
                      {formatTime(conv.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-red-50"
                    style={{ color: '#ef4444' }}
                    title={lang === 'fa' ? 'حذف' : lang === 'ar' ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}

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
- Keep replies tight (2–4 sentences). Warm, culturally sensitive. Sprinkle Persian words naturally when it fits ("kheili khob", "ajab", "mashallah", "befarmaid"). No emoji spam.
- Always reply in the same language the traveller writes in (English / Persian / Arabic).
- IMPORTANT: After your very first greeting message in the conversation, do NOT repeat "salaam", "khosh amadid", or any welcome phrase in subsequent messages. Dive straight into the topic without re-greeting.

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

// ── Build greeting for a new conversation ─────────────────────────────────────
function buildGreeting(cityHint, lang) {
  if (cityHint) {
    if (lang === 'fa') return `سلام! دیدم به ${cityHint} علاقه داری — عالیه! چه چیزی تو را به این شهر می‌کشاند؟`;
    if (lang === 'ar') return `مرحباً! أرى أنك مهتم بـ ${cityHint} — اختيار رائع! ما الذي يجذبك إلى هذه المدينة؟`;
    return `Salaam! I see you're curious about ${cityHint} — great choice. What's drawing you there?`;
  }
  if (lang === 'fa') return 'سلام! من راهنمای سفر هوشمند ایران تور ادوایزر هستم. بگو ببینم، چه چیزی تو را به ایران می‌کشاند؟';
  if (lang === 'ar') return 'مرحباً! أنا مستشار سفرك إلى إيران من Iran Tour Advisor. أخبرني، ما الذي يجذبك إلى إيران؟';
  return "Salaam! I'm your Iran travel advisor at Iran Tour Advisor. Tell me — what's drawing you to Iran?";
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const { t, dir, lang, switchLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const initDone = useRef(false);
  const [searchParams] = useSearchParams();
  const cityHint = searchParams.get('city') || '';
  const initialMessage = location.state?.initialMessage || '';

  const {
    conversations,
    activeId,
    messages,
    isLoggedIn,
    isLoadingConvs,
    isLoadingMsgs,
    createConversation,
    persistConversation,
    appendMessage,
    editMessage,
    deleteConversation,
    switchConversation,
  } = useChatHistory();

  const [selectedModel, setSelectedModel] = useState(() => {
    try { return localStorage.getItem(MODEL_STORAGE_KEY) || FREE_FALLBACK_MODEL; }
    catch { return FREE_FALLBACK_MODEL; }
  });

  // Calls the API with automatic fallback to the free model on 404 / 402
  const callWithFallback = async (msgs, sysprompt, model) => {
    try {
      return await sendChatMessage(msgs, sysprompt, lang, model);
    } catch (err) {
      if (err.status === 401) {
        toast.error(
          lang === 'fa' ? 'کلید API نامعتبر یا منقضی است'
          : lang === 'ar' ? 'مفتاح API غير صالح أو منتهي الصلاحية'
          : 'API key invalid or expired'
        );
        throw err;
      }
      if ((err.status === 404 || err.status === 402) && model !== FREE_FALLBACK_MODEL) {
        const reason = err.status === 404 ? 'Model not available' : 'No credits';
        toast.warning(
          lang === 'fa' ? `${reason} — درحال تغییر به مدل رایگان`
          : lang === 'ar' ? `${reason} — يتم التبديل إلى النموذج المجاني`
          : `${reason} — switching to free model`
        );
        setSelectedModel(FREE_FALLBACK_MODEL);
        try { localStorage.setItem(MODEL_STORAGE_KEY, FREE_FALLBACK_MODEL); } catch {}
        return await sendChatMessage(msgs, sysprompt, lang, FREE_FALLBACK_MODEL);
      }
      throw err;
    }
  };

  const [input, setInput] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [catalogue, setCatalogue] = useState({ tours: [], guides: [], ready: false });
  const [profile] = useState({ goal: '', duration: '', group: '', budget: '', vibes: [] });
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showTripBuilder, setShowTripBuilder] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Create a new conversation on every page visit (mount)
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const greeting = buildGreeting(cityHint, lang);
    createConversation(greeting, lang);
    if (cityHint && !initialMessage) {
      setInput(
        lang === 'fa'
          ? `می‌خواهم سفری به ${cityHint} برنامه‌ریزی کنم.`
          : lang === 'ar'
          ? `أرغب في التخطيط لرحلة إلى ${cityHint}.`
          : `I'd like to plan a trip to ${cityHint}.`
      );
    }
  }, []); // intentionally empty — runs once on mount

  // Save selected model to localStorage
  useEffect(() => {
    try { localStorage.setItem(MODEL_STORAGE_KEY, selectedModel); }
    catch {}
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
      setCatalogue({ tours: toursRes.data || [], guides: guidesRes.data || [], ready: true });
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleNewChat = () => {
    const greeting = buildGreeting(cityHint, lang);
    createConversation(greeting, lang);
    setInput('');
    setSidebarOpen(false);
  };

  // Called by ChatMessage when user saves an edit.
  // Truncates the conversation at that message, then re-sends to the API.
  const handleEditAndResend = async (convId, msgId, newText) => {
    if (loading) return;

    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx === -1) return;

    const messagesForApi = [
      ...messages.slice(0, idx).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: newText },
    ];

    // Truncate state + mark as edited
    editMessage(convId, msgId, newText);
    setLoading(true);

    try {
      const systemPromptText = buildSystemPrompt(catalogue.tours, catalogue.guides);
      const responseText = await callWithFallback(messagesForApi, systemPromptText, selectedModel);
      const { content, tours, guides } = extractRecommendation(responseText, catalogue.tours, catalogue.guides);
      const assistantMsg = { role: 'assistant', content };
      if (tours.length > 0 || guides.length > 0) assistantMsg.cards = { tours, guides };
      appendMessage(convId, assistantMsg);
    } catch (err) {
      const friendly = lang === 'fa'
        ? `متأسفم، مشکلی پیش آمد. (${err.message})`
        : lang === 'ar'
        ? `عذراً، حدث خطأ. (${err.message})`
        : `Sorry — couldn't reach the assistant. (${err.message})`;
      appendMessage(convId, { role: 'assistant', content: friendly });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Trip builder shortcut
    const tripKeywords = ['custom trip', 'create trip', 'plan trip', 'custom itinerary', 'build trip'];
    const farsiKeywords = ['سفر سفارشی', 'سفر شخصی', 'برنامه‌ریزی سفر', 'ایجاد برنامه'];
    const arabicKeywords = ['رحلة مخصصة', 'خطة رحلة', 'خطة سفر'];
    const lc = text.toLowerCase();
    if (tripKeywords.some((kw) => lc.includes(kw)) ||
        (lang === 'fa' && farsiKeywords.some((kw) => text.includes(kw))) ||
        (lang === 'ar' && arabicKeywords.some((kw) => text.includes(kw)))) {
      setShowTripBuilder(true);
      return;
    }

    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      const missing = lang === 'fa'
        ? 'کلید API موجود نیست. لطفاً فایل .env را بررسی کنید.'
        : lang === 'ar'
        ? 'مفتاح API مفقود. يرجى التحقق من ملف .env.'
        : 'API key is missing. Please check your .env file.';
      const errId = activeId || createConversation(null, lang);
      appendMessage(errId, { role: 'assistant', content: missing });
      return;
    }

    // Ensure there is an active conversation
    let convId = activeId;
    if (!convId) {
      if (!isLoggedIn) convId = createConversation(null, lang);
    }

    // For logged-in users: persist the conversation to Supabase on the first message
    if (isLoggedIn && (!convId || !conversations.some((c) => c.id === convId))) {
      convId = await persistConversation(text.slice(0, 40));
      if (!convId) { setLoading(false); return; }
    }

    const userMsg = { role: 'user', content: text };
    // Capture messages for the API call BEFORE state update
    const messagesForApi = [...messages, userMsg];

    appendMessage(convId, userMsg);
    setInput('');
    setLoading(true);

    try {
      const systemPromptText = buildSystemPrompt(catalogue.tours, catalogue.guides);
      const responseText = await callWithFallback(messagesForApi, systemPromptText, selectedModel);
      const { content, tours, guides } = extractRecommendation(responseText, catalogue.tours, catalogue.guides);
      const assistantMsg = { role: 'assistant', content };
      if (tours.length > 0 || guides.length > 0) assistantMsg.cards = { tours, guides };
      appendMessage(convId, assistantMsg);
    } catch (err) {
      const friendly = lang === 'fa'
        ? `متأسفم، در ارتباط با دستیار مشکلی پیش آمد. (${err.message})`
        : lang === 'ar'
        ? `عذراً، تعذر الاتصال بالمساعد. (${err.message})`
        : `Sorry — I couldn't reach the assistant. (${err.message})`;
      appendMessage(convId, { role: 'assistant', content: friendly });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Sidebar recommendation data
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
      className="flex min-h-screen lg:h-screen w-full lg:overflow-hidden"
      style={{ background: C.white, color: C.ink }}
    >
      {/* ── Conversation History Sidebar ────────────────────────────────── */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onNew={handleNewChat}
        onSwitch={switchConversation}
        onDelete={deleteConversation}
        lang={lang}
        dir={dir}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isLoadingConvs={isLoadingConvs}
        isLoggedIn={isLoggedIn}
      />

      {/* ── Main area (Chat + Recommendations) ────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col lg:flex-row lg:h-full">

        {/* ── Chat column ──────────────────────────────────────────────── */}
        <section
          className="relative flex flex-col flex-1 min-w-0 lg:border-r lg:h-full"
          style={{ borderColor: `${C.muted}20` }}
        >
          {/* Header */}
          <header className="relative overflow-visible px-4 pt-6 pb-5 sm:px-8 sm:pt-9 sm:pb-7 shrink-0 z-50">
            <PersianPattern opacity={0.055} color={C.turq} size={64} />
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${C.turq}55, transparent)` }}
            />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Sidebar toggle — all screen sizes */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors shrink-0"
                  style={{ background: `${C.muted}10`, color: C.teal }}
                  aria-label="Open conversation history"
                >
                  <Menu className="h-4 w-4" />
                </button>

                {/* Back button — desktop only */}
                <button
                  onClick={() => navigate(-1)}
                  className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl transition-colors shrink-0"
                  style={{ background: `${C.muted}10`, color: C.teal }}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <AriaMark size={40} pulse />
                <div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: C.turq }}
                  >
                    Iran Tour Advisor
                  </div>
                  <h1
                    className="text-[18px] font-bold leading-tight sm:text-[22px]"
                    style={{ color: C.teal, letterSpacing: '-0.01em' }}
                  >
                    {t('ai_title')}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ModelSelector
                  model={selectedModel}
                  onChange={setSelectedModel}
                  open={showModelPicker}
                  setOpen={setShowModelPicker}
                />
                <LanguageSwitcher lang={lang} onChange={switchLang} />
              </div>
            </div>

            {/* Carpet hairline */}
            <div
              className="mt-5 h-[2px] w-full"
              style={{
                background: `repeating-linear-gradient(90deg, ${C.turq} 0 6px, transparent 6px 12px, ${C.muted} 12px 14px, transparent 14px 20px)`,
                opacity: 0.45,
              }}
            />
          </header>

          {/* Messages */}
          <div
            ref={scrollerRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-8"
          >
            {isLoadingMsgs ? (
              <div className="flex items-center justify-center h-40 gap-3" style={{ color: C.muted }}>
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.turq }} />
                <span className="text-sm">
                  {lang === 'fa' ? 'در حال بارگذاری…' : lang === 'ar' ? 'جارٍ التحميل…' : 'Loading…'}
                </span>
              </div>
            ) : null}
            <div className="mx-auto flex max-w-[680px] flex-col gap-5">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  const key = msg.id || i;
                  const cards = msg.role === 'assistant' && msg.cards
                    ? (
                      <div className="space-y-3">
                        {msg.cards.tours?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.cards.tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
                          </div>
                        )}
                        {msg.cards.guides?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.cards.guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
                          </div>
                        )}
                      </div>
                    )
                    : null;
                  return (
                    <ChatMessage
                      key={key}
                      msg={msg}
                      convId={activeId}
                      onEdit={handleEditAndResend}
                      loading={loading}
                      lang={lang}
                      renderCards={cards}
                    />
                  );
                })}
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
          <div className="relative px-4 pb-6 pt-4 sm:px-8 shrink-0" style={{ background: C.white }}>
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
                  : <Send className="h-4 w-4" />}
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

        {/* ── Profile + Recommendations sidebar ──────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="hidden lg:flex flex-col shrink-0 lg:h-full overflow-y-auto"
          style={{ width: 360, background: C.mist }}
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
                className="flex-1 px-6 py-6 sm:px-8"
              >
                <SectionHeading
                  eyebrow="Curated by Aria"
                  title={lang === 'fa' ? 'پیشنهادات برای شما' : lang === 'ar' ? 'موصى به لك' : 'Recommended for You'}
                />
                {sidebarTours.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 gap-3">
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
