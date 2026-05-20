// Structured catalogue for tour "What's Included" / "Not Included" selections.
//
// Tours store these as `text[]` arrays of *slugs* on the DB
// (`tours.included` and `tours.excluded`). The slug is the stable key — the
// dashboard form writes slugs, the public detail page reads them back and
// looks up a localised label here at render time.
//
// New options can be added without DB changes. Unknown slugs fall through to
// the lookup helper's raw-string fallback so legacy free-text data still
// renders something.

const INCLUDED_GROUPS = [
  {
    id: 'accommodation',
    label: { en: 'Accommodation', fa: 'اقامت', ar: 'الإقامة' },
    items: [
      // Hotel is special-cased in the form: it opens a star sub-select that
      // writes one of the four hotel_*star slugs below.
      { slug: 'hotel',           en: 'Hotel accommodation',     fa: 'اقامت در هتل',          ar: 'إقامة فندقية',          hasStars: true },
      { slug: 'hostel',          en: 'Hostel / Guesthouse',     fa: 'هاستل / مهمان‌سرا',     ar: 'نزل / بيت ضيافة' },
      { slug: 'eco_lodge',       en: 'Traditional house (Eco-lodge)', fa: 'خانه سنتی (اقامتگاه بوم‌گردی)', ar: 'منزل تقليدي (نزل بيئي)' },
    ],
  },
  {
    id: 'transportation',
    label: { en: 'Transportation', fa: 'حمل و نقل', ar: 'النقل' },
    items: [
      { slug: 'airport_transfer', en: 'Airport transfer',       fa: 'ترانسفر فرودگاهی',     ar: 'النقل من المطار' },
      { slug: 'private_car',      en: 'Private car / van',       fa: 'خودرو / ون اختصاصی',   ar: 'سيارة / فان خاص' },
      { slug: 'public_transit',   en: 'Public transportation',   fa: 'حمل‌ونقل عمومی',        ar: 'النقل العام' },
      { slug: 'bus_intercity',    en: 'Bus (intercity)',         fa: 'اتوبوس (بین‌شهری)',     ar: 'حافلة (بين المدن)' },
      { slug: 'train',            en: 'Train',                   fa: 'قطار',                  ar: 'قطار' },
      { slug: 'domestic_flight',  en: 'Domestic flight',         fa: 'پرواز داخلی',           ar: 'رحلة داخلية' },
    ],
  },
  {
    id: 'meals',
    label: { en: 'Meals', fa: 'وعده‌های غذایی', ar: 'الوجبات' },
    items: [
      { slug: 'breakfast',  en: 'Breakfast',           fa: 'صبحانه',         ar: 'الإفطار' },
      { slug: 'lunch',      en: 'Lunch',               fa: 'ناهار',          ar: 'الغداء' },
      { slug: 'dinner',     en: 'Dinner',              fa: 'شام',            ar: 'العشاء' },
      { slug: 'all_meals',  en: 'All meals included',  fa: 'تمام وعده‌های غذایی', ar: 'جميع الوجبات' },
    ],
  },
  {
    id: 'other',
    label: { en: 'Other', fa: 'سایر', ar: 'أخرى' },
    items: [
      { slug: 'tour_guide_en',   en: 'Tour guide (English speaking)', fa: 'راهنمای انگلیسی‌زبان', ar: 'مرشد سياحي (يتحدث الإنجليزية)' },
      { slug: 'entrance_fees',   en: 'Entrance fees',                 fa: 'هزینه ورودی‌ها',         ar: 'رسوم الدخول' },
      { slug: 'travel_insurance',en: 'Travel insurance',              fa: 'بیمه سفر',               ar: 'تأمين السفر' },
      { slug: 'sim_internet',    en: 'SIM card / Internet',           fa: 'سیم‌کارت / اینترنت',     ar: 'شريحة SIM / إنترنت' },
    ],
  },
];

const HOTEL_STAR_LEVELS = [2, 3, 4, 5];

// Star variants are auto-derived from the hotel base so we don't repeat strings.
const hotelStarLabels = (stars) => ({
  slug: `hotel_${stars}star`,
  en: `${stars}★ Hotel accommodation`,
  fa: `اقامت در هتل ${stars}★`,
  ar: `إقامة فندقية ${stars}★`,
  parent: 'hotel',
  stars,
});

const NOT_INCLUDED_GROUPS = [
  {
    id: 'not_included',
    label: { en: 'Not Included', fa: 'شامل نمی‌شود', ar: 'غير مشمول' },
    items: [
      { slug: 'intl_flights',         en: 'International flights',       fa: 'پروازهای بین‌المللی',     ar: 'الرحلات الدولية' },
      { slug: 'iran_visa_fee',        en: 'Iran visa fee',               fa: 'هزینه ویزای ایران',        ar: 'رسوم تأشيرة إيران' },
      { slug: 'personal_expenses',    en: 'Personal expenses',           fa: 'هزینه‌های شخصی',           ar: 'المصاريف الشخصية' },
      { slug: 'tips',                 en: 'Tips & gratuities',            fa: 'انعام و پاداش',            ar: 'الإكراميات' },
      { slug: 'travel_insurance_x',   en: 'Travel insurance',             fa: 'بیمه سفر',                  ar: 'تأمين السفر' },
      { slug: 'meals_x',              en: 'Meals (if not in included)',   fa: 'وعده‌های غذایی (در صورت عدم شمول)', ar: 'الوجبات (إذا لم تكن مشمولة)' },
      { slug: 'optional_activities',  en: 'Optional activities',          fa: 'فعالیت‌های اختیاری',        ar: 'الأنشطة الاختيارية' },
    ],
  },
];

// Flat slug -> item lookup. Includes auto-derived hotel star variants so
// lookupLabel('hotel_4star', 'en') resolves correctly on the detail page.
const buildSlugIndex = () => {
  const index = new Map();
  for (const group of [...INCLUDED_GROUPS, ...NOT_INCLUDED_GROUPS]) {
    for (const item of group.items) {
      index.set(item.slug, item);
    }
  }
  for (const stars of HOTEL_STAR_LEVELS) {
    const item = hotelStarLabels(stars);
    index.set(item.slug, item);
  }
  return index;
};

const SLUG_INDEX = buildSlugIndex();

export { INCLUDED_GROUPS, NOT_INCLUDED_GROUPS, HOTEL_STAR_LEVELS, hotelStarLabels };

/**
 * Resolve a slug into a localised display label. Unknown slugs fall back to
 * the raw value so legacy free-text rows still render something readable.
 */
export function lookupInclusionLabel(slug, lang = 'en') {
  if (!slug) return '';
  const entry = SLUG_INDEX.get(slug);
  if (entry) return entry[lang] || entry.en || slug;
  return slug; // legacy free-text fallback
}
