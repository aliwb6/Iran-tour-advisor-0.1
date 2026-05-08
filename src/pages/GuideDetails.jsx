import { useParams, Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { 
  Star, Mail, Phone, Instagram, MapPin, Calendar,
  ArrowRight, ArrowLeft, MessageCircle
} from 'lucide-react';
import { getGuideBySlug } from '@/data/guides';
import { tours, TOUR_IMAGES } from '@/data/tours';

export default function GuideDetails() {
  const { slug } = useParams();
  const { t, lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const guide = getGuideBySlug(slug);
  
  if (!guide) {
    return (
      <div dir={dir} className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-foreground mb-4">Guide Not Found</h1>
          <Link to="/guides" className="text-accent hover:underline">{t('view_all')} →</Link>
        </div>
      </div>
    );
  }

  const name = guide.name;
  const city = guide.city[lang] || guide.city.en;
  const bio = guide.bio[lang] || guide.bio.en;
  const specialties = guide.specialties[lang] || guide.specialties.en;
  const languages = guide.languages[lang] || guide.languages.en;
  const experience = guide.experience[lang] || guide.experience.en;
  const relatedTours = tours.filter(tour => guide.relatedTours?.includes(tour.id)).slice(0, 3);

  const cityColors = ['bg-accent/10 text-accent', 'bg-gold/20 text-gold', 'bg-primary/10 text-primary', 'bg-emerald-10 text-emerald-600 dark:text-emerald-400'];

  return (
    <div dir={dir} className="pt-0 pb-20 min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img
          src={guide.coverImage}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Back button */}
        <Link 
          to="/guides" 
          className="absolute top-24 start-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <Arrow className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          {t('back_to_home')}
        </Link>

        {/* Profile overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-end gap-6"
            >
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden shrink-0">
                <img 
                  src={guide.photo} 
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h1 className="font-heading text-4xl sm:text-5xl text-white mb-2">
                    {name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="flex items-center gap-1.5 text-white/80 font-body">
                      <MapPin className="w-4 h-4" />
                      {city}
                    </span>
                    <span className="flex items-center gap-1.5 text-white/80 font-body">
                      <Calendar className="w-4 h-4" />
                      {experience}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent">
                      <Star className="w-4 h-4 text-white fill-white" />
                      <span className="font-body font-semibold text-white">{guide.rating}</span>
                    </div>
                    <span className="font-body text-white/70 text-sm">
                      {guide.reviews} {t('guides_reviews')}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Bio */}
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {lang === 'fa' ? 'معرفی' : lang === 'ar' ? 'Biography' : 'About'}
              </h2>
              <p className="font-body text-foreground/70 leading-relaxed text-lg">
                {bio}
              </p>
            </section>

            {/* Specialties */}
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {t('guides_specialties')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {specialties.map((s, i) => (
                  <span 
                    key={i} 
                    className={`px-4 py-2 rounded-full text-sm font-body font-medium ${cityColors[i % cityColors.length]}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {t('guides_languages')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {languages.map((langItem, i) => (
                  <span 
                    key={i} 
                    className="px-4 py-2 rounded-full text-sm font-body bg-secondary text-foreground"
                  >
                    {langItem}
                  </span>
                ))}
              </div>
            </section>

            {/* Related Tours */}
            {relatedTours.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                  {lang === 'fa' ? 'تورهای مرتبط' : lang === 'ar' ? 'جولات ذات صلة' : 'Related Tours'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedTours.map((tour) => (
                    <Link 
                      key={tour.id}
                      to={`/tours/${tour.slug}`}
                      className="group p-4 rounded-2xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-lg transition-all"
                    >
                      <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3">
                        <img 
                          src={tour.gallery?.[0] || TOUR_IMAGES[tour.id - 1]} 
                          alt={tour.title[lang] || tour.title.en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <h3 className="font-heading text-base font-medium text-foreground group-hover:text-accent transition-colors">
                        {tour.title[lang] || tour.title.en}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        {tour.duration} {t('package_duration')}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                  {lang === 'fa' ? 'ارتباط' : lang === 'ar' ? 'الاتصال' : 'Contact'}
                </h3>
                
                <div className="space-y-4 mb-6">
                  <button className="w-full py-3 rounded-xl bg-accent text-white font-body font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {t('guides_connect')}
                  </button>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-sm text-foreground/70">{guide.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-sm text-foreground/70">{guide.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-sm text-foreground/70">@{guide.instagram}</span>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                  {lang === 'fa' ? 'شبکه‌های اجتماعی' : lang === 'ar' ? 'وسائل التواصل' : 'Social'}
                </h3>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent/20 transition-colors">
                    <Instagram className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}