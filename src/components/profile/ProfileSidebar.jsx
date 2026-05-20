import { NavLink } from 'react-router-dom';
import { Settings, Lock, Bell } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';

// Left sidebar for /profile/settings — switches between General / Privacy /
// Notifications. The active tab is driven by the parent via a `tab` prop +
// `onTabChange` callback (so the sidebar can sit next to a single settings
// component that reads the tab from its own state).
export default function ProfileSidebar({ tab, onTabChange }) {
  const { lang } = useI18n();

  const items = [
    { id: 'general',       icon: Settings, label: lang === 'fa' ? 'عمومی' : lang === 'ar' ? 'عام' : 'General' },
    { id: 'privacy',       icon: Lock,     label: lang === 'fa' ? 'حریم خصوصی' : lang === 'ar' ? 'الخصوصية' : 'Privacy' },
    { id: 'notifications', icon: Bell,     label: lang === 'fa' ? 'اعلان‌ها' : lang === 'ar' ? 'الإشعارات' : 'Notifications' },
  ];

  return (
    <aside className="w-full lg:w-64 lg:flex-shrink-0">
      <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-3 sticky top-24">
        <p className="px-3 pt-2 pb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          {lang === 'fa' ? 'تنظیمات' : lang === 'ar' ? 'الإعدادات' : 'Settings'}
        </p>
        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {items.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`relative flex-shrink-0 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="profile-tab-pill"
                    className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold"
                  />
                )}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick links to the other profile areas */}
        <div className="hidden lg:block mt-4 pt-4 border-t border-border/30 px-1">
          <div className="space-y-1">
            <NavLink
              to="/profile"
              end
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-xs ${
                  isActive ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              ← {lang === 'fa' ? 'بازگشت به پروفایل' : lang === 'ar' ? 'العودة إلى الملف الشخصي' : 'Back to Profile'}
            </NavLink>
            <NavLink
              to="/profile/bookings"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-xs ${
                  isActive ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {lang === 'fa' ? 'رزروهای من' : lang === 'ar' ? 'حجوزاتي' : 'My Bookings'}
            </NavLink>
            <NavLink
              to="/profile/requests"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-xs ${
                  isActive ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {lang === 'fa' ? 'درخواست‌های من' : lang === 'ar' ? 'طلباتي' : 'My Requests'}
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}
