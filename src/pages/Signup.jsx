import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Building2, MapPin, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, Compass } from 'lucide-react';

export default function Signup() {
  const { dir, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [mode, setMode] = useState(location.pathname === '/login' ? 'login' : 'signup');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'tourist',
    city: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message || (lang === 'fa' ? 'خطا در ورود' : lang === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(lang === 'fa' ? 'رمزهای عبور مطابقت ندارند' : lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError(lang === 'fa' ? 'رمز عبور باید حداقل ۸ کاراکتر باشد' : lang === 'ar' ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    if ((formData.role === 'guide' || formData.role === 'agency') && !formData.city) {
      setError(lang === 'fa' ? 'لطفاً شهر خود را وارد کنید' : lang === 'ar' ? 'يرجى إدخال مدينتك' : 'Please enter your city');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.full_name } }
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          city: formData.city || null,
          bio: formData.bio || null,
        });
        if (profileError) throw profileError;
      }

      if (formData.role === 'guide' || formData.role === 'agency') {
        navigate('/guide-onboarding');
      } else {
        setSuccess(lang === 'fa' ? 'حساب ساخته شد! لطفاً ایمیل خود را تأیید کنید.' : lang === 'ar' ? 'تم إنشاء الحساب! يرجى تأكيد بريدك الإلكتروني.' : 'Account created! Please check your email to confirm.');
      }
    } catch (err) {
      setError(err.message || (lang === 'fa' ? 'خطا در ثبت‌نام' : lang === 'ar' ? 'فشل التسجيل' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    login: {
      title: { en: 'Welcome Back', fa: 'خوش آمدید', ar: 'مرحباً بعودتك' },
      sub: { en: 'Sign in to your account', fa: 'وارد حساب خود شوید', ar: 'سجّل الدخول إلى حسابك' },
      btn: { en: 'Sign In', fa: 'ورود', ar: 'تسجيل الدخول' },
      loading: { en: 'Signing in...', fa: 'در حال ورود...', ar: 'جارٍ الدخول...' },
      switch: { en: "Don't have an account?", fa: 'حساب ندارید؟', ar: 'ليس لديك حساب؟' },
      switchBtn: { en: 'Create one', fa: 'ثبت‌نام', ar: 'إنشاء حساب' },
    },
    signup: {
      title: { en: 'Create Account', fa: 'ایجاد حساب', ar: 'إنشاء حساب' },
      sub: { en: 'Join Iran Tour Advisor', fa: 'به Iran Tour Advisor بپیوندید', ar: 'انضم إلى Iran Tour Advisor' },
      btn: { en: 'Create Account', fa: 'ایجاد حساب', ar: 'إنشاء الحساب' },
      loading: { en: 'Creating account...', fa: 'در حال ثبت‌نام...', ar: 'جارٍ إنشاء الحساب...' },
      switch: { en: 'Already have an account?', fa: 'حساب دارید؟', ar: 'لديك حساب بالفعل؟' },
      switchBtn: { en: 'Sign in', fa: 'ورود', ar: 'تسجيل الدخول' },
    },
  };

  const t = (key) => labels[mode][key][lang] || labels[mode][key].en;

  return (
    <div dir={dir} className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full bg-accent/15 group-hover:bg-accent/25 transition-colors" />
            <div className="absolute inset-0 rounded-full border border-gold/50 group-hover:border-gold transition-colors" />
            <Compass className="absolute inset-0 m-auto w-4 h-4 text-accent" />
          </div>
          <span className="font-heading text-base font-semibold tracking-wide text-foreground">Iran Tour Advisor</span>
        </Link>

        {/* Mode tabs */}
        <div className="flex rounded-2xl border border-border/60 bg-muted/40 p-1 mb-8">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-xl font-body text-sm font-medium transition-all duration-300 ${
                mode === m
                  ? 'bg-card text-foreground shadow-sm border border-border/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'login'
                ? (lang === 'fa' ? 'ورود' : lang === 'ar' ? 'دخول' : 'Sign In')
                : (lang === 'fa' ? 'ثبت‌نام' : lang === 'ar' ? 'تسجيل' : 'Sign Up')}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="font-heading text-2xl font-bold text-foreground mb-1">{t('title')}</h1>
              <p className="font-body text-sm text-muted-foreground">{t('sub')}</p>
            </div>

            <div className="bg-card rounded-3xl border border-border/50 p-7 shadow-warm">
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 font-body text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 font-body text-sm">
                  {success}
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-1.5">
                      {lang === 'fa' ? 'ایمیل' : lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={e => handleChange('email', e.target.value)}
                        className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors`}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-1.5">
                      {lang === 'fa' ? 'رمز عبور' : lang === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={e => handleChange('password', e.target.value)}
                        className={`w-full ${dir === 'rtl' ? 'pe-11 ps-11' : 'ps-11 pe-11'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${dir === 'rtl' ? 'start-4' : 'end-4'}`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Arrow className="w-5 h-5" />}
                    {loading ? t('loading') : t('btn')}
                  </button>
                </form>
              )}

              {/* ── SIGNUP FORM ── */}
              {mode === 'signup' && (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-1.5">
                      {lang === 'fa' ? 'نام کامل' : lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={e => handleChange('full_name', e.target.value)}
                        className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors`}
                        placeholder={lang === 'fa' ? 'نام و نام خانوادگی' : lang === 'ar' ? 'الاسم الكامل' : 'Your full name'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-1.5">
                      {lang === 'fa' ? 'ایمیل' : lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={e => handleChange('email', e.target.value)}
                        className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors`}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-1.5">
                      {lang === 'fa' ? 'رمز عبور' : lang === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={e => handleChange('password', e.target.value)}
                        className={`w-full ${dir === 'rtl' ? 'pe-11 ps-11' : 'ps-11 pe-11'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${dir === 'rtl' ? 'start-4' : 'end-4'}`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-1.5">
                      {lang === 'fa' ? 'تکرار رمز عبور' : lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={e => handleChange('confirmPassword', e.target.value)}
                        className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-2">
                      {lang === 'fa' ? 'نوع حساب' : lang === 'ar' ? 'نوع الحساب' : 'Account Type'}
                    </label>
                    <div className="grid grid-cols-3 rounded-xl border border-border overflow-hidden">
                      {[
                        { value: 'tourist', fa: 'گردشگر', en: 'Tourist', ar: 'سائح', icon: User },
                        { value: 'guide', fa: 'راهنما', en: 'Guide', ar: 'مرشد', icon: MapPin },
                        { value: 'agency', fa: 'آژانس', en: 'Agency', ar: 'وكالة', icon: Building2 },
                      ].map(({ value, fa, en, ar, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleChange('role', value)}
                          className={`flex flex-col items-center gap-1 py-3 px-2 font-body text-xs font-medium transition-all duration-200 ${
                            formData.role === value
                              ? 'bg-accent text-white'
                              : 'bg-card text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {lang === 'fa' ? fa : lang === 'ar' ? ar : en}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(formData.role === 'guide' || formData.role === 'agency') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-1"
                    >
                      <div>
                        <label className="block font-body text-sm text-muted-foreground mb-1.5">
                          {lang === 'fa' ? 'شهر فعالیت' : lang === 'ar' ? 'مدينة النشاط' : 'City of Activity'}
                        </label>
                        <div className="relative">
                          <MapPin className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                          <input
                            type="text"
                            value={formData.city}
                            onChange={e => handleChange('city', e.target.value)}
                            className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors`}
                            placeholder={lang === 'fa' ? 'مثلاً: تهران، اصفهان' : lang === 'ar' ? 'مثال: طهران، أصفهان' : 'e.g. Tehran, Isfahan'}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-body text-sm text-muted-foreground mb-1.5">
                          {lang === 'fa' ? 'معرفی کوتاه' : lang === 'ar' ? 'نبذة قصيرة' : 'Short Bio'}
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={e => handleChange('bio', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none transition-colors"
                          placeholder={lang === 'fa' ? 'درباره خودتان بنویسید...' : lang === 'ar' ? 'اكتب عن نفسك...' : 'Tell us about yourself...'}
                        />
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Arrow className="w-5 h-5" />}
                    {loading ? t('loading') : t('btn')}
                  </button>
                </form>
              )}
            </div>

            {/* Switch mode footer */}
            <p className="text-center font-body text-sm text-muted-foreground mt-5">
              {t('switch')}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-accent font-medium hover:underline"
              >
                {t('switchBtn')}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
