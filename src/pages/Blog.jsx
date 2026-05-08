import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';

const BLOG_IMAGES = [
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/7a7bd2ab5_generated_847e20ff.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/ec81100de_generated_93b3e8aa.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/edfc38152_generated_aa7676e0.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/cf89f19da_generated_07d478da.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/f18bb9878_generated_9073fec9.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/1b1289732_generated_4d25fae3.png",
];

const posts = [
  {
    title: { en: "The Art of Persian Tilework: A Journey Through Color", fa: "هنر کاشی‌کاری ایرانی: سفری از میان رنگ‌ها", ar: "فن البلاط الفارسي: رحلة عبر الألوان" },
    excerpt: { en: "Exploring the intricate geometric patterns and vibrant colors that define Iran's architectural identity.", fa: "کاوش در الگوهای هندسی پیچیده و رنگ‌های زنده‌ای که هویت معماری ایران را تعریف می‌کنند.", ar: "استكشاف الأنماط الهندسية المعقدة والألوان النابضة التي تحدد هوية إيران المعمارية." },
    category: { en: "Architecture", fa: "معماری", ar: "العمارة" },
    readTime: 8,
  },
  {
    title: { en: "Inside the Grand Bazaar: Stories of Silk and Spice", fa: "درون بازار بزرگ: داستان‌های ابریشم و ادویه", ar: "داخل البازار الكبير: قصص الحرير والتوابل" },
    excerpt: { en: "A sensory journey through Iran's most iconic bazaars, where centuries of trade continue to thrive.", fa: "سفری حسی در نمادین‌ترین بازارهای ایران، جایی که قرن‌ها تجارت همچنان پابرجاست.", ar: "رحلة حسية عبر أشهر بازارات إيران، حيث تستمر قرون من التجارة." },
    category: { en: "Culture", fa: "فرهنگ", ar: "الثقافة" },
    readTime: 6,
  },
  {
    title: { en: "Persepolis at Dawn: Photographing Ancient Glory", fa: "تخت جمشید در سپیده‌دم: عکاسی از شکوه باستان", ar: "برسبوليس عند الفجر: تصوير المجد القديم" },
    excerpt: { en: "Tips and stories from a golden-hour photography session at Iran's most magnificent ancient site.", fa: "نکات و داستان‌هایی از جلسه عکاسی ساعت طلایی در باشکوه‌ترین اثر باستانی ایران.", ar: "نصائح وقصص من جلسة تصوير الساعة الذهبية في أروع موقع أثري في إيران." },
    category: { en: "Photography", fa: "عکاسی", ar: "التصوير" },
    readTime: 10,
  },
  {
    title: { en: "A Taste of Iran: Saffron, Pomegranate, and Poetry", fa: "طعم ایران: زعفران، انار و شعر", ar: "طعم إيران: الزعفران والرمان والشعر" },
    excerpt: { en: "Discovering how Persian cuisine is an art form that combines flavors, history, and hospitality.", fa: "کشف اینکه چگونه آشپزی ایرانی یک فرم هنری است که طعم‌ها، تاریخ و مهمان‌نوازی را ترکیب می‌کند.", ar: "اكتشاف كيف يجمع المطبخ الفارسي بين النكهات والتاريخ والضيافة." },
    category: { en: "Food", fa: "غذا", ar: "الطعام" },
    readTime: 7,
  },
  {
    title: { en: "Wind Catchers of Yazd: Ancient Air Conditioning", fa: "بادگیرهای یزد: تهویه مطبوع باستانی", ar: "ملاقف يزد: التكييف القديم" },
    excerpt: { en: "How the architects of ancient Iran engineered elegant solutions to desert heat thousands of years ago.", fa: "چگونه معماران ایران باستان هزاران سال پیش راه‌حل‌های زیبایی برای گرمای کویر طراحی کردند.", ar: "كيف ابتكر معماريو إيران القديمة حلولًا أنيقة لحرارة الصحراء منذ آلاف السنين." },
    category: { en: "Architecture", fa: "معماری", ar: "العمارة" },
    readTime: 5,
  },
  {
    title: { en: "Stargazing in the Lut: The World's Darkest Desert", fa: "ستاره‌شناسی در لوت: تاریک‌ترین کویر جهان", ar: "مراقبة النجوم في لوت: أظلم صحراء في العالم" },
    excerpt: { en: "An unforgettable night under the stars in Iran's UNESCO-listed Lut Desert — the hottest place on Earth.", fa: "شبی فراموش‌نشدنی زیر ستاره‌ها در کویر لوت ایران — گرم‌ترین نقطه زمین.", ar: "ليلة لا تُنسى تحت النجوم في صحراء لوت الإيرانية — أكثر الأماكن حرارة على وجه الأرض." },
    category: { en: "Nature", fa: "طبیعت", ar: "الطبيعة" },
    readTime: 9,
  },
];

export default function Blog() {
  const { t, dir, lang } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div dir={dir} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
            {t('blog_title')}
          </h1>
          <p className="font-body text-muted-foreground max-w-xl text-lg">
            {t('blog_subtitle')}
          </p>
        </motion.div>

        {/* Featured Post */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 cursor-pointer"
        >
          <div className="aspect-[4/3] rounded-2xl overflow-hidden">
            <img
              src={BLOG_IMAGES[0]}
              alt={posts[0].title[lang] || posts[0].title.en}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-body text-xs font-medium text-accent uppercase tracking-wider mb-3">
              {posts[0].category[lang] || posts[0].category.en}
            </span>
            <h2 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-4 group-hover:text-accent transition-colors">
              {posts[0].title[lang] || posts[0].title.en}
            </h2>
            <p className="font-body text-foreground/70 leading-relaxed mb-6">
              {posts[0].excerpt[lang] || posts[0].excerpt.en}
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {posts[0].readTime} {t('blog_min_read')}
              </span>
              <span className="flex items-center gap-1.5 font-body text-sm text-accent font-medium">
                {t('blog_read_more')}
                <Arrow className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </motion.article>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <img
                  src={BLOG_IMAGES[(i + 1) % BLOG_IMAGES.length]}
                  alt={post.title[lang] || post.title.en}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="font-body text-xs font-medium text-accent uppercase tracking-wider">
                {post.category[lang] || post.category.en}
              </span>
              <h3 className="font-heading text-xl font-medium text-foreground mt-2 mb-2 group-hover:text-accent transition-colors">
                {post.title[lang] || post.title.en}
              </h3>
              <p className="font-body text-sm text-foreground/60 leading-relaxed mb-3">
                {post.excerpt[lang] || post.excerpt.en}
              </p>
              <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {post.readTime} {t('blog_min_read')}
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}