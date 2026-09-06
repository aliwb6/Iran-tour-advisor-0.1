import { useState } from 'react';
import { BadgeCheck, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/supabaseClient';

const copy = {
  en: {
    title: 'Verified license',
    description: 'This license document has been reviewed and verified by the platform.',
    action: 'View license',
    opening: 'Opening…',
    error: 'The license document could not be opened.',
  },
  fa: {
    title: 'مجوز تأییدشده',
    description: 'این مدرک توسط پلتفرم بررسی و تأیید شده است.',
    action: 'مشاهده مجوز',
    opening: 'در حال باز شدن…',
    error: 'مدرک مجوز باز نشد.',
  },
  ar: {
    title: 'رخصة موثقة',
    description: 'تمت مراجعة هذه الوثيقة والتحقق منها بواسطة المنصة.',
    action: 'عرض الرخصة',
    opening: 'جارٍ الفتح…',
    error: 'تعذر فتح وثيقة الرخصة.',
  },
};

export default function PublicLicenseCard({ profile, lang = 'en', className = '' }) {
  const [opening, setOpening] = useState(false);
  const labels = copy[lang] || copy.en;
  const licensePath = profile?.license_url?.trim();

  if (!profile?.is_approved || profile?.license_status !== 'verified' || !licensePath) {
    return null;
  }

  const openLicense = async () => {
    if (opening) return;
    setOpening(true);
    try {
      if (/^https?:\/\//i.test(licensePath)) {
        window.open(licensePath, '_blank', 'noopener,noreferrer');
        return;
      }

      const { data, error } = await supabase.storage
        .from('licenses')
        .createSignedUrl(licensePath, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error(labels.error);
    } finally {
      setOpening(false);
    }
  };

  return (
    <section className={`${className} p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-semibold text-foreground">{labels.title}</h2>
            <BadgeCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">{labels.description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={openLicense}
        disabled={opening}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-body text-sm font-semibold hover:bg-emerald-500/25 disabled:opacity-50 transition"
      >
        {opening ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
        {opening ? labels.opening : labels.action}
      </button>
    </section>
  );
}
