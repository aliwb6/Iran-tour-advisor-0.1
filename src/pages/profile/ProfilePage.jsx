import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone, Mail, Globe, MapPin, Plane, Star,
  Calendar, ClipboardList, Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n.jsx';
import { supabase } from '@/supabaseClient';
import UserAvatar from '@/components/profile/UserAvatar';
import VerificationBadge from '@/components/profile/VerificationBadge';
import EditableField from '@/components/profile/EditableField';

// Cinematic Iranian backdrop used behind the profile hero. Stored on the
// project's existing base44 CDN, blurred + tinted at render time so it never
// fights the content.
const HERO_BG = 'https://media.base44.com/images/public/69fddcfab0730c36bda3631e/cce446b52_generated_d017c773.png';

function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/40">
      <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-heading text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="font-body text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile, isLoadingAuth, isAuthenticated } = useAuth();
  const { lang } = useI18n();
  const [localProfile, setLocalProfile] = useState(profile);
  const [reviewCount, setReviewCount] = useState(0);

  // Bounce signed-out visitors to login.
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
  }, [isLoadingAuth, isAuthenticated, navigate]);

  // Keep local in sync with AuthContext.
  useEffect(() => { setLocalProfile(profile); }, [profile]);

  // Total reviews this user has written (best-effort).
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('reviewer_id', user.id);
      if (!cancelled && typeof count === 'number') setReviewCount(count);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const memberSince = (() => {
    const iso = profile?.created_at || user?.created_at;
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(lang === 'fa' ? 'fa-IR' : lang === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' });
  })();

  const saveField = (key) => async (value) => {
    if (!user?.id) return;
    const trimmed = typeof value === 'string' ? value.trim() : value;
    const { error } = await supabase
      .from('profiles')
      .update({ [key]: trimmed || null })
      .eq('id', user.id);
    if (error) throw error;
    setLocalProfile((p) => ({ ...(p || {}), [key]: trimmed || null }));
    fetchProfile?.(user.id);
  };

  const tx = {
    memberSince:    lang === 'fa' ? 'عضو از' : lang === 'ar' ? 'عضو منذ' : 'Member since',
    aboutMe:        lang === 'fa' ? 'درباره من' : lang === 'ar' ? 'نبذة عني' : 'About Me',
    aboutPh:        lang === 'fa' ? 'داستان سفر خود را بنویس...' : lang === 'ar' ? 'شارك قصة سفرك...' : 'Share your story — what draws you to travel?',
    city:           lang === 'fa' ? 'شهر' : lang === 'ar' ? 'المدينة' : 'City',
    cityPh:         lang === 'fa' ? 'مثلاً: لندن، بریتانیا' : lang === 'ar' ? 'مثل: لندن، المملكة المتحدة' : 'e.g. London, UK',
    verification:   lang === 'fa' ? 'وضعیت تأیید' : lang === 'ar' ? 'حالة التحقق' : 'Verification',
    phone:          lang === 'fa' ? 'موبایل' : lang === 'ar' ? 'الهاتف' : 'Phone',
    email:          lang === 'fa' ? 'ایمیل' : lang === 'ar' ? 'البريد' : 'Email',
    social:         lang === 'fa' ? 'شبکه‌های اجتماعی' : lang === 'ar' ? 'وسائل التواصل' : 'Social',
    totalTrips:     lang === 'fa' ? 'سفرها' : lang === 'ar' ? 'الرحلات' : 'Total Trips',
    countries:      lang === 'fa' ? 'کشورها' : lang === 'ar' ? 'الدول' : 'Countries Visited',
    reviews:        lang === 'fa' ? 'نظرات' : lang === 'ar' ? 'المراجعات' : 'Reviews Given',
    editProfile:    lang === 'fa' ? 'ویرایش پروفایل' : lang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile',
    myRequests:    lang === 'fa' ? 'درخواست‌های من' : lang === 'ar' ? 'طلباتي' : 'My Requests',
    myBookings:    lang === 'fa' ? 'رزروهای من' : lang === 'ar' ? 'حجوزاتي' : 'My Bookings',
    slogan:        lang === 'fa'
      ? 'زیبایی پنهان ایران اصیل را در سفرهای فرهنگی پرمعنا کشف کن.'
      : lang === 'ar'
      ? 'اكتشف الجمال الخفي لإيران الأصيلة عبر رحلات ثقافية ذات معنى.'
      : 'Discover the hidden beauty of authentic Iran through meaningful cultural journeys.',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative h-[420px] sm:h-[460px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover scale-110 blur-[3px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/75 to-background" />
          <div className="absolute inset-0 carpet-texture opacity-40" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 sm:pt-32 pb-10"
        >
          <p className="font-body text-[11px] tracking-[0.25em] uppercase text-gold/80 mb-3">
            {tx.slogan}
          </p>
          <div className="flex items-end gap-6">
            <UserAvatar profile={localProfile} userId={user?.id} onSave={(p) => setLocalProfile(p)} size={132} />
            <div className="pb-2">
              <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-white leading-tight">
                {localProfile?.full_name || user?.user_metadata?.full_name || (lang === 'fa' ? 'مسافر' : lang === 'ar' ? 'مسافر' : 'Traveller')}
              </h1>
              <p className="font-body text-sm text-white/65 mt-1.5">
                {tx.memberSince} {memberSince}
              </p>
              {localProfile?.city && (
                <p className="flex items-center gap-1.5 font-body text-sm text-white/75 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  {localProfile.city}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Main grid ── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-10 grid lg:grid-cols-3 gap-6">
        {/* Left column: editable details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-3xl p-6"
          >
            <EditableField
              label={tx.city}
              value={localProfile?.city || ''}
              placeholder={tx.cityPh}
              onSave={saveField('city')}
            />
            <EditableField
              label={tx.aboutMe}
              value={localProfile?.bio || ''}
              placeholder={tx.aboutPh}
              type="textarea"
              onSave={saveField('bio')}
            />
          </motion.div>

          {/* Verification badges */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-3xl p-6"
          >
            <h3 className="font-heading text-sm font-semibold text-foreground mb-4">{tx.verification}</h3>
            <div className="flex flex-wrap gap-2.5">
              <VerificationBadge icon={Phone} label={tx.phone} verified={Boolean(localProfile?.phone_verified)} />
              <VerificationBadge icon={Mail}  label={tx.email} verified={Boolean(user?.email_confirmed_at)} />
              <VerificationBadge icon={Globe} label={tx.social} verified={false} />
            </div>
          </motion.div>
        </div>

        {/* Right column: stats + quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          <StatTile icon={Plane} value={localProfile?.total_trips ?? 0} label={tx.totalTrips} />
          <StatTile icon={Globe} value={localProfile?.countries_visited ?? 0} label={tx.countries} />
          <StatTile icon={Star}  value={reviewCount} label={tx.reviews} />

          <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-4 mt-4 space-y-2">
            <Link
              to="/profile/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition"
            >
              <Settings className="w-4 h-4" />
              {tx.editProfile}
            </Link>
            <Link
              to="/profile/requests"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition"
            >
              <ClipboardList className="w-4 h-4" />
              {tx.myRequests}
            </Link>
            <Link
              to="/profile/bookings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition"
            >
              <Calendar className="w-4 h-4" />
              {tx.myBookings}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
