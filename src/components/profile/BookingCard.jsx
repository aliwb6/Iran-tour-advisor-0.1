import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n.jsx';

const STATUS_STYLES = {
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  pending:   'bg-gold/15 text-gold border-gold/30',
  completed: 'bg-accent/15 text-accent border-accent/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
};

const STATUS_LABELS = {
  en: { confirmed: 'Confirmed', pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled' },
  fa: { confirmed: 'تایید شده', pending: 'در انتظار', completed: 'انجام شده', cancelled: 'لغو شده' },
  ar: { confirmed: 'مؤكد', pending: 'قيد الانتظار', completed: 'مكتمل', cancelled: 'ملغى' },
};

export default function BookingCard({ booking }) {
  const { lang, dir } = useI18n();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const status = booking.status || 'pending';
  const label = (STATUS_LABELS[lang] || STATUS_LABELS.en)[status] || status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl overflow-hidden hover:border-gold/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500"
    >
      <div className="aspect-[16/10] overflow-hidden bg-navy relative">
        {booking.image ? (
          <img
            src={booking.image}
            alt={booking.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy via-navy-light to-accent/20" />
        )}
        <div className="absolute top-4 end-4">
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
            {label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {booking.title}
        </h3>

        <div className="space-y-2 mb-4">
          {booking.destination && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>{booking.destination}</span>
            </div>
          )}
          {(booking.startDate || booking.endDate) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>
                {booking.startDate}{booking.endDate ? ` — ${booking.endDate}` : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          {booking.price != null && (
            <p className="font-heading text-xl font-bold text-gold">
              ${Number(booking.price).toLocaleString()}
            </p>
          )}
          <Link
            to={booking.detailsUrl || '#'}
            className="ms-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition group/btn"
          >
            {lang === 'fa' ? 'جزئیات' : lang === 'ar' ? 'التفاصيل' : 'View Details'}
            <Arrow className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
