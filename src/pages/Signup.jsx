// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Building2, MapPin,
  ArrowRight, ArrowLeft, Eye, EyeOff, Loader2,
  Star, Bookmark, Compass,
} from 'lucide-react';

const BENEFITS = [
  { icon: Compass, titleKey: 'login_benefit1_title', descKey: 'login_benefit1_desc' },
  { icon: Bookmark, titleKey: 'login_benefit2_title', descKey: 'login_benefit2_desc' },
  { icon: Star,    titleKey: 'login_benefit3_title', descKey: 'login_benefit3_desc' },
];

export default function Signup() {
  const { lang, dir, t } = useI18n();
  const navigate = useNavigate();
  const isRtl = dir === 'rtl';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  // ── Form state (unchanged) ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'tourist',
    gender: '',
    city: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ── Submit logic (unchanged) ──────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup_err_pw_match'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('signup_err_pw_len'));
      return;
    }

    if ((formData.role === 'guide' || formData.role === 'agency') && !formData.city) {
      setError(t('signup_err_city'));
      return;
    }

    if (!formData.gender) {
      setError(t('signup_err_gender'));
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
            gender: formData.gender,
            city: formData.city || null,
            bio: formData.bio || null,
          }
        }
      });

      if (authError) throw authError;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      navigate('/');
      window.location.reload();

    } catch (err) {
      setError(err.message || t('signup_err_failed'));
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input class (mirrors Login exactly) ────────────────────────────
  const inputCls = (withIcon, extraEnd = false) =>
    `w-full ${
      withIcon
        ? isRtl
          ? `pe-10 ${extraEnd ? 'ps-10' : 'ps-3.5'}`
          : `ps-10 ${extraEnd ? 'pe-10' : 'pe-3.5'}`
        : 'px-3.5'
    } py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 transition`;

  const iconCls = isRtl ? 'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none end-3.5'
                        : 'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none start-3.5';

  const labelCls = 'block font-body text-xs text-muted-foreground mb-1.5';

  return (
    <div dir={dir} className="min-h-screen flex">

      {/* ── Left Panel: Dark branding (matches Login) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between relative overflow-hidden bg-[hsl(222,55%,8%)]">
        {/* Ambient glows */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 25%, hsl(38,62%,52%) 0%, transparent 50%),
                              radial-gradient(circle at 25% 75%, hsl(178,85%,32%) 0%, transparent 45%)`,
          }}
        />
        {/* Diamond lattice */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, hsl(38,62%,60%) 0px, transparent 1px, transparent 40px, hsl(38,62%,60%) 41px),
                              repeating-linear-gradient(-45deg, hsl(38,62%,60%) 0px, transparent 1px, transparent 40px, hsl(38,62%,60%) 41px)`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-[hsl(38,62%,52%)] flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-white text-xl font-bold tracking-wide">
              Iran Tour Advisor
            </span>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <h2 className="font-heading text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              {t('login_welcome_1')}<br />
              <span className="text-[hsl(38,62%,60%)]">{t('signup_heading')}</span>
            </h2>
            <p className="font-body text-[hsl(222,20%,65%)] text-base leading-relaxed max-w-xs">
              {t('signup_subtitle')}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6 flex-1">
            {BENEFITS.map(({ icon: Icon, titleKey, descKey }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isRtl ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4"
              >
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-[hsl(38,62%,52%)]/20 border border-[hsl(38,62%,52%)]/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[hsl(38,62%,65%)]" />
                </div>
                <div>
                  <p className="font-body text-white font-semibold text-sm mb-0.5">{t(titleKey)}</p>
                  <p className="font-body text-[hsl(222,15%,58%)] text-xs leading-relaxed">{t(descKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom quote */}
          <div className="mt-auto pt-10 border-t border-white/10">
            <p className="font-body text-[hsl(222,15%,50%)] text-xs italic leading-relaxed">
              {t('login_quote')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-12 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-1">
              {t('signup_heading')}
            </h1>
            <p className="font-body text-muted-foreground text-sm">
              {t('signup_subtitle')}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 font-body text-sm leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className={labelCls}>{t('field_full_name')} *</label>
              <div className="relative">
                <User className={iconCls} />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => handleChange('full_name', e.target.value)}
                  className={inputCls(true)}
                  placeholder={t('signup_full_name_ph')}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>{t('field_email')} *</label>
              <div className="relative">
                <Mail className={iconCls} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={inputCls(true)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelCls}>{t('field_password')} *</label>
              <div className="relative">
                <Lock className={iconCls} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className={inputCls(true, true)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition ${isRtl ? 'start-3.5' : 'end-3.5'}`}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelCls}>{t('field_confirm_password')} *</label>
              <div className="relative">
                <Lock className={iconCls} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  className={inputCls(true)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className={labelCls}>{t('signup_account_type')} *</label>
              <div className="grid grid-cols-3 rounded-xl border border-border overflow-hidden">
                {[
                  { value: 'tourist', icon: User },
                  { value: 'guide',   icon: MapPin },
                  { value: 'agency',  icon: Building2 },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange('role', value)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 font-body text-xs font-medium transition-all duration-150 ${
                      formData.role === value
                        ? 'bg-accent text-white'
                        : 'bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t('role_' + value)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className={labelCls}>{t('signup_gender')} *</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 'male',   img: '/avatars/default-male.png' },
                  { value: 'female', img: '/avatars/default-female.png' },
                ].map(({ value, img }) => {
                  const selected = formData.gender === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange('gender', value)}
                      aria-pressed={selected}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-150 ${
                        selected
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground'
                      }`}
                    >
                      <img
                        src={img}
                        alt={t('gender_' + value)}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <span className="font-body text-sm font-medium">{t('gender_' + value)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guide / Agency extra fields */}
            <AnimatePresence>
              {(formData.role === 'guide' || formData.role === 'agency') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div>
                    <label className={labelCls}>{t('signup_city_label')} *</label>
                    <div className="relative">
                      <MapPin className={iconCls} />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => handleChange('city', e.target.value)}
                        className={inputCls(true)}
                        placeholder={t('signup_city_ph')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>{t('signup_bio_label')}</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => handleChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 transition resize-none"
                      placeholder={t('signup_bio_ph')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-1 py-3 rounded-xl bg-accent text-white font-body font-semibold text-sm hover:bg-accent/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Arrow className="w-4 h-4" />}
              {loading ? t('signup_signing_up') : t('signup_submit')}
            </button>
          </form>

          {/* Link to login */}
          <p className="mt-6 text-center font-body text-sm text-muted-foreground">
            {lang === 'fa' ? 'حساب دارید؟' : lang === 'ar' ? 'لديك حساب؟' : 'Already have an account?'}{' '}
            <Link
              to="/login"
              className="text-accent font-medium hover:underline underline-offset-2 transition"
            >
              {t('auth_signin')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
