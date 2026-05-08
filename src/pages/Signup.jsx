import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Signup() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tourist',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('register');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    setLoading(true);
    try {
      await base44.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (formData.role === 'guide') {
        navigate('/guide-onboarding');
      } else {
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || (lang === 'fa' ? 'خطا در ثبت‌نام' : lang === 'ar' ? 'خطأ في التسجيل' : 'Registration failed'));
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
            {lang === 'fa' ? 'ایجاد حساب کاربری' : lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}
          </h1>
          <p className="font-body text-muted-foreground">
            {lang === 'fa' ? 'به Iran Tour Advisor خوش آمدید' : lang === 'ar' ? 'مرحباً بك في Iran Tour Advisor' : 'Welcome to Iran Tour Advisor'}
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 p-8 shadow-warm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 font-body text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block font-body text-sm text-muted-foreground mb-1.5">
                {lang === 'fa' ? 'ایمیل' : lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
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

            <div>
              <label className="block font-body text-sm text-muted-foreground mb-1.5">
                {lang === 'fa' ? 'رمز عبور' : lang === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'end-4' : 'start-4'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className={`w-full ${dir === 'rtl' ? 'pe-11 ps-4' : 'ps-11 pe-11'} py-3 rounded-xl border border-border bg-background font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50`}
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

            <div>
              <label className="block font-body text-sm text-muted-foreground mb-1.5">
                {lang === 'fa' ? 'تکرار رمز عبور' : lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
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

            <div className="pt-2">
              <div className="flex rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleChange('role', 'tourist')}
                  className={`flex-1 py-3 px-4 font-body text-sm font-medium transition-all duration-200 ${
                    formData.role === 'tourist'
                      ? 'bg-accent text-white'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lang === 'fa' ? 'گردشگر' : lang === 'ar' ? 'سائح' : 'Tourist'}
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('role', 'guide')}
                  className={`flex-1 py-3 px-4 font-body text-sm font-medium transition-all duration-200 ${
                    formData.role === 'guide'
                      ? 'bg-accent text-white'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lang === 'fa' ? 'راهنمای محلی' : lang === 'ar' ? 'مرشد محلي' : 'Local Guide'}
                </button>
              </div>
              <p className="font-body text-xs text-muted-foreground mt-2 text-center">
                {lang === 'fa' ? 'آیا راهنمای محلی هستید؟ به عنوان راهنما ثبت‌نام کنید.' : lang === 'ar' ? 'هل أنت مرشد محلي؟ سجّل كمرشد.' : 'Are you a local guide? Register as a guide.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading
                ? (lang === 'fa' ? 'در حال ثبت‌نام...' : lang === 'ar' ? 'جارٍ التسجيل...' : 'Signing up...')
                : (lang === 'fa' ? 'ایجاد حساب' : lang === 'ar' ? 'إنشاء حساب' : 'Create Account')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}