import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Loader2, AlertTriangle,
  MapPin, Calendar, Clock, Users, Baby, Car, Hotel,
  Sparkles, FileText, Globe, Tag, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n.jsx';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { guideSubmitProposal } from '@/api/tripRequests';

const parseLines = (s) =>
  (s || '').split('\n').map(x => x.trim()).filter(Boolean);

const cap = (s) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

function SegToggle({ value, options, onChange }) {
  return (
    <div className="flex gap-1.5 bg-white/[0.05] p-1 rounded-xl">
      {options.map(opt => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              active
                ? 'bg-[hsl(178,85%,32%)] text-white shadow'
                : 'text-white/60 hover:bg-white/[0.1] hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">
      {children}
    </label>
  );
}

function TripDetailRow({ icon: Icon, label, value }) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    <div className="flex items-start gap-3 mb-4 last:mb-0">
      <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-teal-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-1">{label}</p>
        <p className="text-base text-white">{display}</p>
      </div>
    </div>
  );
}

function TripCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 mb-4">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function SubmitProposalModal({
  open,
  onClose,
  request,
  guideId,
  commissionRate = 0.15,
  onSuccess,
}) {
  const { t, lang, dir } = useI18n();

  const [price, setPrice]               = useState('');
  const [priceType, setPriceType]       = useState('per_person');
  const [pricePeriod, setPricePeriod]   = useState('entire_trip');
  const [itinerary, setItinerary]       = useState('');
  const [includedText, setIncludedText] = useState('');
  const [excludedText, setExcludedText] = useState('');
  const [message, setMessage]           = useState('');
  const [imagesText, setImagesText]     = useState('');
  const [submitting, setSubmitting]     = useState(false);

  const numPrice = parseFloat(price) || 0;
  const netPayout = numPrice * (1 - commissionRate);
  const pct = Math.round(commissionRate * 100);

  const r = request || {};
  const cities = Array.isArray(r.destination) ? r.destination : r.destination ? [r.destination] : [];
  const title = r.title || (cities.length ? `Trip to ${cities.join(', ')}` : 'Trip Request');

  const hasTransportation = r.assistance?.includes('Transportation');
  const hasAccommodation  = r.assistance?.includes('Accommodation');

  const handleSubmit = async () => {
    if (!numPrice || numPrice <= 0) { toast.error(t('invalid_price')); return; }
    if (!itinerary.trim())          { toast.error(t('itinerary_required')); return; }
    const included = parseLines(includedText);
    if (included.length === 0)      { toast.error(t('included_required')); return; }

    try {
      setSubmitting(true);
      await guideSubmitProposal(guideId, r.id, {
        price: numPrice,
        currency: 'USD',
        price_type: priceType,
        price_period: pricePeriod,
        itinerary,
        included,
        excluded: parseLines(excludedText),
        message,
        images: parseLines(imagesText),
      });
      toast.success(t('proposal_sent'));
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || t('proposal_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !submitting && onClose()}>
      <DialogContent
        className="bg-[hsl(222,55%,8%)] border border-white/10 text-white p-0 sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <motion.div
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <DialogTitle className="text-white text-xl font-semibold">
              {t('submit_proposal')}
            </DialogTitle>
            <DialogDescription className="sr-only">{title}</DialogDescription>

            {/* Trip title + active status pill */}
            <div className="flex items-start justify-between gap-4 mt-3">
              <h2 className="text-2xl font-bold text-white leading-tight">{title}</h2>
              <span className="bg-amber-400/15 text-amber-400 px-3 py-1 rounded-full text-xs shrink-0">
                {t('active_status')}
              </span>
            </div>

            {/* City pills */}
            {cities.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                {cities.map(city => (
                  <span
                    key={city}
                    className="bg-teal-400/15 text-teal-400 px-3 py-1 rounded-full text-xs"
                  >
                    {city}
                  </span>
                ))}
              </div>
            )}

            {/* Submitted date */}
            {r.created_at && (
              <p className="text-sm text-white/40 mt-2">
                {t('submitted_on_date', { date: formatDate(r.created_at) })}
              </p>
            )}

            {/* Request closes pill */}
            <span className="inline-block mt-3 text-[11px] bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20">
              {t('request_closes_at_5')}
            </span>
          </div>

          {/* Body */}
          <div className="p-6">

            {/* ── CARD 1: Travel Dates ── */}
            <TripCard title={t('travel_dates')}>
              <TripDetailRow icon={Calendar} label={t('start_date_label')} value={formatDate(r.start_date)} />
              <TripDetailRow icon={Calendar} label={t('end_date_label')}   value={formatDate(r.end_date)} />
              {!r.timings_flexible && (
                <>
                  <TripDetailRow icon={Clock} label={t('arrival_time_label')}   value={r.arrival_time} />
                  <TripDetailRow icon={Clock} label={t('departure_time_label')} value={r.departure_time} />
                </>
              )}
              {r.timings_flexible && (
                <p className="text-sm italic text-white/50 mt-2">{t('timings_flexible_note')}</p>
              )}
            </TripCard>

            {/* ── CARD 2: Travellers ── */}
            <TripCard title={t('travellers')}>
              <TripDetailRow icon={Users} label={t('adults_label')} value={r.adults} />
              {r.children > 0 && (
                <TripDetailRow icon={Baby} label={t('children_label')} value={r.children} />
              )}
            </TripCard>

            {/* ── CARD 3: Services & Preferences ── */}
            <TripCard title={t('services_preferences')}>
              {hasAccommodation && (
                <TripDetailRow
                  icon={Hotel}
                  label={t('accommodation_label')}
                  value={r.accommodation_stars ? t('star_hotel', { n: r.accommodation_stars }) : 'Required'}
                />
              )}
              {hasTransportation && (
                <TripDetailRow icon={Car} label={t('transportation_label')} value="Required" />
              )}
              <TripDetailRow icon={Sparkles} label={t('tour_type_uc')} value={cap(r.tour_type)} />
              <TripDetailRow
                icon={Globe}
                label={t('guide_languages_label')}
                value={
                  Array.isArray(r.guide_languages)
                    ? r.guide_languages.map(cap).join(', ')
                    : cap(r.guide_languages)
                }
              />
              <TripDetailRow
                icon={Tag}
                label={t('holiday_types_uc')}
                value={
                  Array.isArray(r.holiday_types)
                    ? r.holiday_types.map(cap).join(', ')
                    : cap(r.holiday_types)
                }
              />
              <TripDetailRow
                icon={Layers}
                label={t('additional_services_uc')}
                value={
                  Array.isArray(r.additional_services)
                    ? r.additional_services.map(cap).join(', ')
                    : cap(r.additional_services)
                }
              />
            </TripCard>

            {/* ── CARD 4: Requirements & Notes (only if present) ── */}
            {r.requirements && (
              <TripCard title={t('requirements_notes')}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-teal-400" />
                  </div>
                  <p className="text-base text-white/90">{r.requirements}</p>
                </div>
              </TripCard>
            )}

            {/* ── Divider before proposal form ── */}
            <div className="h-px bg-white/10 my-6" />
            <h3 className="text-sm uppercase tracking-wider text-white/40 mb-4">
              {t('your_proposal')}
            </h3>

            {/* Proposal form */}
            <div className="space-y-6">

              {/* Pricing */}
              <div className="border border-white/10 rounded-2xl p-5 space-y-4">
                <FieldLabel>{t('pricing')}</FieldLabel>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-lg font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,45%)] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <SegToggle
                    value={priceType}
                    onChange={setPriceType}
                    options={[
                      { id: 'per_person',   label: t('per_person')   },
                      { id: 'entire_group', label: t('entire_group') },
                    ]}
                  />
                  <SegToggle
                    value={pricePeriod}
                    onChange={setPricePeriod}
                    options={[
                      { id: 'per_day',     label: t('per_day')     },
                      { id: 'entire_trip', label: t('entire_trip') },
                    ]}
                  />
                </div>

                <p className="text-xs text-white/60 pt-1">
                  {t('net_payment_after_fees', { pct, amount: netPayout.toFixed(2) })
                    .split('$')
                    .map((piece, i) =>
                      i === 0
                        ? piece
                        : <span key={i}>
                            <span className="text-teal-400 font-semibold">${piece}</span>
                          </span>
                    )}
                </p>
              </div>

              {/* Itinerary */}
              <div>
                <FieldLabel>{t('day_by_day_itinerary')}</FieldLabel>
                <textarea
                  value={itinerary}
                  onChange={(e) => setItinerary(e.target.value)}
                  rows={5}
                  placeholder={'Day 1: Arrival in Tehran. Pick-up from IKA airport...\nDay 2: Morning visit to Golestan Palace...'}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,45%)] transition-colors resize-y"
                />
              </div>

              {/* Included / Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>{t('whats_included')}</FieldLabel>
                  <textarea
                    value={includedText}
                    onChange={(e) => setIncludedText(e.target.value)}
                    rows={4}
                    placeholder={'English-speaking guide\nHotel pickup\nEntrance tickets'}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,45%)] transition-colors resize-y"
                  />
                </div>
                <div>
                  <FieldLabel>{t('whats_not_included')}</FieldLabel>
                  <textarea
                    value={excludedText}
                    onChange={(e) => setExcludedText(e.target.value)}
                    rows={4}
                    placeholder={'International flights\nMeals not specified\nPersonal expenses'}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,45%)] transition-colors resize-y"
                  />
                </div>
              </div>

              {/* Personal message */}
              <div>
                <FieldLabel>{t('personal_message')}</FieldLabel>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder={"Hi! I'd love to guide you through Iran..."}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,45%)] transition-colors resize-y"
                />
                <p className="mt-2 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {t('do_not_share_contact')}
                </p>
              </div>

              {/* Images */}
              <div>
                <FieldLabel>{t('image_urls_optional')}</FieldLabel>
                <textarea
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  rows={3}
                  placeholder={'https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg'}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(178,85%,45%)] transition-colors resize-y"
                />
                <p className="mt-1 text-[11px] text-white/40">Paste one image URL per line</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => !submitting && onClose()}
              className="text-white/60 hover:text-white hover:bg-white/[0.05]"
            >
              {t('dashboard_cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-[hsl(178,85%,32%)] hover:bg-[hsl(178,85%,28%)] text-white font-semibold h-11 rounded-xl shadow-lg shadow-[hsl(178,85%,32%)]/20 disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('article_submitting')}</>
              ) : (
                t('submit_proposal_btn')
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
