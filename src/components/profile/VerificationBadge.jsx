import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n.jsx';

// Compact verified / unverified pill used in the profile hero.
//   <VerificationBadge icon={Phone} label="Phone" verified={true} />
export default function VerificationBadge({ icon: Icon, label, verified }) {
  const { lang } = useI18n();
  const status = verified
    ? (lang === 'fa' ? 'تایید شده' : lang === 'ar' ? 'موثق' : 'Verified')
    : (lang === 'fa' ? 'تایید نشده' : lang === 'ar' ? 'غير موثق' : 'Unverified');

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-body backdrop-blur-md transition-all ${
        verified
          ? 'bg-emerald-500/10 border-emerald-400/40 text-emerald-300'
          : 'bg-white/[0.04] border-white/15 text-white/55'
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span className="font-medium text-white/85">{label}</span>
      <span className="opacity-70">·</span>
      {verified ? (
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          {status}
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          {status}
        </span>
      )}
    </div>
  );
}
