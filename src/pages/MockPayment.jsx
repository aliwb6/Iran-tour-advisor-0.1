import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ShieldCheck, Info, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n.jsx';

function formatPrice(value, currency = 'USD') {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d) {
  return d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
}

export default function MockPayment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { t } = useI18n();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
  }, [isLoadingAuth, isAuthenticated, navigate]);

  useEffect(() => {
    if (!bookingId || !user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('tourist_id', user.id)
        .single();

      if (!cancelled) {
        if (error || !data) {
          toast.error('Booking not found');
          navigate('/profile/requests');
          return;
        }
        setBooking(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId, user?.id, navigate]);

  const handlePay = async () => {
    if (!booking || !user?.id) return;
    setPaying(true);
    try {
      const { error: payErr } = await supabase.from('payments').insert({
        booking_id:        booking.id,
        tourist_id:        user.id,
        guide_id:          booking.guide_id,
        total_amount:      booking.price,
        currency:          booking.currency || 'USD',
        commission_rate:   0.15,
        commission_amount: booking.commission_amount,
        guide_payout:      booking.guide_payout,
        deposit_percentage: 0.20,
        deposit_amount:    booking.deposit_amount,
        balance_due:       booking.balance_due,
        status:            'paid',
        payment_method:    'mock',
        paid_at:           new Date().toISOString(),
      });
      if (payErr) throw payErr;

      const { error: bErr } = await supabase
        .from('bookings')
        .update({ status: 'confirmed', contact_released: true })
        .eq('id', booking.id);
      if (bErr) throw bErr;

      toast.success(t('payment_successful'));
      navigate(`/profile/bookings/${booking.id}`);
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }
  if (!booking) return null;

  const currency = booking.currency || 'USD';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('confirm_your_booking')}
          </h1>
          <p className="text-gray-500 mb-6">
            {booking.tour_title}
          </p>

          {/* Summary card */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {booking.tour_title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Dates</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Travelers</p>
                  <p className="text-sm font-medium text-gray-900">{booking.num_people ?? 1}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>{t('tour_price')}</span>
                <span className="font-semibold text-gray-900" dir="ltr">{formatPrice(booking.price, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t('deposit_20')} <span className="text-xs text-gray-500">· {t('due_now')}</span></span>
                <span className="font-bold text-teal-700 text-lg" dir="ltr">{formatPrice(booking.deposit_amount, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs">
                <span>{t('balance')} · {t('cash_to_guide')}</span>
                <span dir="ltr">{formatPrice(booking.balance_due, currency)}</span>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3 mb-6">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">
              {t('mock_payment_notice')}
            </p>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-semibold bg-teal-600 text-white hover:bg-teal-700 transition shadow-md disabled:opacity-60"
          >
            {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {t('pay_deposit_mock')} — {formatPrice(booking.deposit_amount, currency)}
          </button>

          <button
            onClick={() => navigate(-1)}
            disabled={paying}
            className="w-full mt-3 px-6 py-3 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-60"
          >
            {t('cancel')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
