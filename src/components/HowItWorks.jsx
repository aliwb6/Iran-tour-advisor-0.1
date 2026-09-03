import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Map, CheckCircle2, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';

// Step copy is kept inline rather than added to i18n.jsx — matches the
// EN/FA/AR ternary pattern used in AITeaser.jsx and the rest of the home
// components. Step 1 carries a CTA hint per the design spec; the other
// three steps don't.
const STEPS = [
  {
    icon: Sparkles,
    en: {
      eyebrow: 'Step 01',
      title: 'Tell the AI Your Dream Journey',
      desc:
        'Open our AI Travel Assistant and simply describe your trip — where you want to go in Iran, your travel dates, your interests (architecture, nature, food, history…), and your travel style. No long forms. Just a conversation.',
    },
    fa: {
      eyebrow: 'گام ۰۱',
      title: 'رؤیای سفرت را برای هوش مصنوعی تعریف کن',
      desc:
        'دستیار سفر هوشمند ما را باز کن و سفرت را به زبان خودت توضیح بده — کجاهای ایران، چه تاریخی، چه علاقه‌هایی (معماری، طبیعت، غذا، تاریخ…) و سبک سفرت. بدون فرم‌های طولانی — فقط یک گفتگو.',
    },
    ar: {
      eyebrow: 'الخطوة 01',
      title: 'صف رحلة أحلامك للذكاء الاصطناعي',
      desc:
        'افتح مساعد السفر الذكي وصِف رحلتك بكلماتك — أين تريد الذهاب في إيران، تواريخ السفر، اهتماماتك (العمارة، الطبيعة، الطعام، التاريخ…)، وأسلوب سفرك. لا استمارات طويلة — مجرد محادثة.',
    },
  },
  {
    icon: Map,
    en: {
      eyebrow: 'Step 02',
      title: 'Receive a Tailored Iran Experience',
      desc:
        'Based on your conversation, our AI instantly generates a personalised travel plan — including recommended cities, cultural experiences, local guides in your destination, and package options that match your goals and budget.',
    },
    fa: {
      eyebrow: 'گام ۰۲',
      title: 'تجربه‌ای از ایران، خاصِ تو',
      desc:
        'بر اساس گفتگوی تو، هوش مصنوعی فوراً یک برنامه سفر شخصی‌سازی‌شده می‌سازد — شامل شهرهای پیشنهادی، تجربه‌های فرهنگی، راهنماهای محلی در مقصد و پکیج‌هایی متناسب با هدف و بودجه‌ات.',
    },
    ar: {
      eyebrow: 'الخطوة 02',
      title: 'تجربة إيرانية مصممة لك',
      desc:
        'بناءً على محادثتك، يُنشئ الذكاء الاصطناعي على الفور خطة سفر مخصصة — تشمل المدن الموصى بها، التجارب الثقافية، المرشدين المحليين في وجهتك، وباقات تناسب أهدافك وميزانيتك.',
    },
  },
  {
    icon: CheckCircle2,
    en: {
      eyebrow: 'Step 03',
      title: 'Select Your Journey or Guide',
      desc:
        'Browse the AI-curated suggestions sent directly to you. Whether it’s a cultural architecture tour in Isfahan, a desert adventure in Yazd, or a local food experience in Shiraz — click on the option that speaks to you.',
    },
    fa: {
      eyebrow: 'گام ۰۳',
      title: 'سفر یا راهنمای ایده‌آلت را انتخاب کن',
      desc:
        'پیشنهادهای هوشمندی که برایت می‌رسد را مرور کن. چه تور معماری فرهنگی در اصفهان، چه ماجراجویی کویری در یزد، چه تجربه غذای محلی در شیراز — روی گزینه‌ای که با تو حرف می‌زند کلیک کن.',
    },
    ar: {
      eyebrow: 'الخطوة 03',
      title: 'اختر رحلتك أو مرشدك المناسب',
      desc:
        'تصفّح الاقتراحات المنسّقة بالذكاء الاصطناعي التي تصلك. سواء كانت جولة في عمارة أصفهان الثقافية، أو مغامرة صحراوية في يزد، أو تجربة طعام محلية في شيراز — اختر ما يلامس روحك.',
    },
  },
  {
    icon: Calendar,
    en: {
      eyebrow: 'Step 04',
      title: 'Complete Your Booking Effortlessly',
      desc:
        'Once you’ve chosen your experience, complete your registration and travel details in just a few clicks. Our team will confirm your journey and connect you with your local guide. Your authentic Iran adventure begins here.',
    },
    fa: {
      eyebrow: 'گام ۰۴',
      title: 'رزرو راحت، در چند کلیک',
      desc:
        'پس از انتخاب تجربه‌ات، با چند کلیک ثبت‌نام و جزئیات سفر را کامل کن. تیم ما سفرت را تأیید می‌کند و تو را با راهنمای محلی‌ات همراه می‌کند. ماجراجویی اصیل ایرانی‌ات از همین‌جا شروع می‌شود.',
    },
    ar: {
      eyebrow: 'الخطوة 04',
      title: 'أكمل حجزك بسهولة',
      desc:
        'بعد اختيار تجربتك، أكمل تسجيلك وتفاصيل سفرك ببضع نقرات فقط. سيؤكد فريقنا رحلتك ويصلك بمرشدك المحلي. مغامرتك الإيرانية الأصيلة تبدأ من هنا.',
    },
  },
];

export default function HowItWorks() {
  const { lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const heading = {
    eyebrow: lang === 'fa' ? 'چگونه کار می‌کند' : lang === 'ar' ? 'كيف يعمل' : 'How it Works',
    title:   lang === 'fa' ? 'راه ساده‌تری برای کشف ایران' : lang === 'ar' ? 'طريقة أسهل لاكتشاف إيران' : 'An Easier Way to Discover Iran',
    sub:     lang === 'fa'
      ? 'با دستیار سفر هوشمند ما در چند دقیقه برنامه سفر ایده‌آلت را بساز.'
      : lang === 'ar'
      ? 'خطّط رحلتك الإيرانية المثالية في دقائق مع مساعد السفر الذكي.'
      : 'Plan your perfect Iranian journey in minutes with our AI Travel Assistant',
    finalCta: lang === 'fa' ? 'شروع برنامه‌ریزی با هوش مصنوعی' : lang === 'ar' ? 'ابدأ التخطيط مع الذكاء الاصطناعي' : 'Start Planning with AI',
  };

  return (
    <section
      dir={dir}
      className="section-gap relative overflow-hidden bg-navy"
    >
      {/* Subtle carpet texture so it sits next to the existing dark sections */}
      <div className="absolute inset-0 carpet-texture opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 lg:mb-20"
        >
          <p className="font-body text-xs uppercase tracking-[0.25em] text-gold mb-4 flex items-center justify-center gap-3">
            <span className="block w-8 h-px bg-gold/60" />
            {heading.eyebrow}
            <span className="block w-8 h-px bg-gold/60" />
          </p>
          <h2 className="font-heading text-display-sm text-white mb-4">{heading.title}</h2>
          <p className="font-body text-white/60 max-w-xl mx-auto leading-relaxed">
            {heading.sub}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop horizontal connector — dashed gold line across the icon row */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[44px] left-[12.5%] right-[12.5%] h-px"
            style={{
              backgroundImage:
                'linear-gradient(to right, transparent 0, transparent 10px, hsl(var(--gold) / 0.35) 10px, hsl(var(--gold) / 0.35) 18px)',
              backgroundSize: '24px 1px',
            }}
          />

          {/* Mobile vertical connector — dashed gold line down the icon column */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute top-12 bottom-12 start-[27px] w-px"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, transparent 0, transparent 8px, hsl(var(--gold) / 0.35) 8px, hsl(var(--gold) / 0.35) 16px)',
              backgroundSize: '1px 22px',
            }}
          />

          <ol className="relative grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const copy = step[lang] || step.en;
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex lg:flex-col items-start gap-5 lg:gap-0 lg:text-center"
                >
                  {/* Icon + step number */}
                  <div className="relative shrink-0 lg:mx-auto">
                    <div className="relative w-[56px] h-[56px] rounded-2xl bg-gradient-to-br from-gold/25 to-gold/5 border border-gold/40 flex items-center justify-center shadow-[0_0_0_6px_rgba(13,17,23,1)]">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <span className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-gold text-navy text-[11px] font-bold flex items-center justify-center shadow-md">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Copy */}
                  <div className="flex-1 min-w-0 lg:mt-6">
                    <p className="font-body text-[10px] uppercase tracking-[0.22em] text-gold/80 mb-2">
                      {copy.eyebrow}
                    </p>
                    <h3 className="font-heading text-lg lg:text-xl font-semibold text-white leading-tight mb-2.5">
                      {copy.title}
                    </h3>
                    <p className="font-body text-sm text-white/60 leading-relaxed">
                      {copy.desc}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mt-16 lg:mt-20"
        >
          <Link
            to="/ai-assistant"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gold text-navy font-body font-semibold text-sm uppercase tracking-wider hover:bg-gold-light hover:shadow-lg hover:shadow-gold/30 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            {heading.finalCta}
            <Arrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
