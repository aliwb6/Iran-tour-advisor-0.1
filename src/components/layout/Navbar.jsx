import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, ArrowRight, LogOut, LayoutDashboard, Shield, User } from 'lucide-react';
import UserDropdown from '@/components/navbar/UserDropdown';

export default function Navbar() {
  const { t, dir } = useI18n();
  const { isAuthenticated, isLoadingAuth, user, profile, logout } = useAuth();
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
    { path: '/guides', label: t('nav_guides') },
    { path: '/ai-assistant', label: t('nav_ai') },
    { path: '/blog', label: t('nav_blog') },
  ];

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === '/';
  const isLight = !scrolled && isHome;

  const fullName = profile?.full_name || user?.user_metadata?.full_name || '';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
  const role = profile?.role || user?.user_metadata?.role;
  const isAdmin = profile?.role === 'admin';
  const isGuideOrAgency = role === 'guide' || role === 'agency';
  const isTourist = role === 'tourist' || role === 'traveler';

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
                  isLight ? 'text-white' : 'text-foreground'
                }`}>Iran Tour Advisor</span>
                <span className="font-body text-[9px] uppercase tracking-[0.18em] text-gold/80">{t('brand_tagline')}</span>
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
                      : isLight
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

              {/* Auth buttons — desktop */}
              {!isLoadingAuth && (
                isAuthenticated ? (
                  <div className="hidden lg:flex items-center gap-1.5">
                    {/* Admin Panel — admin only */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all ${
                          isLight
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-muted/60 text-foreground hover:bg-muted'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {t('nav_admin_panel')}
                      </Link>
                    )}
                    {/* Dashboard — guide/agency only */}
                    {isGuideOrAgency && (
                      <Link
                        to="/dashboard"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all ${
                          isLight
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-muted/60 text-foreground hover:bg-muted'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        {t('nav_dashboard')}
                      </Link>
                    )}

                    {/* Traveler: avatar dropdown with Profile / Bookings / Requests / Settings / Sign out */}
                    {isTourist && <UserDropdown isLight={isLight} />}

                    {/* Admin/guide still need a quick sign-out */}
                    {!isTourist && (
                      <button
                        onClick={() => logout()}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isLight
                            ? 'text-white/70 hover:text-white hover:bg-white/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                        title={t('auth_signout')}
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-2">
                    <Link
                      to="/login"
                      className={`px-4 py-2 rounded-full text-xs font-body font-medium border transition-all ${
                        isLight
                          ? 'border-white/40 text-white hover:bg-white/10'
                          : 'border-border/60 text-foreground hover:bg-muted'
                      }`}
                    >
                      {t('auth_signin')}
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 rounded-full text-xs font-body font-semibold bg-accent text-white hover:bg-accent/90 transition-colors"
                    >
                      {t('auth_signup')}
                    </Link>
                  </div>
                )
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                  isLight
                    ? 'border-white/30 text-white bg-white/10'
                    : 'border-border/60 bg-background/60 text-foreground'
                }`}
                aria-label={t('nav_menu_aria')}
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
            <div className="pt-20 pb-10 px-6">
              {/* Nav links */}
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

              {/* Mobile auth section */}
              {!isLoadingAuth && (
                isAuthenticated ? (
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-muted/50 border border-border/30">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <span className="font-body text-sm font-bold text-white">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-foreground truncate">{fullName || t('common_user')}</p>
                      <p className="font-body text-xs text-muted-foreground capitalize">{role || t('role_traveler')}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/50 font-body text-xs font-medium text-foreground hover:bg-muted/50 transition"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {t('nav_admin_panel')}
                      </Link>
                    )}
                    {isGuideOrAgency && (
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white font-body text-xs font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        {t('nav_dashboard')}
                      </Link>
                    )}
                    {isTourist && (
                      <Link
                        to="/profile"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white font-body text-xs font-medium"
                      >
                        <User className="w-3.5 h-3.5" />
                        {t('nav_profile')}
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-destructive transition"
                      title={t('auth_signout')}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 mb-6">
                    <Link
                      to="/login"
                      className="flex-1 text-center py-3 rounded-xl border border-border/60 font-body text-sm font-medium text-foreground hover:bg-muted/50 transition"
                    >
                      {t('auth_signin')}
                    </Link>
                    <Link
                      to="/signup"
                      className="flex-1 text-center py-3 rounded-xl bg-accent font-body text-sm font-semibold text-white hover:bg-accent/90 transition"
                    >
                      {t('auth_signup')}
                    </Link>
                  </div>
                )
              )}

              {/* Mobile controls */}
              <div className="flex items-center gap-3 pt-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
