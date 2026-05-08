import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, Star, MessageCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuides, FALLBACK_IMAGE } from '@/hooks/useSupabase';

const cityColors = ['bg-accent/10 text-accent', 'bg-gold/20 text-gold', 'bg-primary/10 text-primary'];

export default function Guides() {
  const { t, dir, lang } = useI18n();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { guides, loading, error } = useGuides();

  const filtered = guides.filter(g => {
    const name = g.full_name || g.name || '';
    const city = g.city || '';
    return name.toLowerCase().includes(search.toLowerCase()) || city.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div dir={dir} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="font-heading text-2xl text-muted-foreground font-light">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-heading text-2xl text-muted-foreground font-light">
              {lang === 'fa' ? 'راهنمایی یافت نشد' : lang === 'ar' ? 'لم يتم العثور على مرشدين' : 'No guides found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide, i) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/guides/${guide.id}`)}
                className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:border-gold/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={guide.avatar_url || guide.photo || FALLBACK_IMAGE}
                    alt={guide.full_name || guide.name || 'Guide'}
                    className="w-14 h-14 rounded-full border-2 border-gold object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg font-semibold text-foreground">{guide.full_name || guide.name}</h3>
                    <p className="font-body text-sm text-muted-foreground">{guide.city}</p>
                    {guide.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                        <span className="font-body text-sm font-medium text-foreground">{guide.rating}</span>
                        <span className="font-body text-xs text-muted-foreground">({guide.reviews || 0} {t('guides_reviews')})</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="font-body text-sm text-foreground/70 leading-relaxed mb-4 line-clamp-3">
                  {guide.bio}
                </p>

                {guide.specialties && guide.specialties.length > 0 && (
                  <div className="mb-5">
                    <span className="font-body text-xs text-muted-foreground font-medium mb-2 block">{t('guides_specialties')}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(guide.specialties) ? guide.specialties : []).slice(0, 4).map((s, j) => (
                        <span key={j} className={`px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${cityColors[j % cityColors.length]}`}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/10 text-accent font-body text-sm font-medium hover:bg-accent hover:text-white transition-all duration-300">
                  <MessageCircle className="w-4 h-4" />
                  {t('guides_connect')}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}