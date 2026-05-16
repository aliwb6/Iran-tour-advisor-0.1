import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Loader2,
  Star, Bookmark, Compass, ArrowRight, ArrowLeft, CheckCircle2,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Compass,
    en: { title: 'Your Journey Continues', desc: 'Pick up your Iran adventure exactly where you left off' },
    fa: { title: 'سفر شما ادامه دارد', desc: 'دقیقاً از همان‌جایی که رفته بودید ادامه دهید' },
  },
  {
    icon: Bookmark,
    en: { title: 'Saved Favourites', desc: 'Instant access to your saved guides, tours, and destinations' },
    fa: { title: 'موارد ذخیره‌شده', desc: 'دسترسی سریع به راهنماها، تورها و مقاصد مورد علاقه‌تان' },
  },
  {
    icon: Star,
    en: { title: 'Personalised for You', desc: 'AI recommendations shaped by your unique travel style' },
    fa: { title: 'شخصی‌سازی شده برای شما', desc: 'پیشنهادهای هوش مصنوعی متناسب با سبک سفر شما' },
  },
];

export default function Login() {
  const { lang, dir } = useI18n();
  const navigate = useNavigate();
  const isRtl = dir === 'rtl';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const role = data.user?.user_metadata?.role;
      if (role === 'guide' || role === 'agency') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        setError(
          lang === 'fa'
            ? 'ایمیل یا رمز عبور اشتباه است. / Invalid email or password.'
            : 'Invalid email or password. / ایمیل یا رمز عبور اشتباه است.'
        );
      } else if (msg.includes('Email not confirmed')) {
        setError(
          lang === 'fa'
            ? 'لطفاً ایمیل خود را تأیید کنید. / Please verify your email first.'
            : 'Please verify your email first. / لطفاً ایمیل خود را تأیید کنید.'
        );
      } else {
        setError(lang === 'fa' ? `خطا: ${msg}` : `Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
      setResetSent(true);
    } catch (err) {
      setResetError(lang === 'fa' ? `خطا: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen flex">

      {/* ── Left Panel: Dark Benefits ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between relative overflow-hidden bg-[hsl(222,55%,8%)]">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 25%, hsl(38,62%,52%) 0%, transparent 50%),
                              radial-gradient(circle at 25% 75%, hsl(178,85%,32%) 0%, transparent 45%)`,
          }}
        />
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
              {lang === 'fa' ? (
                <>خوش آمدید<br /><span className="text-[hsl(38,62%,60%)]">دوباره</span></>
              ) : (
                <>Welcome<br /><span className="text-[hsl(38,62%,60%)]">Back</span></>
              )}
            </h2>
            <p className="font-body text-[hsl(222,20%,65%)] text-base leading-relaxed max-w-xs">
              {lang === 'fa'
                ? 'ادامه سفر ایرانی شما در یک کلیک'
                : 'Continue your Iranian adventure — one click away'}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6 flex-1">
            {BENEFITS.map(({ icon: Icon, en, fa }, i) => {
              const content = lang === 'fa' ? fa : en;
              return (
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
                    <p className="font-body text-white font-semibold text-sm mb-0.5">{content.title}</p>
                    <p className="font-body text-[hsl(222,15%,58%)] text-xs leading-relaxed">{content.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom quote */}
          <div className="mt-auto pt-10 border-t border-white/10">
            <p className="font-body text-[hsl(222,15%,50%)] text-xs italic leading-relaxed">
              {lang === 'fa'
                ? '"هر سفر به ایران داستانی تازه است که منتظر روایت توست"'
                : '"Every journey to Iran is a new story waiting to be told"'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-1">
              {lang === 'fa' ? 'ورود به حساب' : 'Sign In'}
            </h1>
            <p className="font-body text-muted-foreground text-sm">
              {lang === 'fa' ? 'به دنیای ایران‌گردی خوش آمدید' : 'Good to have you back'}
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
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block font-body text-xs text-muted-foreground mb-1.5">
                {lang === 'fa' ? 'ایمیل' : 'Email'} *
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRtl ? 'end-3.5' : 'start-3.5'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full ${isRtl ? 'pe-10 ps-3.5' : 'ps-10 pe-3.5'} py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 transition`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-body text-xs text-muted-foreground">
                  {lang === 'fa' ? 'رمز عبور' : 'Password'} *
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotOpen(v => !v); setResetSent(false); setResetError(''); }}
                  className="font-body text-xs text-accent hover:underline underline-offset-2 transition"
                >
                  {lang === 'fa' ? 'رمز عبور را فراموش کردید؟' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRtl ? 'end-3.5' : 'start-3.5'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full ${isRtl ? 'pe-10 ps-10' : 'ps-10 pe-10'} py-2.5 rounded-xl border border-border bg-background font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 transition`}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {/* Forgot password inline panel */}
            <AnimatePresence>
              {forgotOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                    {resetSent ? (
                      <div className="flex items-center gap-2 text-green-600 font-body text-sm">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {lang === 'fa'
                            ? 'لینک بازیابی ارسال شد. ایمیل خود را بررسی کنید.'
                            : 'Reset link sent — check your inbox.'}
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={handleResetPassword} className="space-y-2.5">
                        <p className="font-body text-xs text-muted-foreground">
                          {lang === 'fa'
                            ? 'ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود.'
                            : 'Enter your email and we\'ll send a reset link.'}
                        </p>
                        {resetError && (
                          <p className="font-body text-xs text-red-500">{resetError}</p>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="email"
                            required
                            value={resetEmail}
                            onChange={e => setResetEmail(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 transition"
                            placeholder="you@example.com"
                          />
                          <button
                            type="submit"
                            disabled={resetLoading}
                            className="px-3 py-2 rounded-lg bg-accent text-white font-body text-xs font-medium hover:bg-accent/90 transition disabled:opacity-60"
                          >
                            {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (lang === 'fa' ? 'ارسال' : 'Send')}
                          </button>
                        </div>
                      </form>
                    )}
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
              {loading
                ? (lang === 'fa' ? 'در حال ورود...' : 'Signing in...')
                : (lang === 'fa' ? 'ورود به حساب' : 'Sign In')}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center font-body text-sm text-muted-foreground">
            {lang === 'fa' ? 'حساب کاربری ندارید؟' : "Don't have an account?"}{' '}
            <Link
              to="/register"
              className="text-accent font-medium hover:underline underline-offset-2 transition"
            >
              {lang === 'fa' ? 'ثبت‌نام رایگان' : 'Join free'}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
