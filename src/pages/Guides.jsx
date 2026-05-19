import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, Star, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuides } from '@/hooks/useSupabase';
import { avatarFor } from '@/lib/avatar';
import { useAuth } from '@/lib/AuthContext';

const cityColors = ['bg-accent/10 text-accent', 'bg-gold/20 text-gold', 'bg-primary/10 text-primary'];

export default function Guides() {
  const { t, dir, lang } = useI18n();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { guides, loading, error } = useGuides();
  const { isAuthenticated } = useAuth();

  const openChat = (guideId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/chat/${guideId}`);
  };

  const filtered = guides.filter((g) => {
    const name = (g.full_name || '').toLowerCase();
    const city = (g.city || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || city.includes(q);
  });

  const loadingText = lang === 'fa' ? 'در حال بارگذاری راهنماها...' : lang === 'ar' ? 'جار تحميل المرشدين...' : 'Loading guides...';
  const errorText = lang === 'fa' ? 'بارگذاری راهنماها با خطا مواجه شد' : lang === 'ar' ? 'فشل تحميل المرشدين' : 'Failed to load guides';
  const emptyText = lang === 'fa' ? 'راهنمایی یافت نشد' : lang === 'ar' ? 'لم يتم العثور على مرشدين' : 'No guides found';

  return (
    <div dir={dir} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
            {t('guides_title')}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg mb-8">
            {t('guides_subtitle')}
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('guides_search')}
              className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 bg-secondary rounded-xl font-body text-sm border border-border/50 focus:border-accent/50 outline-none transition-colors`}
            />
          </div>
        </motion.div>

        {/* States */}
        {loading ? (
          <p className="font-body text-muted-foreground text-center py-16">{loadingText}</p>
        ) : error ? (
          <div className="text-center py-16">
            <p className="font-body text-destructive mb-2">{errorText}</p>
            <p className="font-body text-xs text-muted-foreground">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-body text-muted-foreground text-center py-16">{emptyText}</p>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide, i) => {
              const specialties = Array.isArray(guide.specialties) ? guide.specialties : [];
              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/guides/${guide.id}`)}
                  className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-gold/30 transition-all duration-300 cursor-pointer"
                >
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={avatarFor(guide)}
                      alt={guide.full_name || ''}
                      className="w-14 h-14 rounded-full border-2 border-gold object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-lg font-semibold text-foreground">{guide.full_name}</h3>
                      {guide.city && (
                        <p className="font-body text-sm text-muted-foreground">{guide.city}</p>
                      )}
                      {guide.rating != null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                          <span className="font-body text-sm font-medium text-foreground">{guide.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {guide.bio && (
                    <p className="font-body text-sm text-foreground/70 leading-relaxed mb-4 line-clamp-3">
                      {guide.bio}
                    </p>
                  )}

                  {/* Specialties */}
                  {specialties.length > 0 && (
                    <div className="mb-5">
                      <span className="font-body text-xs text-muted-foreground font-medium mb-2 block">{t('guides_specialties')}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {specialties.map((s, j) => (
                          <span key={j} className={`px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${cityColors[j % cityColors.length]}`}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connect */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openChat(guide.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/10 text-accent font-body text-sm font-medium hover:bg-accent hover:text-white transition-all duration-300"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('guides_connect')}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
