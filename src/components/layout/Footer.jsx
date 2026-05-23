import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { Compass, Mail, Instagram, Youtube, Twitter } from 'lucide-react';

const EXPLORE = [
  { path: '/tours', key: 'nav_tours' },
  { path: '/guides', key: 'nav_guides' },
  { path: '/agencies', key: 'nav_agencies' },
  { path: '/ai-assistant', key: 'nav_ai' },
];

const COMPANY = [
  { path: '/about', key: 'nav_about' },
  { path: '/blog', key: 'nav_blog' },
];

const CITY_KEYS = ['city_isfahan', 'city_shiraz', 'city_yazd', 'city_tehran', 'city_tabriz', 'city_kerman'];

export default function Footer() {
  const { t, dir } = useI18n();

  return (
    <footer dir={dir} className="bg-navy text-primary-foreground">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="relative w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center">
                <Compass className="w-4 h-4 text-turquoise" />
              </div>
              <div>
                <p className="font-heading text-base font-semibold text-white">Iran Tour Advisor</p>
                <p className="font-body text-[9px] uppercase tracking-[0.18em] text-gold/60">{t('brand_tagline')}</p>
              </div>
            </Link>
            <p className="font-body text-sm text-white/50 leading-relaxed mb-6">
              {t('footer_tagline')}
            </p>
            <div className="flex gap-3">
              {[
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Youtube, label: 'Youtube' },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="w-9 h-9 rounded-full border border-white/15 hover:border-turquoise/50 flex items-center justify-center text-white/40 hover:text-turquoise transition-all duration-300">
                <Icon className="w-4 h-4" />
              </a>
            ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-gold/70 mb-5">{t('footer_explore')}</p>
            <ul className="space-y-3">
              {EXPLORE.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body text-sm text-white/55 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-gold/70 mb-5">
              {t('footer_destinations')}
            </p>
            <ul className="space-y-3">
              {CITY_KEYS.map(cityKey => (
                <li key={cityKey}>
                  <Link to="/tours" className="font-body text-sm text-white/55 hover:text-white transition-colors">
                    {t(cityKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-gold/70 mb-5">{t('footer_connect')}</p>
            <ul className="space-y-3 mb-7">
              {COMPANY.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="font-body text-sm text-white/55 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <p className="font-body text-xs text-white/40 mb-3">
              {t('footer_newsletter')}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('footer_email_placeholder')}
                className="flex-1 bg-white/8 border border-white/15 rounded-full px-4 py-2 text-xs font-body text-white placeholder:text-white/30 focus:outline-none focus:border-turquoise/50 transition-colors"
              />
              <button className="w-9 h-9 rounded-full bg-turquoise flex items-center justify-center shrink-0 hover:bg-turquoise-light transition-colors">
                <Mail className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* City ornament strip */}
        <div className="flex items-center gap-2 text-white/15 text-[10px] font-body uppercase tracking-widest overflow-hidden mb-8">
          {[...CITY_KEYS, ...CITY_KEYS].map((cityKey, i) => (
            <span key={i} className="shrink-0">{t(cityKey)} <span className="text-gold/25">❖</span></span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10">
          <p className="font-body text-xs text-white/35">
            © {new Date().getFullYear()} Iran Tour Advisor. {t('footer_rights')}.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="font-body text-xs text-white/35 hover:text-white/60 transition-colors">{t('footer_privacy')}</a>
            <a href="#" className="font-body text-xs text-white/35 hover:text-white/60 transition-colors">{t('footer_terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}