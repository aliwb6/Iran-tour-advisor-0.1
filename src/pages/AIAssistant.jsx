import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Send, Loader2, Landmark, Sun, UtensilsCrossed, BookOpen, Camera, Crown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const systemPrompt = `You are the AI travel concierge for Iran Tour Advisor, a premium travel brand specializing in authentic Iranian experiences. 
You help travelers discover the perfect journey through Iran. Be knowledgeable, warm, and sophisticated. 
Respond in ${lang === 'fa' ? 'Persian/Farsi' : lang === 'ar' ? 'Arabic' : 'English'}.
Suggest specific cities, experiences, and cultural highlights. Be concise but evocative.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nUser: ${text}`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const handleChip = (key) => {
    sendMessage(t(key));
  };

  return (
    <div dir={dir} className="pt-20 pb-0 h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-6 text-center border-b border-border/30">
        <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-body text-xs text-accent font-medium">AI-Powered</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-light text-foreground">{t('ai_title')}</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">{t('ai_subtitle')}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 max-w-3xl mx-auto w-full">
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
        <div className="max-w-3xl mx-auto flex items-center gap-3">
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