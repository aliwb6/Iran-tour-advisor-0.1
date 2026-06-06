import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import {
  Star, MapPin, Globe, Calendar, BadgeCheck, ChevronLeft, ChevronRight,
  ArrowRight, Map, PenLine, Plus, Minus, ChevronDown, Building2,
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { avatarFor } from '@/lib/avatar';

const CITIES_LIST = ['Tehran', 'Isfahan', 'Shiraz', 'Yazd', 'Mashhad', 'Tabriz', 'Kerman', 'Rasht', 'Qom', 'Kashan'];

function StarRow({ rating, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sz} ${n <= Math.round(rating ?? 0) ? 'fill-gold text-gold' : 'fill-muted text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

// ── Booking Widget ─────────────────────────────────────────────────────────────

function BookingWidget({ agency, lang }) {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const navigate = useNavigate();

  const handleRequest = () => {
    navigate(`/request-trip/agency/${agency?.id}`, {
      state: { destination, date, adults, children, guide: agency },
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-md sticky top-24">
      <h3 className="font-heading text-xl font-semibold text-foreground mb-5">
        {lang === 'fa' ? 'درخواست تور' : lang === 'ar' ? 'طلب جولة' : 'Request A Trip'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block font-body text-xs text-muted-foreground mb-1.5">
            {lang === 'fa' ? 'مقصد' : 'Destination'}
          </label>
          <div className="relative">
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 appearance-none cursor-pointer"
            >
              <option value="">{lang === 'fa' ? '-- مقصد را انتخاب کنید --' : '-- Select destination --'}</option>
              {CITIES_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block font-body text-xs text-muted-foreground mb-1.5">
            {lang === 'fa' ? 'تاریخ سفر' : 'Travel Date'}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
          <div>
            <p className="font-body text-sm font-medium text-foreground">{lang === 'fa' ? 'بزرگسال' : 'Adults'}</p>
            <p className="font-body text-xs text-muted-foreground">{lang === 'fa' ? 'سنین ۱۸ تا ۶۰' : 'Aged 18–60'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gold/10 hover:border-gold/40 transition">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-body text-sm font-semibold w-5 text-center">{adults}</span>
            <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gold/10 hover:border-gold/40 transition">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
          <div>
            <p className="font-body text-sm font-medium text-foreground">{lang === 'fa' ? 'کودک' : 'Children'}</p>
            <p className="font-body text-xs text-muted-foreground">{lang === 'fa' ? 'سنین ۱ تا ۱۰' : 'Aged 1–10'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gold/10 hover:border-gold/40 transition">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-body text-sm font-semibold w-5 text-center">{children}</span>
            <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gold/10 hover:border-gold/40 transition">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={handleRequest}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-black font-body font-bold text-sm hover:bg-gold/90 active:scale-[0.98] transition-all"
        >
          {lang === 'fa' ? 'درخواست تور' : 'Request A Trip'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────────────────────

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const text = review.comment || '';
  const needsTruncate = text.length > 150;

  return (
    <div className="p-5 rounded-2xl bg-card border border-border/50">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
          <span className="font-heading text-sm font-bold text-gold">
            {(review.userName || 'A')[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="font-body text-sm font-semibold text-foreground truncate">{review.userName || 'Anonymous'}</p>
            <p className="font-body text-xs text-muted-foreground ms-2">{review.date || ''}</p>
          </div>
          <StarRow rating={review.rating || 5} />
        </div>
      </div>
      {review.title && <p className="font-body text-sm font-semibold text-foreground mb-1">{review.title}</p>}
      <p className="font-body text-sm text-foreground/70 leading-relaxed">
        {needsTruncate && !expanded ? text.slice(0, 150) + '…' : text}
      </p>
      {needsTruncate && (
        <button onClick={() => setExpanded(!expanded)} className="mt-1 font-body text-xs text-gold hover:text-gold/80 font-medium transition">
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function RatingBreakdown({ reviewList = [] }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviewList.filter((r) => Math.round(r.rating || 5) === star).length,
  }));
  const total = reviewList.length || 1;

  return (
    <div className="space-y-2">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-3">
          <span className="font-body text-xs text-muted-foreground w-6 text-end">{star}★</span>
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${(count / total) * 100}%` }} />
          </div>
          <span className="font-body text-xs text-muted-foreground w-8">{Math.round((count / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AgencyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, dir } = useI18n();

  const [agency, setAgency] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);

    const run = async () => {
      try {
        const [{ data: profileData, error: profileErr }, { data: tourData }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', id).single(),
          supabase.from('tours').select('*').eq('guide_id', id).limit(6),
        ]);
        if (profileErr) throw profileErr;
        if (mounted) {
          setAgency(profileData);
          setTours(tourData || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) { setError(err.message); setAgency(null); }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          <p className="font-body text-muted-foreground text-sm">
            {lang === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">
            {lang === 'fa' ? 'آژانس یافت نشد' : 'Agency Not Found'}
          </h1>
          {error && <p className="font-body text-sm text-destructive mb-4">{error}</p>}
          <Link to="/agencies" className="text-gold hover:underline font-body">← Back to Agencies</Link>
        </div>
      </div>
    );
  }

  if (!agency.is_approved) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">
            {lang === 'fa' ? 'پروفایل در دسترس نیست' : lang === 'ar' ? 'الملف الشخصي غير متاح' : 'Profile Not Available'}
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            {lang === 'fa' ? 'این پروفایل در حال حاضر برای عموم در دسترس نیست.' : lang === 'ar' ? 'هذا الملف الشخصي غير متاح للعموم حالياً.' : 'This profile is not currently available to the public.'}
          </p>
          <Link to="/agencies" className="text-gold hover:underline font-body">← Back to Agencies</Link>
        </div>
      </div>
    );
  }

  const name = agency.full_name || '';
  const city = agency.city || '';
  const bio = agency.bio || '';
  const tourTypes = Array.isArray(agency.tour_types) ? agency.tour_types : Array.isArray(agency.specialties) ? agency.specialties : (agency.specialty ? [agency.specialty] : []);
  const languages = Array.isArray(agency.languages) ? agency.languages : (agency.languages ? agency.languages.split(',').map((s) => s.trim()) : []);
  const rating = agency.rating ?? null;
  const reviewCount = agency.reviews ?? agency.review_count ?? 0;
  const reviewList = Array.isArray(agency.review_list) ? agency.review_list : [];
  const licenseId = agency.license_id || agency.license_number || null;
  const established = agency.established_since || agency.guide_since || agency.created_at?.slice(0, 4) || null;
  const otherCities = Array.isArray(agency.other_cities) ? agency.other_cities : [];
  const hasAvatar = !!agency.avatar_url;
  const isRtl = dir === 'rtl';
  const visibleReviews = showAllReviews ? reviewList : reviewList.slice(0, 3);

  return (
    <div dir={dir} className="min-h-screen bg-background pb-20">
      {/* Top bar */}
      <div className="pt-20 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm transition"
          >
            {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {lang === 'fa' ? 'بازگشت' : 'Back'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── TOP SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mb-12"
        >
          {/* Logo/Photo */}
          <div className="w-full lg:w-[400px] aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-gold/5 flex items-center justify-center">
            {hasAvatar ? (
              <img src={avatarFor(agency)} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-gold/40">
                <Building2 className="w-24 h-24" />
                <p className="font-body text-sm">{lang === 'fa' ? 'لوگو آژانس' : 'Agency Logo'}</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center py-4">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
              {name}
            </h1>

            {rating != null && (
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold text-black font-body font-bold text-sm">
                  <Star className="w-4 h-4 fill-black" />
                  {Number(rating).toFixed(1)}
                </span>
                <StarRow rating={rating} size="md" />
                <span className="font-body text-sm text-muted-foreground">
                  {reviewCount} {lang === 'fa' ? 'نظر' : 'Reviews'}
                </span>
              </div>
            )}

            <div className="border-t border-border/50 my-4" />

            <div className="space-y-3">
              {licenseId && (
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="font-body text-sm text-foreground">
                    <span className="text-muted-foreground">
                      {lang === 'fa' ? 'مجوز آژانس:' : 'Agency License:'}
                    </span>{' '}
                    {licenseId}
                  </span>
                </div>
              )}
              {established && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="font-body text-sm text-foreground">
                    <span className="text-muted-foreground">
                      {lang === 'fa' ? 'تأسیس از سال:' : 'Established since:'}
                    </span>{' '}
                    {established}
                  </span>
                </div>
              )}
              {languages.length > 0 && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-foreground">
                    <span className="text-muted-foreground">
                      {lang === 'fa' ? 'زبان‌های پشتیبانی:' : 'Support languages:'}
                    </span>{' '}
                    {languages.join(', ')}
                  </span>
                </div>
              )}
              {city && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="font-body text-sm text-foreground">
                    <span className="text-muted-foreground">
                      {lang === 'fa' ? 'دفتر مرکزی:' : 'Headquarters:'}
                    </span>{' '}
                    {city}
                  </span>
                </div>
              )}
              {otherCities.length > 0 && (
                <div className="flex items-start gap-3">
                  <Map className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-foreground">
                    <span className="text-muted-foreground">
                      {lang === 'fa' ? 'مناطق تحت پوشش:' : 'Coverage areas:'}
                    </span>{' '}
                    {otherCities.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => navigate(`/request-trip/agency/${id}`, { state: { guide: agency } })}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gold text-black font-body font-bold text-sm hover:bg-gold/90 active:scale-[0.98] transition-all shadow-md"
              >
                {lang === 'fa' ? 'درخواست تور' : 'Request A Trip'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-2 border-gold text-gold font-body font-semibold text-sm hover:bg-gold/5 active:scale-[0.98] transition-all">
                <PenLine className="w-4 h-4" />
                {lang === 'fa' ? 'نوشتن نظر' : 'Write A Review'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── BELOW: 70/30 grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

          <div className="space-y-12">

            {/* About */}
            {bio && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4 pb-2 border-b border-border/50">
                  {lang === 'fa' ? 'درباره آژانس' : 'About The Agency'}
                </h2>
                <p className="font-body text-foreground/75 leading-relaxed text-base mb-5">{bio}</p>
                {tourTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tourTypes.map((s, i) => (
                      <span key={i} className="px-3.5 py-1.5 rounded-full text-sm font-body font-medium bg-gold/10 text-gold border border-gold/20">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Tours */}
            {tours.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4 pb-2 border-b border-border/50">
                  {lang === 'fa' ? `تورهای ${name.split(' ')[0]}` : `Tours by ${name.split(' ')[0]}`}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {tours.map((tour) => (
                    <Link key={tour.id} to={`/tours/${tour.slug || tour.id}`} className="group rounded-2xl border border-border/40 overflow-hidden hover:border-gold/40 hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {tour.image_url || tour.cover_image ? (
                          <img src={tour.image_url || tour.cover_image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                            <span className="font-body text-gold/40 text-sm">No image</span>
                          </div>
                        )}
                        {tour.duration && (
                          <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-body font-medium">
                            {tour.duration}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        {tour.city && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-body font-medium mb-2">
                            <MapPin className="w-3 h-3" />{tour.city}
                          </span>
                        )}
                        <h3 className="font-body font-semibold text-foreground text-sm mb-1 line-clamp-2">{tour.title}</h3>
                        {tour.price != null && (
                          <p className="font-body text-sm text-gold font-semibold">
                            {lang === 'fa' ? `از $${tour.price} برای گروه` : `From $${tour.price} Per Group`}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4 pb-2 border-b border-border/50">
                {lang === 'fa' ? 'نظرات' : 'Reviews'}
              </h2>
              {rating != null && (
                <div className="flex items-start gap-8 mb-6 p-5 rounded-2xl bg-card border border-border/50">
                  <div className="text-center">
                    <p className="font-heading text-5xl font-bold text-foreground">{Number(rating).toFixed(1)}</p>
                    <StarRow rating={rating} size="md" />
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {reviewCount} {lang === 'fa' ? 'نظر' : 'reviews'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <RatingBreakdown reviewList={reviewList} />
                  </div>
                </div>
              )}
              {reviewList.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {visibleReviews.map((review, idx) => (
                      <ReviewCard key={idx} review={review} />
                    ))}
                  </div>
                  {reviewList.length > 3 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="mt-4 w-full py-3 rounded-xl border-2 border-gold/30 text-gold font-body font-semibold text-sm hover:bg-gold/5 transition"
                    >
                      {showAllReviews ? (lang === 'fa' ? 'نمایش کمتر' : 'Show Less') : (lang === 'fa' ? `نمایش همه ${reviewList.length} نظر` : `Show all ${reviewList.length} reviews`)}
                    </button>
                  )}
                </>
              ) : (
                <p className="font-body text-muted-foreground text-sm py-6 text-center">
                  {lang === 'fa' ? 'هنوز نظری ثبت نشده است' : 'No reviews yet'}
                </p>
              )}
            </section>
          </div>

          {/* RIGHT: Booking Widget */}
          <div>
            <BookingWidget agency={agency} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
