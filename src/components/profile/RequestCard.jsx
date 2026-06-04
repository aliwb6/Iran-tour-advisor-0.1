import { motion } from 'framer-motion';
import {
  MapPin, Users, Baby,
  Car, Hotel, Sparkles, Clock, Pencil,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';

const STATUS_STYLES = {
  waiting:   'bg-gold/15 text-gold border-gold/30',
  received:  'bg-accent/15 text-accent border-accent/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  expired:   'bg-muted/40 text-muted-foreground border-border/40',
};

const STATUS_LABELS = {
  en: {
    waiting: 'Waiting For Proposals',
    received: 'Proposals Received',
    completed: 'Completed',
    expired: 'Expired',
  },
  fa: {
    waiting: 'در انتظار پیشنهاد',
    received: 'پیشنهاد دریافت شد',
    completed: 'انجام شده',
    expired: 'منقضی',
  },
  ar: {
    waiting: 'بانتظار العروض',
    received: 'تم استلام العروض',
    completed: 'مكتمل',
    expired: 'منتهي',
  },
};

function PrefCell({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/50 border border-border/30">
      <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-0.5">{label}</p>
        <p className="text-xs font-medium text-foreground truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function RequestCard({ request }) {
  const { t, lang, dir } = useI18n();
  const navigate = useNavigate();
  const status = request.status || 'waiting';
  const statusLabel = (STATUS_LABELS[lang] || STATUS_LABELS.en)[status] || status;
  const proposalCount = request.proposals_count ?? 0;
  const canEdit = !['booked', 'closed'].includes(status);

  const labels = {
    transportation: lang === 'fa' ? 'حمل‌ونقل' : lang === 'ar' ? 'المواصلات' : 'Transportation',
    accommodation:  lang === 'fa' ? 'اقامت'    : lang === 'ar' ? 'الإقامة'   : 'Accommodation',
    tourType:       lang === 'fa' ? 'نوع تور'  : lang === 'ar' ? 'نوع الجولة' : 'Tour Type',
    requirements:   lang === 'fa' ? 'یادداشت‌ها' : lang === 'ar' ? 'الملاحظات' : 'Requirements',
    adults:         lang === 'fa' ? 'بزرگسال' : lang === 'ar' ? 'بالغ' : 'Adults',
    children:       lang === 'fa' ? 'کودک' : lang === 'ar' ? 'طفل' : 'Children',
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl p-5 sm:p-6 hover:border-gold/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500"
    >
      {/* Title */}
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-heading text-xl sm:text-2xl font-semibold text-foreground leading-tight">
            {request.title}
          </h3>
          {request.destination && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-gold" />
              {request.destination}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {request.adults != null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/60 border border-border/40 text-xs text-foreground">
              <Users className="w-3 h-3 text-accent" />
              {request.adults} {labels.adults}
            </span>
          )}
          {request.children != null && request.children > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/60 border border-border/40 text-xs text-foreground">
              <Baby className="w-3 h-3 text-accent" />
              {request.children} {labels.children}
            </span>
          )}
        </div>
      </header>

      {/* Timeline */}
      {(request.startDate || request.endDate) && (
        <div className="my-5">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-end">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                {lang === 'fa' ? 'شروع' : lang === 'ar' ? 'البداية' : 'Start'}
              </p>
              <p className="text-sm font-semibold text-foreground" dir="ltr">{request.startDate || '—'}</p>
              {request.startTime && <p className="text-[10px] text-muted-foreground" dir="ltr">{request.startTime}</p>}
            </div>
            <div className="relative flex-1 h-1.5 rounded-full bg-background overflow-hidden">
              <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-gold via-accent to-gold rounded-full" />
              <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gold bg-background rounded-full p-0.5 border border-gold" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                {lang === 'fa' ? 'پایان' : lang === 'ar' ? 'النهاية' : 'End'}
              </p>
              <p className="text-sm font-semibold text-foreground" dir="ltr">{request.endDate || '—'}</p>
              {request.endTime && <p className="text-[10px] text-muted-foreground" dir="ltr">{request.endTime}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Preferences grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        <PrefCell icon={Car}       label={labels.transportation} value={request.transportation} />
        <PrefCell icon={Hotel}     label={labels.accommodation}  value={request.accommodation} />
        <PrefCell icon={Sparkles}  label={labels.tourType}       value={request.tourType} />
      </div>

      {/* Requirements preview */}
      {request.requirements && (
        <div className="p-3.5 rounded-xl bg-background/40 border border-border/30 mb-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-1.5">
            {labels.requirements}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{request.requirements}</p>
        </div>
      )}

      {/* Footer: status + three action buttons */}
      <footer className="flex items-center justify-between gap-3 pt-4 border-t border-border/30 flex-wrap">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 ${STATUS_STYLES[status] || STATUS_STYLES.waiting}`}>
          {statusLabel}
        </span>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* 1. See Details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/profile/requests/${request.id}?tab=details`)}
          >
            {t('see_details')}
          </Button>

          {/* 2. Edit — hidden once booked/closed */}
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/profile/requests/${request.id}?tab=details&edit=true`)}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t('edit_trip')}
            </Button>
          )}

          {/* 3. View Proposals / Awaiting */}
          {proposalCount > 0 ? (
            <Button
              size="sm"
              className="bg-teal-500 hover:bg-teal-600 text-white"
              onClick={() => navigate(`/profile/requests/${request.id}?tab=proposals`)}
            >
              {t('view_proposals_count', { count: proposalCount })}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground px-1">{t('awaiting_proposals')}</span>
          )}
        </div>
      </footer>
    </motion.article>
  );
}
