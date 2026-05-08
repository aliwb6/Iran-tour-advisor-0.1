import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const { t, dir } = useI18n();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { path: '/tours', label: t('nav_tours') },
    { path: '/destinations', label: t('nav_destinations') },
    { path: '/guides', label: t('nav_guides') },
    { path: '/custom-trip', label: t('nav_custom') },
    { path: '/ai-assistant', label: t('nav_ai') },
    { path: '/about', label: t('nav_about') },
    { path: '/blog', label: t('nav_blog') },
  ];

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === '/';

  return (
    <>
      <motion.nav
        dir={dir}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/85 backdrop-blur-2xl border-b border-border/40 shadow-warm py-0'
            : isHome ? 'bg-transparent py-2' : 'bg-background/60 backdrop-blur-xl py-1'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-[70px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full bg-accent/15 group-hover:bg-accent/25 transition-colors" />
                <div className="absolute inset-0 rounded-full border border-gold/50 group-hover:border-gold transition-colors" />
                <Compass className="absolute inset-0 m-auto w-4 h-4 text-accent" />
              </div>
              <div className="flex flex-col leading-none">
                <span className={`font-heading text-base font-semibold tracking-wide transition-colors ${
                  !scrolled && isHome ? 'text-white' : 'text-foreground'
                }`}>Iran Soul Tours</span>
                <span className="font-body text-[9px] uppercase tracking-[0.18em] text-gold/80">Premium Experiences</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3.5 py-2 text-[13px] font-body font-medium rounded-lg transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-accent'
                      : !scrolled && isHome
                        ? 'text-white/80 hover:text-white'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <Link
                to="/custom-trip"
                className={`hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body font-semibold uppercase tracking-wider transition-all duration-300 ${
                  !scrolled && isHome
                    ? 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
                    : 'bg-accent text-white hover:bg-accent/90'
                }`}
              >
                {t('hero_cta_custom')}
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                  !scrolled && isHome
                    ? 'border-white/30 text-white bg-white/10'
                    : 'border-border/60 bg-background/60 text-foreground'
                }`}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            dir={dir}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-background/97 backdrop-blur-2xl lg:hidden overflow-y-auto"
          >
            {/* Carpet border top */}
            <div className="absolute top-0 inset-x-0 h-0.5 carpet-border" />

            <div className="pt-20 pb-10 px-6">
              {/* Links */}
              <div className="space-y-1 mb-8">
                {[{ path: '/', label: t('nav_home') }, ...navLinks].map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center justify-between py-4 border-b border-border/20 group ${
                        isActive(link.path) ? 'text-accent' : 'text-foreground'
                      }`}
                    >
                      <span className="font-heading text-2xl font-light">{link.label}</span>
                      <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${
                        dir === 'rtl' ? 'rotate-180' : ''
                      } ${isActive(link.path) ? 'opacity-100 text-accent' : ''}`} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile controls */}
              <div className="flex items-center gap-3 pt-2">
                <ThemeToggle />
                <LanguageSwitcher />
                <Link
                  to="/custom-trip"
                  className="ms-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-body font-medium"
                >
                  {t('hero_cta_custom')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}