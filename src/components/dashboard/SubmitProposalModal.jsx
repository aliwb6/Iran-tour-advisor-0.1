import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n.jsx';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { guideSubmitProposal } from '@/api/tripRequests';

const parseLines = (s) =>
  (s || '').split('\n').map(x => x.trim()).filter(Boolean);

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

export default function SubmitProposalModal({
  open,
  onClose,
  request,
  guideId,
  commissionRate = 0.15,
  onSuccess,
}) {
  const { t, dir } = useI18n();

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

  const subtitle = useMemo(() => {
    if (!request) return '';
    if (request.title) return request.title;
    const dest = Array.isArray(request.destination)
      ? request.destination.join(', ')
      : (request.destination || 'Iran');
    return `Trip to ${dest}`;
  }, [request]);

  const handleSubmit = async () => {
    if (!numPrice || numPrice <= 0) { toast.error(t('invalid_price')); return; }
    if (!itinerary.trim())          { toast.error(t('itinerary_required')); return; }
    const included = parseLines(includedText);
    if (included.length === 0)      { toast.error(t('included_required')); return; }

    try {
      setSubmitting(true);
      await guideSubmitProposal(guideId, request.id, {
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
            <DialogDescription className="text-white/50 text-sm mt-1">
              {subtitle}
            </DialogDescription>
            <span className="inline-block mt-3 text-[11px] bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20">
              {t('request_closes_at_5')}
            </span>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">

            {/* Pricing block */}
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
