import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import {
  Star, Mail, Phone, Instagram, MapPin, Calendar,
  ArrowRight, ArrowLeft, MessageCircle,
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { avatarFor } from '@/lib/avatar';
import { useAuth } from '@/lib/AuthContext';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1564960723835-2898c9df9297?w=1600&h=900&fit=crop';

export default function GuideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, dir } = useI18n();
  const { isAuthenticated } = useAuth();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const openChat = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/chat/${id}`);
  };

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchGuide = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) throw supabaseError;
        if (isMounted) {
          setGuide(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setGuide(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) fetchGuide();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div dir={dir} className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <p className="font-body text-muted-foreground">
          {lang === 'fa' ? 'در حال بارگذاری راهنما...' : lang === 'ar' ? 'جار تحميل المرشد...' : 'Loading guide...'}
        </p>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div dir={dir} className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">
            {lang === 'fa' ? 'راهنما یافت نشد' : lang === 'ar' ? 'المرشد غير موجود' : 'Guide Not Found'}
          </h1>
          {error && (
            <p className="font-body text-sm text-destructive mb-4">{error}</p>
          )}
          <Link to="/guides" className="text-accent hover:underline">{t('view_all')} →</Link>
        </div>
      </div>
    );
  }

  const name = guide.full_name || '';
  const city = guide.city || '';
  const bio = guide.bio || '';
  const specialties = Array.isArray(guide.specialties) ? guide.specialties : [];
  const languages = Array.isArray(guide.languages) ? guide.languages : [];
  const experience = guide.experience || '';
  const avatar = avatarFor(guide);
  const coverImage = guide.cover_image || guide.coverImage || guide.avatar_url || FALLBACK_COVER;

  const cityColors = ['bg-accent/10 text-accent', 'bg-gold/20 text-gold', 'bg-primary/10 text-primary', 'bg-emerald-10 text-emerald-600 dark:text-emerald-400'];

  return (
    <div dir={dir} className="pt-0 pb-20 min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back button */}
        <Link
          to="/guides"
          className="absolute top-24 start-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <Arrow className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          {t('back_to_home')}
        </Link>

        {/* Profile overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-end gap-6"
            >
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden shrink-0">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h1 className="font-heading text-4xl sm:text-5xl text-white mb-2">
                    {name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {city && (
                      <span className="flex items-center gap-1.5 text-white/80 font-body">
                        <MapPin className="w-4 h-4" />
                        {city}
                      </span>
                    )}
                    {experience && (
                      <span className="flex items-center gap-1.5 text-white/80 font-body">
                        <Calendar className="w-4 h-4" />
                        {experience}
                      </span>
                    )}
                  </div>
                  {guide.rating != null && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent">
                        <Star className="w-4 h-4 text-white fill-white" />
                        <span className="font-body font-semibold text-white">{guide.rating}</span>
                      </div>
                      {guide.reviews != null && (
                        <span className="font-body text-white/70 text-sm">
                          {guide.reviews} {t('guides_reviews')}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Bio */}
            {bio && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'معرفی' : lang === 'ar' ? 'Biography' : 'About'}
                </h2>
                <p className="font-body text-foreground/70 leading-relaxed text-lg">
                  {bio}
                </p>
              </section>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {t('guides_specialties')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((s, i) => (
                    <span
                      key={i}
                      className={`px-4 py-2 rounded-full text-sm font-body font-medium ${cityColors[i % cityColors.length]}`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {t('guides_languages')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {languages.map((langItem, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-full text-sm font-body bg-secondary text-foreground"
                    >
                      {langItem}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'ارتباط' : lang === 'ar' ? 'الاتصال' : 'Contact'}
                </h3>

                <div className="space-y-4 mb-6">
                  <button
                    type="button"
                    onClick={openChat}
                    className="w-full py-3 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('guides_connect')}
                  </button>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  {guide.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-body text-sm text-foreground/70">{guide.phone}</span>
                    </div>
                  )}
                  {guide.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-body text-sm text-foreground/70">{guide.email}</span>
                    </div>
                  )}
                  {guide.instagram && (
                    <div className="flex items-center gap-3">
                      <Instagram className="w-4 h-4 text-muted-foreground" />
                      <span className="font-body text-sm text-foreground/70">@{guide.instagram}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                  {lang === 'fa' ? 'شبکه‌های اجتماعی' : lang === 'ar' ? 'وسائل التواصل' : 'Social'}
                </h3>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <Instagram className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
