import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import TourFilters from '@/components/tours/TourFilters';
import TourCard from '@/components/tours/TourCard';

const TOUR_IMAGES = [
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/67ecc93d7_generated_d105795a.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/cce446b52_generated_d017c773.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/1b1289732_generated_4d25fae3.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/ec81100de_generated_93b3e8aa.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/edfc38152_generated_aa7676e0.png",
  "https://media.base44.com/images/public/69fddcfab0730c36bda3631e/cf89f19da_generated_07d478da.png",
];

const tours = [
  {
    id: 1,
    title: { en: "Persian Jewels", fa: "جواهرات ایران", ar: "جواهر فارس" },
    desc: { en: "Journey through Iran's most magnificent cities — Isfahan's turquoise domes, Shiraz's poetic gardens, and Yazd's ancient wind catchers.", fa: "سفر از میان باشکوه‌ترین شهرهای ایران — گنبدهای فیروزه‌ای اصفهان، باغ‌های شاعرانه شیراز و بادگیرهای کهن یزد.", ar: "رحلة عبر أروع مدن إيران — قباب أصفهان الفيروزية وحدائق شيراز الشعرية وملاقف يزد القديمة." },
    cities: { en: "Isfahan · Shiraz · Yazd", fa: "اصفهان · شیراز · یزد", ar: "أصفهان · شيراز · يزد" },
    duration: 10, cityCount: 3, cultural: "high", difficulty: "easy",
    purpose: "leisure", theme: "culture", priceFrom: 1800,
    highlights: { en: ["Naqsh-e Jahan Square", "Nasir al-Mulk Mosque", "Persepolis", "Yazd Old Town"], fa: ["میدان نقش جهان", "مسجد نصیرالملک", "تخت جمشید", "بافت قدیم یزد"], ar: ["ميدان نقش جهان", "مسجد نصير الملك", "برسبوليس", "مدينة يزد القديمة"] },
  },
  {
    id: 2,
    title: { en: "Desert Whispers", fa: "نجوای کویر", ar: "همسات الصحراء" },
    desc: { en: "An extraordinary adventure through Iran's vast deserts — from the star-lit nights of Lut to the ancient caravanserais along the Silk Road.", fa: "ماجراجویی خارق‌العاده در کویرهای پهناور ایران — از شب‌های پرستاره لوت تا کاروانسراهای کهن جاده ابریشم.", ar: "مغامرة استثنائية عبر صحاري إيران الشاسعة — من ليالي لوت المرصعة بالنجوم إلى خانات طريق الحرير القديمة." },
    cities: { en: "Kerman · Lut Desert · Yazd", fa: "کرمان · کویر لوت · یزد", ar: "كرمان · صحراء لوت · يزد" },
    duration: 7, cityCount: 3, cultural: "medium", difficulty: "challenging",
    purpose: "leisure", theme: "desert", priceFrom: 1200,
    highlights: { en: ["Lut Desert Camping", "Kaluts Formation", "Meybod Caravanserai", "Star Photography"], fa: ["کمپ کویر لوت", "کلوت‌ها", "کاروانسرای میبد", "عکاسی ستاره‌ها"], ar: ["تخييم صحراء لوت", "تكوينات كلوت", "خان ميبد", "تصوير النجوم"] },
  },
  {
    id: 3,
    title: { en: "Silk Road Heritage", fa: "میراث جاده ابریشم", ar: "تراث طريق الحرير" },
    desc: { en: "Trace the legendary Silk Road through Azerbaijan province — from Tabriz's historic bazaar to the cave dwellings of Kandovan.", fa: "ردپای افسانه‌ای جاده ابریشم در آذربایجان — از بازار تاریخی تبریز تا خانه‌های صخره‌ای کندوان.", ar: "تتبع طريق الحرير الأسطوري عبر أذربيجان — من بازار تبريز التاريخي إلى مساكن كندوان الصخرية." },
    cities: { en: "Tehran · Tabriz · Kandovan", fa: "تهران · تبریز · کندوان", ar: "طهران · تبريز · كندوان" },
    duration: 12, cityCount: 4, cultural: "high", difficulty: "moderate",
    purpose: "research", theme: "history", priceFrom: 2400,
    highlights: { en: ["Tabriz Grand Bazaar", "Kandovan Village", "El Goli Park", "Blue Mosque"], fa: ["بازار بزرگ تبریز", "روستای کندوان", "عینالی", "مسجد کبود"], ar: ["بازار تبريز الكبير", "قرية كندوان", "حديقة إل غولي", "المسجد الأزرق"] },
  },
  {
    id: 4,
    title: { en: "Culinary Odyssey", fa: "اودیسه آشپزی", ar: "أوديسة الطهي" },
    desc: { en: "A gastronomic journey through Iran's diverse culinary traditions — from saffron-infused Isfahan dishes to the fresh herbs of the Caspian shore.", fa: "سفری خوراکی در سنت‌های متنوع آشپزی ایران — از غذاهای زعفرانی اصفهان تا سبزیجات تازه ساحل خزر.", ar: "رحلة ذواقة عبر تقاليد إيران الطهوية المتنوعة — من أطباق أصفهان بالزعفران إلى أعشاب ساحل بحر قزوين." },
    cities: { en: "Tehran · Isfahan · Rasht", fa: "تهران · اصفهان · رشت", ar: "طهران · أصفهان · رشت" },
    duration: 8, cityCount: 3, cultural: "high", difficulty: "easy",
    purpose: "leisure", theme: "food", priceFrom: 1500,
    highlights: { en: ["Cooking Classes", "Bazaar Food Tour", "Tea Ceremonies", "Local Home Dining"], fa: ["کلاس آشپزی", "تور غذای بازار", "آداب چای", "غذا در خانه محلی"], ar: ["دروس الطبخ", "جولة طعام البازار", "حفل الشاي", "العشاء المنزلي"] },
  },
  {
    id: 5,
    title: { en: "Ancient Persia", fa: "ایران باستان", ar: "بلاد فارس القديمة" },
    desc: { en: "Walk through millennia of history — from Persepolis to the Sassanid reliefs, exploring the cradle of one of humanity's greatest civilizations.", fa: "قدم زدن در هزاره‌های تاریخ — از تخت جمشید تا نقش‌برجسته‌های ساسانی، کاوش در گهواره یکی از بزرگ‌ترین تمدن‌ها.", ar: "امشِ عبر آلاف السنين — من برسبوليس إلى نقوش الساسانيين، استكشاف مهد واحدة من أعظم الحضارات." },
    cities: { en: "Shiraz · Pasargadae · Bisotun", fa: "شیراز · پاسارگاد · بیستون", ar: "شيراز · باسارغاد · بيستون" },
    duration: 9, cityCount: 4, cultural: "high", difficulty: "moderate",
    purpose: "research", theme: "history", priceFrom: 2100,
    highlights: { en: ["Persepolis", "Tomb of Cyrus", "Bisotun Inscription", "Naqsh-e Rostam"], fa: ["تخت جمشید", "آرامگاه کوروش", "کتیبه بیستون", "نقش رستم"], ar: ["برسبوليس", "قبر كورش", "نقش بيستون", "نقش رستم"] },
  },
  {
    id: 6,
    title: { en: "Photographer's Dream", fa: "رویای عکاس", ar: "حلم المصور" },
    desc: { en: "A curated photography expedition through Iran's most photogenic locations — golden light, ancient textures, and human stories.", fa: "اکسپدیشن عکاسی در فتوژنیک‌ترین مکان‌های ایران — نور طلایی، بافت‌های کهن و داستان‌های انسانی.", ar: "رحلة تصوير منسقة عبر أكثر مواقع إيران تصويرية — الضوء الذهبي والقوام القديم والقصص الإنسانية." },
    cities: { en: "Isfahan · Yazd · Abyaneh", fa: "اصفهان · یزد · ابیانه", ar: "أصفهان · يزد · أبيانه" },
    duration: 11, cityCount: 4, cultural: "medium", difficulty: "moderate",
    purpose: "work", theme: "photography", priceFrom: 2200,
    highlights: { en: ["Golden Hour Shoots", "Night Photography", "Portrait Sessions", "Architectural Details"], fa: ["عکاسی ساعت طلایی", "عکاسی شب", "پرتره", "جزئیات معماری"], ar: ["تصوير الساعة الذهبية", "التصوير الليلي", "جلسات بورتريه", "تفاصيل معمارية"] },
  },
  {
    id: 7,
    title: { en: "Sacred Iran", fa: "ایران معنوی", ar: "إيران الروحانية" },
    desc: { en: "A deeply spiritual journey through Iran's holiest shrines and sacred places, from Mashhad to Qom and the Sufi lodges of Shiraz.", fa: "سفری عمیقاً معنوی از میان مقدس‌ترین اماکن ایران، از مشهد تا قم و خانقاه‌های صوفی شیراز.", ar: "رحلة روحانية عميقة عبر أقدس بقاع إيران، من مشهد إلى قم وتكايا الصوفيين في شيراز." },
    cities: { en: "Mashhad · Qom · Shiraz", fa: "مشهد · قم · شیراز", ar: "مشهد · قم · شيراز" },
    duration: 8, cityCount: 3, cultural: "high", difficulty: "easy",
    purpose: "spiritual", theme: "culture", priceFrom: 1400,
    highlights: { en: ["Imam Reza Shrine", "Fatima Masumeh Shrine", "Shah Cheragh", "Sufi Ritual"], fa: ["حرم امام رضا", "حرم حضرت معصومه", "شاه‌چراغ", "مراسم صوفیانه"], ar: ["ضريح الإمام الرضا", "ضريح السيدة المعصومة", "شاه شراغ", "الطقوس الصوفية"] },
  },
  {
    id: 8,
    title: { en: "Business & Culture", fa: "کسب‌وکار و فرهنگ", ar: "أعمال وثقافة" },
    desc: { en: "A premium itinerary combining key business hubs with cultural immersion — ideal for professionals seeking to build relationships in Iran.", fa: "برنامه‌ای ویژه ترکیب مراکز اصلی کسب‌وکار با غوطه‌وری فرهنگی — ایده‌آل برای متخصصانی که می‌خواهند در ایران روابط تجاری بسازند.", ar: "برنامج فاخر يجمع بين المراكز التجارية الرئيسية والانغماس الثقافي — مثالي للمحترفين الساعين لبناء علاقات في إيران." },
    cities: { en: "Tehran · Isfahan · Tabriz", fa: "تهران · اصفهان · تبریز", ar: "طهران · أصفهان · تبريز" },
    duration: 6, cityCount: 3, cultural: "medium", difficulty: "easy",
    purpose: "work", theme: "culture", priceFrom: 2800,
    highlights: { en: ["Tehran Business District", "Trade Meetings Arrangement", "Cultural Dinners", "VIP Transport"], fa: ["منطقه تجاری تهران", "ترتیب جلسات تجاری", "شام‌های فرهنگی", "حمل‌ونقل VIP"], ar: ["منطقة أعمال طهران", "ترتيب اجتماعات تجارية", "عشاءات ثقافية", "مواصلات VIP"] },
  },
];

const DEFAULT_FILTERS = { purpose: 'all', theme: 'all', duration: 'all' };

export default function Tours() {
  const { t, dir, lang } = useI18n();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return tours.filter(tour => {
      if (filters.purpose !== 'all' && tour.purpose !== filters.purpose) return false;
      if (filters.theme !== 'all' && tour.theme !== filters.theme) return false;
      if (filters.duration !== 'all') {
        if (filters.duration === 'short' && tour.duration > 7) return false;
        if (filters.duration === 'medium' && (tour.duration < 8 || tour.duration > 11)) return false;
        if (filters.duration === 'long' && tour.duration < 12) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div dir={dir} className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Header with Persian carpet border motif */}
        <div className="relative mb-14">
          {/* Top Persian ornamental border */}
          <div className="absolute -top-4 inset-x-0 h-1 overflow-hidden">
            <div className="w-full h-full"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--accent)) 0px, hsl(var(--accent)) 4px, transparent 4px, transparent 12px, hsl(var(--gold)) 12px, hsl(var(--gold)) 14px, transparent 14px, transparent 20px)',
                opacity: 0.5
              }} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="pt-6"
          >
            {/* Decorative label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-accent text-xl">❖</span>
              <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {lang === 'fa' ? 'پکیج‌های سفر' : lang === 'ar' ? 'باقات السفر' : 'Tour Packages'}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground mb-4">
              {t('packages_title')}
            </h1>
            <p className="font-body text-muted-foreground max-w-xl text-base leading-relaxed">
              {t('packages_subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <TourFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />

        {/* Tour Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              {/* Persian carpet medallion decoration */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-border flex items-center justify-center">
                <span className="text-3xl text-accent/40">❋</span>
              </div>
              <p className="font-heading text-2xl text-muted-foreground font-light">
                {lang === 'fa' ? 'توری با این فیلترها یافت نشد' : lang === 'ar' ? 'لا توجد رحلات بهذه المعايير' : 'No tours match these filters'}
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-4 text-sm font-body text-accent hover:underline"
              >
                {lang === 'fa' ? 'پاک کردن فیلترها' : lang === 'ar' ? 'مسح الفلاتر' : 'Clear all filters'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
            >
              {filtered.map((tour, i) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  image={TOUR_IMAGES[(tour.id - 1) % TOUR_IMAGES.length]}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Persian carpet border */}
        {filtered.length > 0 && (
          <div className="mt-16 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-accent/40 text-2xl">✦ ❋ ✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}