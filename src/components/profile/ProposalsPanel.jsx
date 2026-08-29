import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Star, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import { useI18n } from '@/lib/i18n.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function profilePath(guide) {
  return guide?.role === 'agency'
    ? `/agencies/${guide.id}`
    : `/guides/${guide.id}`;
}

function humanizeEnum(str) {
  return str ? str.replace(/_/g, ' ') : '';
}

function formatPrice(slot, t) {
  if (slot.price == null) return t('proposal_no_price');
  const num      = Number(slot.price).toLocaleString('en-US');
  const currency = slot.currency ? ` ${slot.currency}` : '';
  const type     = slot.price_type   ? ` · ${humanizeEnum(slot.price_type)}`   : '';
  const period   = slot.price_period ? ` · ${humanizeEnum(slot.price_period)}` : '';
  return `${num}${currency}${type}${period}`;
}

function hasSubmittedDetails(slot) {
  return (
    slot.price != null ||
    (slot.itinerary && slot.itinerary.trim()) ||
    slot.included?.length > 0 ||
    slot.excluded?.length > 0 ||
    (slot.message && slot.message.trim())
  );
}

function RoleBadge({ role, t }) {
  const isAgency = role === 'agency';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
      isAgency
        ? 'bg-amber-500/15 text-amber-500 border-amber-400/30'
        : 'bg-accent/15 text-accent border-accent/30'
    }`}>
      {isAgency ? t('proposals_agency') : t('proposals_guide')}
    </span>
  );
}

function GuideAvatar({ guide, size = 'md' }) {
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  if (guide?.avatar_url) {
    return (
      <img decoding="async" loading="lazy"
        src={guide.avatar_url}
        alt={guide.full_name}
        className={`${sz} rounded-full object-cover border border-border/40 shrink-0`}
      />
    );
  }
  return (
    <div className={`${sz} rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-semibold shrink-0`}>
      {guide?.full_name?.[0] || '?'}
    </div>
  );
}

function DetailBlock({ label, children }) {
  return (
    <div className="p-3.5 rounded-xl bg-background/40 border border-border/30">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-1.5">{label}</p>
      {children}
    </div>
  );
}

// ── Level 3: full proposal detail modal ───────────────────────────────────────

function ProposalDetailModal({ slot, onClose }) {
  const { t, lang, dir } = useI18n();
  const guide = slot.guide || {};
  const path  = profilePath(guide);
  const submitted = hasSubmittedDetails(slot);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border"
        dir={dir}
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold text-foreground">
            {t('proposal_detail_title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Guide header — always shown */}
          <Link to={path} className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <GuideAvatar guide={guide} size="lg" />
            <div>
              <p className="font-semibold text-foreground text-sm">{guide.full_name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <RoleBadge role={guide.role} t={t} />
                {guide.rating > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {guide.rating}
                  </span>
                )}
                {guide.city && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {guide.city}
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Empty state — accepted but no details yet */}
          {!submitted ? (
            <p className="text-sm text-muted-foreground italic py-2">
              {t('slot_not_submitted')}
            </p>
          ) : (
            <>
              {/* 1. PRICE */}
              <DetailBlock label={t('proposal_price_label')}>
                <p className="text-sm font-semibold text-foreground">{formatPrice(slot, t)}</p>
              </DetailBlock>

              {/* 2. ITINERARY */}
              {slot.itinerary?.trim() && (
                <DetailBlock label={t('proposal_itinerary')}>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {slot.itinerary}
                  </p>
                </DetailBlock>
              )}

              {/* 3. WHAT'S INCLUDED */}
              {slot.included?.length > 0 && (
                <DetailBlock label={t('proposal_included')}>
                  <ul className="space-y-1.5">
                    {slot.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </DetailBlock>
              )}

              {/* 4. WHAT'S NOT INCLUDED */}
              {slot.excluded?.length > 0 && (
                <DetailBlock label={t('proposal_excluded')}>
                  <ul className="space-y-1.5">
                    {slot.excluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-red-500/15 text-red-500 dark:text-red-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          ✕
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </DetailBlock>
              )}

              {/* 5. MESSAGE FROM THE GUIDE */}
              {slot.message?.trim() && (
                <DetailBlock label={t('proposal_message')}>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {slot.message}
                  </p>
                </DetailBlock>
              )}

              {/* 6. IMAGES */}
              {slot.images?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-2">
                    {t('proposal_images')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {slot.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer">
                        <img decoding="async" loading="lazy"
                          src={img}
                          alt=""
                          className="w-full aspect-square object-cover rounded-xl border border-border/30 hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* View profile — always shown */}
          <Link
            to={path}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            {t('proposal_view_profile')}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Level 2: single proposal row ─────────────────────────────────────────────

function ProposalRow({ slot }) {
  const { t, lang, dir } = useI18n();
  const [showDetail, setShowDetail] = useState(false);
  const guide = slot.guide || {};
  const path  = profilePath(guide);

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-background/30 border border-border/20 hover:border-border/50 transition-colors">
        <Link to={path} className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity">
          <GuideAvatar guide={guide} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{guide.full_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <RoleBadge role={guide.role} t={t} />
              {guide.rating > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {guide.rating}
                </span>
              )}
              {guide.city && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {guide.city}
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="hidden sm:block text-xs text-muted-foreground shrink-0 text-right">
          {slot.price != null
            ? `${Number(slot.price).toLocaleString('en-US')} ${slot.currency || ''}`
            : '—'}
        </div>

        <button
          onClick={() => setShowDetail(true)}
          className="shrink-0 text-xs font-medium text-accent hover:text-accent/80 transition whitespace-nowrap"
        >
          {t('proposal_see_details')}
        </button>
      </div>

      {showDetail && (
        <ProposalDetailModal slot={slot} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}

// ── Level 2: proposals list panel ────────────────────────────────────────────

export default function ProposalsPanel({ requestId }) {
  const { t, lang, dir } = useI18n();

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['trip_slots_proposals', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_slots')
        .select('*, guide:profiles!trip_slots_guide_id_fkey(id, full_name, avatar_url, rating, role, city)')
        .eq('trip_request_id', requestId)
        .neq('status', 'rejected')
        .order('accepted_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!requestId,
    staleTime: 30_000,
  });

  return (
    <div className="pt-4 border-t border-border/30" dir={dir}>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {t('card_view_proposals')}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {t('proposals_no_proposals')}
        </p>
      ) : (
        <div className="space-y-2">
          {slots.map(slot => (
            <ProposalRow key={slot.id} slot={slot} />
          ))}
        </div>
      )}
    </div>
  );
}
