import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building2, MapPin, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Signup() {
  const { lang, dir, t } = useI18n();
  const navigate = useNavigate();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

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
      // ۱. ثبت‌نام در Supabase Auth
      // پروفایل به‌صورت خودکار توسط تریگر handle_new_user در دیتابیس ساخته می‌شود
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

      // ۲. ورود خودکار بلافاصله بعد از ثبت‌نام (بدون انتظار برای تأیید ایمیل)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // ۳. redirect به صفحه اصلی
      navigate('/');
      window.location.reload();

    } catch (err) {
      setError(err.message || t('signup_err_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <User className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            {t('signup_heading')}
          </h1>
          <p className="font-body text-muted-foreground">
            {t('signup_subtitle')}
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 p-8 shadow-warm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 font-body text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">

            {/* نام کامل */}
            <div>
              <label className="block font-body text-sm text-muted-foreground mb-1.5">
                {t('field_full_name')}
              </label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => handleChange('full_name', e.target.value)}
                  className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50`}
                  placeholder={t('signup_full_name_ph')}
                />
              </div>
            </div>

            {/* ایمیل */}
            <div>
              <label className="block font-body text-sm text-muted-foreground mb-1.5">
                {t('field_email')}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* رمز عبور */}
            <div>
              <label className="block font-body text-sm text-muted-foreground mb-1.5">
                {t('field_password')}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className={`w-full ${dir === 'rtl' ? 'pe-11 ps-11' : 'ps-11 pe-11'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${dir === 'rtl' ? 'start-4' : 'end-4'}`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* تکرار رمز عبور */}
            <div>
              <label className="block font-body text-sm text-muted-foreground mb-1.5">
                {t('field_confirm_password')}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* انتخاب نوع حساب */}
            <div>
              <label className="block font-body text-sm text-muted-foreground mb-2">
                {t('signup_account_type')}
              </label>
              <div className="grid grid-cols-3 rounded-xl border border-border overflow-hidden">
                {[
                  { value: 'tourist', icon: User },
                  { value: 'guide', icon: MapPin },
                  { value: 'agency', icon: Building2 },
                ].map(({ value, icon: Icon }) => (
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
                    {t('role_' + value)}
                  </button>
                ))}
              </div>
            </div>

            {/* جنسیت */}
            <div>
              <label className="block font-body text-sm text-muted-foreground mb-2">
                {t('signup_gender')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'male', img: '/avatars/default-male.png' },
                  { value: 'female', img: '/avatars/default-female.png' },
                ].map(({ value, img }) => {
                  const selected = formData.gender === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange('gender', value)}
                      aria-pressed={selected}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                        selected
                          ? 'border-accent bg-accent/10 shadow-sm scale-[1.02]'
                          : 'border-border bg-background hover:border-accent/40 hover:bg-accent/5'
                      }`}
                    >
                      <img
                        src={img}
                        alt={t('gender_' + value)}
                        className={`w-16 h-16 rounded-full object-cover transition-opacity ${selected ? 'opacity-100' : 'opacity-80'}`}
                      />
                      <span className={`font-body text-sm font-semibold ${selected ? 'text-accent' : 'text-foreground'}`}>
                        {t('gender_' + value)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* فیلدهای اضافه برای راهنما و آژانس */}
            {(formData.role === 'guide' || formData.role === 'agency') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-1"
              >
                <div>
                  <label className="block font-body text-sm text-muted-foreground mb-1.5">
                    {t('signup_city_label')}
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => handleChange('city', e.target.value)}
                      className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-4'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50`}
                      placeholder={t('signup_city_ph')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-sm text-muted-foreground mb-1.5">
                    {lang === 'fa' ? 'معرفی کوتاه' : 'Short Bio'}
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={e => handleChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    placeholder={lang === 'fa' ? 'درباره خودتان بنویسید...' : 'Tell us about yourself...'}
                  />
                </div>
              </motion.div>
            )}

            {/* دکمه ثبت‌نام */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Arrow className="w-5 h-5" />}
              {loading
                ? (lang === 'fa' ? 'در حال ثبت‌نام...' : 'Signing up...')
                : (lang === 'fa' ? 'ایجاد حساب' : 'Create Account')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}