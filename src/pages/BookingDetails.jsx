import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, MapPin, Calendar, Users, MessageCircle,
  Mail, Phone, Globe, CheckCircle2, Lock,
} from 'lucide-react';
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
    ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';
}

function initialsOf(name) {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { t } = useI18n();

  const [booking, setBooking] = useState(null);
  const [guide, setGuide]     = useState(null);
  const [slot, setSlot]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
  }, [isLoadingAuth, isAuthenticated, navigate]);

  useEffect(() => {
    if (!bookingId || !user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: b, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('tourist_id', user.id)
        .single();
      if (cancelled) return;
      if (error || !b) {
        setLoading(false);
        return;
      }
      setBooking(b);

      const [{ data: g }, { data: s }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, email, phone, phone_number, city, languages, bio, role')
          .eq('id', b.guide_id)
          .single(),
        b.slot_id
          ? supabase.from('trip_slots').select('*').eq('id', b.slot_id).single()
          : Promise.resolve({ data: null }),
      ]);
      if (!cancelled) {
        setGuide(g || null);
        setSlot(s || null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <p className="text-gray-600">Booking not found.</p>
          <Link to="/profile/bookings" className="inline-block mt-4 text-teal-600 hover:underline">
            {t('back_to_my_bookings')}
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const contactReleased = !!booking.contact_released;
  const currency = booking.currency || 'USD';
  const phone = guide?.phone || guide?.phone_number;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
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
          {/* Success header */}
          {isConfirmed && (
            <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white p-6 sm:p-8 mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                🎉 {t('trip_is_booked')}
              </h1>
              <p className="text-white/90 text-sm">
                Booking #{booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          )}

          {/* Two-column cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Trip summary */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {booking.tour_title || 'Your Trip'}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-teal-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Destination</p>
                    <p className="font-medium text-gray-900">{booking.tour_title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-teal-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Dates</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-teal-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Travelers</p>
                    <p className="font-medium text-gray-900">{booking.num_people ?? 1}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('tour_price')}</span>
                  <span className="font-bold text-gray-900" dir="ltr">{formatPrice(booking.price, currency)}</span>
                </div>
                {booking.deposit_amount != null && (
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{t('deposit_20')}</span>
                    <span dir="ltr">{formatPrice(booking.deposit_amount, currency)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Your guide */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('your_guide')}</h2>

              <div className="flex items-start gap-4 mb-4">
                {guide?.avatar_url ? (
                  <img
                    src={guide.avatar_url}
                    alt={guide.full_name || 'Guide'}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-base font-bold shrink-0">
                    {initialsOf(guide?.full_name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">{guide?.full_name || 'Guide'}</p>
                  {guide?.city && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {guide.city}
                    </p>
                  )}
                  {guide?.languages && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3" /> {guide.languages}
                    </p>
                  )}
                </div>
              </div>

              {contactReleased ? (
                <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                  {guide?.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-teal-600" />
                      <a href={`mailto:${guide.email}`} className="hover:text-teal-700" dir="ltr">{guide.email}</a>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-teal-600" />
                      <a href={`tel:${phone}`} className="hover:text-teal-700" dir="ltr">{phone}</a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{t('contact_info_released_after')}</p>
                </div>
              )}

              {guide?.id && (
                <button
                  onClick={() => navigate(`/chat/${guide.id}`)}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('send_a_message')}
                </button>
              )}
            </div>
          </div>

          {/* Itinerary */}
          {slot?.itinerary && (
            <div className="rounded-2xl bg-white border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t('itinerary')}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {slot.itinerary}
              </p>
            </div>
          )}

          {/* Confirmation summary if not yet paid */}
          {!isConfirmed && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 mb-6">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">Deposit not paid yet</p>
                <p className="mt-1">Complete your deposit payment to release your guide's contact info.</p>
                <button
                  onClick={() => navigate(`/profile/bookings/${booking.id}/pay`)}
                  className="mt-3 inline-flex items-center gap-1.5 text-amber-900 underline text-sm font-medium"
                >
                  Pay deposit
                </button>
              </div>
            </div>
          )}

          <Link
            to="/profile/bookings"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_my_bookings')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
