import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, Loader2, Landmark, Sun, UtensilsCrossed, BookOpen, Camera, Crown, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTours, useGuides } from '@/hooks/useSupabase';

const chips = [
  { key: 'ai_chip_architecture', icon: Landmark },
  { key: 'ai_chip_desert', icon: Sun },
  { key: 'ai_chip_food', icon: UtensilsCrossed },
  { key: 'ai_chip_history', icon: BookOpen },
  { key: 'ai_chip_photography', icon: Camera },
  { key: 'ai_chip_luxury', icon: Crown },
];

export default function AIAssistant() {
  const { t, dir, lang } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const { tours } = useTours({});
  const { guides } = useGuides();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const toursContext = tours.length > 0
      ? tours.map(t => `- "${t.title}" (${t.duration} days, $${t.price?.toLocaleString()}, ${t.location || t.cities || 'Iran'}): ${t.description?.substring(0, 150)}...`).join('\n')
      : 'No tour packages available yet.';

    const guidesContext = guides.length > 0
      ? guides.map(g => `- ${g.full_name || g.name} (${g.city}, ${g.specialty || 'Local Guide'})${g.bio ? ': ' + g.bio.substring(0, 100) : ''}`).join('\n')
      : 'No local guides approved yet.';

    const responseLang = lang === 'fa' ? 'Persian/Farsi' : lang === 'ar' ? 'Arabic' : 'English';

    const systemPrompt = `You are the AI travel concierge for Iran Tour Advisor, a premium AI-powered travel platform for authentic Iranian experiences.
Your role: Help travelers discover and build personalized journeys through Iran by drawing from real tour packages and approved local guides.
Respond in ${responseLang}.

AVAILABLE TOUR PACKAGES:
${toursContext}

APPROVED LOCAL GUIDES:
${guidesContext}

Guidelines:
- When users ask about personalized or custom trips, reference specific packages and suggest connecting with suitable guides
- Be knowledgeable, warm, and sophisticated in your responses
- Suggest specific cities, experiences, and cultural highlights
- If a guide matches the user's interests, recommend reaching out to them
- Be concise but evocative and storytelling-focused`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.status}`);
    }

    const data = await res.json();
    const response = data.choices[0].message.content;

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const handleChip = (key) => {
    sendMessage(t(key));
  };

  return (
    <div dir={dir} className="h-screen flex flex-col">
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 w-full mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {chips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.key}
                    onClick={() => handleChip(chip.key)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all font-body text-sm"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {t(chip.key)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-card border border-border/50'
              }`}>
                {msg.role === 'user' ? (
                  <p className="font-body text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <ReactMarkdown className="font-body text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-card border border-border/50 rounded-2xl px-5 py-3.5">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-4 sm:px-6 bg-background">
        <div className="w-full mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={t('ai_placeholder')}
            className="flex-1 bg-secondary rounded-xl px-4 py-3 font-body text-sm border border-border/50 focus:border-accent/50 outline-none transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}