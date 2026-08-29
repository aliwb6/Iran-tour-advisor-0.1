import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle,
  ArrowRight, ArrowLeft, Star, Lock, Instagram, Loader2, Send, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useTourBySlug, FALLBACK_IMAGE } from '@/hooks/useSupabase';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { lookupInclusionLabel, computeNotIncludedLabels } from '@/lib/tourInclusions';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TourDetailsSkeleton } from '@/components/ui/Skeletons';

const purposeBadgeConfig = {
  leisure: { en: 'Leisure', fa: 'تفریحی', ar: 'ترفيه', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  work: { en: 'Business', fa: 'کسب‌وکار', ar: 'أعمال', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  research: { en: 'Research', fa: 'تحقیقاتی', ar: 'بحثي', color: 'bg-violet-500/15 text-violet-700 dark:text-violet-400' },
  spiritual: { en: 'Spiritual', fa: 'معنوی', ar: 'روحاني', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
};

// How many gallery thumbnails to show in the compact sidebar before the
// "+N more" indicator. The rest are still reachable through the lightbox.
const GALLERY_PREVIEW_LIMIT = 6;

const pickLang = (val, lang) => {
  if (val == null) return '';
  if (typeof val === 'object' && !Array.isArray(val)) return val[lang] || val.en || '';
  return val;
};

const pickLangArray = (val, lang) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') {
    const arr = val[lang] || val.en;
    return Array.isArray(arr) ? arr : [];
  }
  return [];
};

const pickHeroImage = (tour) => {
  if (!tour) return FALLBACK_IMAGE;
  if (Array.isArray(tour?.gallery) && tour.gallery[0]) return tour.gallery[0];
  return tour?.cover_image || tour?.image_url || tour?.image || FALLBACK_IMAGE;
};

// The dashboard TourForm currently stores `itinerary` as a free-text string
// like "Day 1: Arrival…\nDay 2: …". Parse that into structured days so the
// detail page can render it the same way as the fixture data.
const parseItineraryString = (text) => {
  if (typeof text !== 'string' || !text.trim()) return [];
  const dayRe = /^\s*Day\s+(\d+)\s*[:\-–.]\s*(.*)$/i;
  const result = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(dayRe);
    if (m) {
      if (current) result.push(current);
      current = { day: Number(m[1]), title: m[2].trim(), description: '' };
    } else if (current) {
      current.description = current.description ? `${current.description} ${line}` : line;
    } else {
      current = { day: 1, title: line, description: '' };
    }
  }
  if (current) result.push(current);
  return result;
};

export default function TourDetails() {
  const { slug } = useParams();
  const { t, lang, dir } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const { tour, loading, error } = useTourBySlug(slug);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');

  const [requestOpen, setRequestOpen] = useState(false);
  const [reqUsername, setReqUsername] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [reqEndDate, setReqEndDate] = useState('');
  const [reqGroupSize, setReqGroupSize] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  // Lightbox state for the sidebar gallery thumbnails. `lightboxIndex` is the
  // index into `tour.gallery` of the currently-opened image; null means closed.
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const resetRequestForm = () => {
    setReqUsername('');
    setReqMessage('');
    setReqDate('');
    setReqEndDate('');
    setReqGroupSize('');
  };

  const closeLightbox = () => setLightboxIndex(null);
  const stepLightbox = (delta) => {
    setLightboxIndex((idx) => {
      if (idx == null) return idx;
      return (idx + delta + gallery.length) % gallery.length;
    });
  };

  // Keyboard navigation for the lightbox: arrows move between images, Escape closes.
  // Radix Dialog already handles Escape/click-outside, so we only need the arrows.
  useEffect(() => {
    if (lightboxIndex == null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        // In RTL we flip so the visual "next" is consistent with reading direction.
        stepLightbox(dir === 'rtl' ? -1 : 1);
      } else if (e.key === 'ArrowLeft') {
        stepLightbox(dir === 'rtl' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, dir]);

  // Guard: while data is still loading (or before a non-existent slug resolves
  // to a Supabase 400 and `tour` is still null), show the skeleton instead of
  // dereferencing `tour` below. This must stay above any `tour.…` access.
  if (loading) {
    return <TourDetailsSkeleton />;
  }

  if (error || !tour) {
    return (
      <div dir={dir} className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">
            {lang === 'fa' ? 'تور یافت نشد' : lang === 'ar' ? 'الرحلة غير موجودة' : 'Tour Not Found'}
          </h1>
          {error && <p className="font-body text-sm text-destructive mb-4">{error}</p>}
          <Link to="/tours" className="text-accent hover:underline">{t('view_all')} →</Link>
        </div>
      </div>
    );
  }

  const gallery = (Array.isArray(tour?.gallery) ? tour.gallery : []).filter(Boolean);

  const handleSubmitRequest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(t('request_login_required'));
      navigate('/login');
      return;
    }

    const trimmedUsername = reqUsername.trim();
    if (!trimmedUsername) {
      toast.error(t('request_not_found'));
      return;
    }

    setReqLoading(true);
    try {
      const { data: guide } = await supabase
        .from('profiles')
        .select('id, role, username')
        .eq('username', trimmedUsername)
        .in('role', ['guide', 'agency'])
        .maybeSingle();

      if (!guide) {
        toast.error(t('request_not_found'));
        return;
      }

      if (guide.id === user.id) {
        toast.error(t('request_self_error'));
        return;
      }

      const { error: insertErr } = await supabase.from('tour_requests').insert({
        tour_id: tour.id,
        tourist_id: user.id,
        guide_id: guide.id,
        message: reqMessage || null,
        preferred_date: reqDate || null,
        preferred_end_date: reqEndDate || null,
        group_size: reqGroupSize ? Number(reqGroupSize) : null,
        status: 'pending',
      });

      if (insertErr) {
        toast.error(t('request_generic_error'));
        return;
      }

      toast.success(t('request_success'));
      setRequestOpen(false);
      resetRequestForm();
    } catch {
      toast.error(t('request_generic_error'));
    } finally {
      setReqLoading(false);
    }
  };

  const title = pickLang(tour.title, lang);
  const desc = pickLang(tour.desc ?? tour.description, lang);

  // Location for the hero badge — prefer explicit `location`, else cities array, else single city.
  const citiesArr = Array.isArray(tour.cities)
    ? tour.cities
    : (typeof tour.cities === 'string' && tour.cities
        ? tour.cities.split(/[,·]/).map(s => s.trim()).filter(Boolean)
        : []);
  const location = pickLang(tour.location, lang)
    || (citiesArr.length ? citiesArr.join(' · ') : '')
    || tour.city
    || '';

  const highlights = pickLangArray(tour.highlights, lang);
  const included = pickLangArray(tour.included, lang);
  // "Not Included" is derived from the catalog minus the items the guide picked,
  // so it stays in sync with the Included list without separate storage.
  const notIncluded = computeNotIncludedLabels(included, lang);
  const itinerary = Array.isArray(tour.itinerary)
    ? tour.itinerary
    : (typeof tour.itinerary === 'string' ? parseItineraryString(tour.itinerary) : []);

  // City count — compute from the cities array when present, else fall back.
  const cityCount = citiesArr.length || tour.cityCount || tour.city_count || (tour.city ? 1 : 0);

  // Price — accept fixture `priceFrom`, normalised `price_from`, DB `price_usd` or `price`.
  const priceFrom = tour.priceFrom ?? tour.price_from ?? tour.price_usd ?? tour.price ?? null;

  // Cultural intensity comes from `cultural` (fixture) or `cultural_intensity` (DB).
  const cultural = tour.cultural || tour.cultural_intensity || null;

  // Tour themes — text[] in DB, shown as small tags.
  const themes = Array.isArray(tour.theme) ? tour.theme : (tour.theme ? [tour.theme] : []);

  const heroImage = pickHeroImage(tour);

  // "Book Now" routes the traveller into a chat with whichever person owns
  // the tour. For platform tours (owner_id null / is_platform_tour true) we
  // resolve a fallback admin so the traveller always lands on a real thread.
  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBookError('');

    if (tour.owner_id && !tour.is_platform_tour) {
      navigate(`/chat/${tour.owner_id}`);
      return;
    }

    setBookLoading(true);
    try {
      const { data: admin, error: adminErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .maybeSingle();
      if (adminErr) throw adminErr;
      if (!admin?.id) {
        throw new Error(
          lang === 'fa' ? 'در حال حاضر هیچ پشتیبانی در دسترس نیست. لطفاً بعداً تلاش کنید.'
          : lang === 'ar' ? 'لا يوجد دعم متاح حالياً. يرجى المحاولة لاحقاً.'
          : 'No support agent is available right now. Please try again later.'
        );
      }
      navigate(`/chat/${admin.id}`);
    } catch (err) {
      setBookError(err.message || 'Failed to open chat');
    } finally {
      setBookLoading(false);
    }
  };

  return (
    <div dir={dir} className="pt-0 pb-20 min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back button */}
        <Link
          to="/tours"
          className="absolute top-24 start-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <Arrow className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          {lang === 'fa' ? 'بازگشت' : lang === 'ar' ? 'رجوع' : 'Back'}
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badges */}
              {tour.purpose && purposeBadgeConfig[tour.purpose] && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-body font-medium ${purposeBadgeConfig[tour.purpose].color}`}>
                    {purposeBadgeConfig[tour.purpose][lang] || purposeBadgeConfig[tour.purpose].en}
                  </span>
                </div>
              )}

              <h1
                className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-4"
                style={{ WebkitTextStroke: '1px black' }}
              >
                {title}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl bg-card border border-border/50 mb-10"
        >
          <div className="flex flex-wrap gap-8">
            {tour.duration != null && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">{t('package_duration')}</p>
                <p className="font-heading text-lg font-semibold text-foreground">{tour.duration} {t('package_duration')}</p>
              </div>
            )}
            {cityCount > 0 && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">{t('package_cities')}</p>
                <p className="font-heading text-lg font-semibold text-foreground">{cityCount}</p>
              </div>
            )}
            {tour.difficulty && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">{t('package_difficulty')}</p>
                <p className="font-heading text-lg font-semibold text-foreground">{t(`difficulty_${tour.difficulty}`)}</p>
              </div>
            )}
            {cultural && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">{t('package_cultural')}</p>
                <p className="font-heading text-lg font-semibold text-foreground">{t(`cultural_${cultural}`)}</p>
              </div>
            )}
            {themes.length > 0 && (
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">
                  {lang === 'fa' ? 'موضوعات' : lang === 'ar' ? 'المواضيع' : 'Themes'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {themes.map((th, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-body font-medium"
                    >
                      {th}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {priceFrom != null && (
            <div className="text-start">
              <p className="font-body text-xs text-muted-foreground mb-1">
                {lang === 'fa' ? 'قیمت از' : lang === 'ar' ? 'السعر من' : 'from'}
              </p>
              <p className="font-heading text-3xl font-bold text-accent">
                ${Number(priceFrom).toLocaleString()}
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            {desc && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'مرور کلی' : lang === 'ar' ? 'نظرة عامة' : 'Overview'}
                </h2>
                <p className="font-body text-foreground/70 leading-relaxed">
                  {desc}
                </p>
              </section>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'نکات برجسته' : lang === 'ar' ? 'أبرز المعالم' : 'Highlights'}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50">
                      <Star className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span className="font-body text-sm text-foreground">{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  {lang === 'fa' ? 'برنامه سفر' : lang === 'ar' ? 'خط الرحلة' : 'Tour Plan'}
                </h2>
                <div className="space-y-4">
                  {itinerary.map((day, i) => {
                    const dayTitle = pickLang(day.title, lang);
                    const dayDesc = pickLang(day.desc ?? day.description, lang);
                    return (
                      <div key={i} className="border border-border/50 rounded-2xl overflow-hidden">
                        <div className="flex items-stretch">
                          <div className="w-16 sm:w-20 bg-accent/10 flex flex-col items-center justify-center p-4">
                            <span className="font-heading text-xl font-bold text-accent">{day.day ?? i + 1}</span>
                            <span className="font-body text-xs text-muted-foreground">
                              {lang === 'fa' ? 'روز' : lang === 'ar' ? 'يوم' : 'Day'}
                            </span>
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{dayTitle}</h3>
                            <p className="font-body text-sm text-foreground/70">{dayDesc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Included / Not Included */}
            {(included.length > 0 || notIncluded.length > 0) && (
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {included.length > 0 && (
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      {lang === 'fa' ? 'شامل' : lang === 'ar' ? 'مشمول' : 'Included'}
                    </h3>
                    <ul className="space-y-2">
                      {included.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground/70">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          {lookupInclusionLabel(item, lang)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {notIncluded.length > 0 && (
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      {lang === 'fa' ? 'شامل نیست' : lang === 'ar' ? 'غير مشمول' : 'Not Included'}
                    </h3>
                    <ul className="space-y-2">
                      {notIncluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground/70">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'رزرو کنید' : lang === 'ar' ? 'احجز الآن' : 'Book This Tour'}
                </h3>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={handleBookNow}
                    disabled={bookLoading}
                    className="w-full py-3 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {lang === 'fa' ? 'رزرو / تماس با راهنما'
                      : lang === 'ar' ? 'احجز / تواصل مع المرشد'
                      : 'Book / Contact Guide'}
                  </button>
                  {bookError && (
                    <p className="font-body text-xs text-red-500">{bookError}</p>
                  )}
                  <button
                    onClick={() => setRequestOpen(true)}
                    className="w-full py-3 rounded-xl border border-accent text-accent font-body font-semibold hover:bg-accent/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {t('request_cta')}
                  </button>
                </div>

                {/* Contact details are intentionally hidden until booking confirmation. */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                    <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="font-body text-xs text-foreground/65 leading-relaxed">
                      {lang === 'fa'
                        ? 'اطلاعات تماس پس از تأیید رزرو در اختیار شما قرار می‌گیرد.'
                        : lang === 'ar'
                        ? 'سيتم مشاركة تفاصيل الاتصال بعد تأكيد الحجز.'
                        : 'Contact details will be shared after booking confirmation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                  {lang === 'fa' ? 'به اشتراک بگذارید' : lang === 'ar' ? 'مشاركة' : 'Share'}
                </h3>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <Instagram className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Gallery (compact thumbnails in the sidebar) */}
              {gallery.length > 0 && (
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                    {lang === 'fa' ? 'گالری' : lang === 'ar' ? 'معرض الصور' : 'Gallery'}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {gallery.slice(0, GALLERY_PREVIEW_LIMIT).map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        className="aspect-square rounded-lg overflow-hidden bg-secondary/40 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent"
                        aria-label={`${lang === 'fa' ? 'مشاهده تصویر' : lang === 'ar' ? 'عرض الصورة' : 'View image'} ${i + 1}`}
                      >
                        <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {gallery.length > GALLERY_PREVIEW_LIMIT && (
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(GALLERY_PREVIEW_LIMIT)}
                        className="aspect-square rounded-lg overflow-hidden bg-secondary/40 hover:bg-secondary/70 transition-colors flex items-center justify-center text-muted-foreground font-body text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        +{gallery.length - GALLERY_PREVIEW_LIMIT}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tour Request Dialog */}
      <Dialog open={requestOpen} onOpenChange={(open) => { setRequestOpen(open); if (!open) resetRequestForm(); }}>
        <DialogContent dir={dir} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('request_dialog_title')}</DialogTitle>
            <DialogDescription>{t('request_dialog_desc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Username */}
            <div className="space-y-1.5">
              <Label>{t('request_username_label')}</Label>
              <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
                <span className="px-3 text-muted-foreground text-sm select-none">@</span>
                <input
                  value={reqUsername}
                  onChange={(e) => setReqUsername(e.target.value)}
                  placeholder={t('request_username_ph')}
                  dir="ltr"
                  className="flex-1 py-2 pe-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label>{t('request_message_label')}</Label>
              <Textarea
                value={reqMessage}
                onChange={(e) => setReqMessage(e.target.value)}
                placeholder={t('request_message_ph')}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Preferred dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('request_date_label')}</Label>
                <Input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  {lang === 'fa' ? 'تاریخ پایان (اختیاری)' : lang === 'ar' ? 'تاريخ الانتهاء (اختياري)' : 'End date (optional)'}
                </Label>
                <Input
                  type="date"
                  value={reqEndDate}
                  onChange={(e) => setReqEndDate(e.target.value)}
                  min={reqDate || new Date().toISOString().split('T')[0]}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Group size */}
            <div className="space-y-1.5">
              <Label>{t('request_group_label')}</Label>
              <Input
                type="number"
                min={1}
                value={reqGroupSize}
                onChange={(e) => setReqGroupSize(e.target.value)}
                placeholder="1"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setRequestOpen(false); resetRequestForm(); }}
              disabled={reqLoading}
            >
              {t('request_cancel')}
            </Button>
            <Button onClick={handleSubmitRequest} disabled={reqLoading}>
              {reqLoading && <Loader2 className="w-4 h-4 animate-spin me-2" />}
              {t('request_submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery Lightbox */}
      <Dialog open={lightboxIndex != null} onOpenChange={(open) => { if (!open) closeLightbox(); }}>
        <DialogContent
          dir={dir}
          className="max-w-3xl w-[92vw] bg-transparent border-0 p-0 shadow-none sm:rounded-none"
        >
          {lightboxIndex != null && gallery[lightboxIndex] && (
            <div className="relative flex items-center justify-center">
              {/* Prev */}
              <button
                type="button"
                onClick={() => stepLightbox(-1)}
                aria-label={lang === 'fa' ? 'تصویر قبلی' : lang === 'ar' ? 'الصورة السابقة' : 'Previous image'}
                className={`absolute ${dir === 'rtl' ? 'end-0' : 'start-0'} top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={gallery[lightboxIndex]}
                alt={`${title} ${lightboxIndex + 1}`}
                className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
              />

              {/* Next */}
              <button
                type="button"
                onClick={() => stepLightbox(1)}
                aria-label={lang === 'fa' ? 'تصویر بعدی' : lang === 'ar' ? 'الصورة التالية' : 'Next image'}
                className={`absolute ${dir === 'rtl' ? 'start-0' : 'end-0'} top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <span className="absolute bottom-3 start-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/60 text-white font-body text-xs">
                {lightboxIndex + 1} / {gallery.length}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}