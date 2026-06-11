import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Users, Baby, Car, Hotel,
  Sparkles, FileText, Globe, Star, Clock,
  CheckSquare, Tag, Layers, ChevronDown, ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n.jsx';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:         { label: 'Pending',           classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  active:          { label: 'Active',             classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  waiting:         { label: 'Waiting',            classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  matched:         { label: 'Matched',            classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  proposals_ready: { label: 'Choose a Guide',     classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  confirmed:       { label: 'Confirmed',          classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  completed:       { label: 'Completed',          classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  received:        { label: 'Proposals Received', classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  expired:         { label: 'Expired',            classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-700' },
};

// ── Shared helpers ────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value }) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(', ') : String(value);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground leading-relaxed">{display}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl p-5 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function StarRating({ value, max = 5 }) {
  const rounded = Math.round(value || 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rounded ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

function calcResponseTime(proposalCreatedAt, requestCreatedAt, t) {
  if (!proposalCreatedAt || !requestCreatedAt) return null;
  const ms = new Date(proposalCreatedAt) - new Date(requestCreatedAt);
  if (ms < 0) return null;
  const hours = Math.floor(ms / 3600000);
  if (hours < 1)  return t('proposals_responded_under_hour');
  if (hours < 24) return t('proposals_responded_hours', { h: hours });
  return t('proposals_responded_days', { d: Math.floor(hours / 24) });
}

// ── ProposalCard ──────────────────────────────────────────────────────────────

function ProposalCard({ proposal, requestCreatedAt, t }) {
  const proposer    = proposal.proposer || {};
  const initials    = (proposer.full_name || 'G').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const responseTime = calcResponseTime(proposal.created_at, requestCreatedAt, t);

  return (
    <div className="bg-muted/50 border border-border rounded-2xl p-4 sm:p-5">
      {/* Top row: avatar / name / price */}
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
          {proposer.avatar_url
            ? <img src={proposer.avatar_url} alt={proposer.full_name} className="w-full h-full object-cover" />
            : <span className="text-xs font-bold text-foreground/70">{initials}</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold text-foreground leading-none">
              {proposer.full_name || '—'}
            </span>
            {proposal.provider_type && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                {proposal.provider_type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <StarRating value={proposer.rating} />
            {proposer.rating > 0 && (
              <span className="text-[11px] text-muted-foreground">{proposer.rating.toFixed(1)}</span>
            )}
          </div>
        </div>

        {proposal.proposed_price != null && (
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-foreground">
              ${(proposal.proposed_price).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Response time */}
      {responseTime && (
        <div className="flex items-center gap-1 mt-1 mb-1">
          <Clock className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[11px] text-muted-foreground">{responseTime}</span>
        </div>
      )}

      {/* Message preview */}
      {proposal.message && (
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mt-2 pt-2 border-t border-border/40">
          {proposal.message}
        </p>
      )}
    </div>
  );
}

// ── ProposalFilters ───────────────────────────────────────────────────────────

function ProposalFilters({ filters, onFilterChange, t }) {
  const [open, setOpen] = useState(false);

  const sortOptions = [
    { value: 'newest',     label: t('proposals_sort_newest') },
    { value: 'price_asc',  label: t('proposals_sort_price_low') },
    { value: 'price_desc', label: t('proposals_sort_price_high') },
    { value: 'rating',     label: t('proposals_sort_rating') },
  ];

  const inputCls =
    'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition';

  return (
    <div className="bg-muted/50 border border-border rounded-2xl overflow-hidden">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 sm:hidden"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground/70">
          <SlidersHorizontal className="w-4 h-4" />
          {t('proposals_filters')}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {/* Filter grid: always visible on sm+, collapsible on mobile */}
      <div className={`${open ? 'block' : 'hidden'} sm:block px-4 pb-4 pt-3 border-t border-border sm:border-0`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Budget range */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              {t('proposals_budget_range')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder={t('proposals_min_price')}
                value={filters.minPrice}
                onChange={e => onFilterChange('minPrice', e.target.value)}
                className={inputCls}
              />
              <span className="text-muted-foreground text-sm shrink-0">–</span>
              <input
                type="number"
                min="0"
                placeholder={t('proposals_max_price')}
                value={filters.maxPrice}
                onChange={e => onFilterChange('maxPrice', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Min rating */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              {t('proposals_min_rating')}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onFilterChange('minRating', 0)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filters.minRating === 0
                    ? 'bg-accent text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {t('proposals_any_rating')}
              </button>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onFilterChange('minRating', n)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    filters.minRating === n
                      ? 'bg-amber-400/20 text-amber-500'
                      : 'bg-muted text-muted-foreground hover:text-amber-500 border border-border'
                  }`}
                >
                  <Star className={`w-3 h-3 ${filters.minRating >= n ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Provider type */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              {t('proposals_provider_type')}
            </p>
            <div className="flex gap-1.5">
              {['all', 'guide', 'agency'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onFilterChange('providerType', type)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                    filters.providerType === type
                      ? 'bg-accent text-white border-accent'
                      : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                  }`}
                >
                  {t(`proposals_${type}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort by */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              {t('proposals_sort_by')}
            </p>
            <select
              value={filters.sortBy}
              onChange={e => onFilterChange('sortBy', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50 transition"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { t, lang, dir } = useI18n();

  const [request, setRequest] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState(null);

  const [proposals,        setProposals]        = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  // Filter state
  const [filterMinPrice,     setFilterMinPrice]     = useState('');
  const [filterMaxPrice,     setFilterMaxPrice]     = useState('');
  const [filterMinRating,    setFilterMinRating]    = useState(0);
  const [filterProviderType, setFilterProviderType] = useState('all');
  const [filterSortBy,       setFilterSortBy]       = useState('newest');

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
  }, [isLoadingAuth, isAuthenticated, navigate]);

  // Fetch trip request
  useEffect(() => {
    if (!id || !user?.id) return;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('trip_requests')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (err || !data) {
        setError(err?.message || 'Request not found.');
      } else {
        setRequest(data);
      }
      setLoading(false);
    })();
  }, [id, user?.id]);

  // Fetch proposals from trip_proposals
  useEffect(() => {
    if (!id) return;
    setProposalsLoading(true);
    supabase
      .from('trip_proposals')
      .select('*, proposer:profiles(full_name, avatar_url, rating, role)')
      .eq('trip_request_id', id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!err && data) setProposals(data);
        setProposalsLoading(false);
      });
  }, [id]);

  const handleFilterChange = (key, value) => {
    if (key === 'minPrice')          setFilterMinPrice(value);
    else if (key === 'maxPrice')     setFilterMaxPrice(value);
    else if (key === 'minRating')    setFilterMinRating(value);
    else if (key === 'providerType') setFilterProviderType(value);
    else if (key === 'sortBy')       setFilterSortBy(value);
  };

  const filters = {
    minPrice:     filterMinPrice,
    maxPrice:     filterMaxPrice,
    minRating:    filterMinRating,
    providerType: filterProviderType,
    sortBy:       filterSortBy,
  };

  const filteredProposals = useMemo(() => {
    let list = [...proposals];

    if (filterMinPrice !== '')        list = list.filter(p => (p.proposed_price || 0) >= Number(filterMinPrice));
    if (filterMaxPrice !== '')        list = list.filter(p => (p.proposed_price || 0) <= Number(filterMaxPrice));
    if (filterMinRating > 0)          list = list.filter(p => (p.proposer?.rating || 0) >= filterMinRating);
    if (filterProviderType !== 'all') list = list.filter(p => p.provider_type === filterProviderType);

    list.sort((a, b) => {
      if (filterSortBy === 'price_asc')  return (a.proposed_price || 0) - (b.proposed_price || 0);
      if (filterSortBy === 'price_desc') return (b.proposed_price || 0) - (a.proposed_price || 0);
      if (filterSortBy === 'rating')     return (b.proposer?.rating || 0) - (a.proposer?.rating || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return list;
  }, [proposals, filterMinPrice, filterMaxPrice, filterMinRating, filterProviderType, filterSortBy]);

  if (isLoadingAuth || loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const r = request;
  const statusCfg = STATUS_CONFIG[r?.status] || STATUS_CONFIG.active;
  const hasTransportation = r?.assistance?.includes('Transportation');
  const hasAccommodation  = r?.assistance?.includes('Accommodation');
  const cities = Array.isArray(r?.destination) ? r.destination : r?.destination ? [r.destination] : [];
  const title = r?.title
    || (cities.length ? `Trip to ${cities.join(', ')}` : 'Trip Request');

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mb-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-sm font-medium hover:bg-white/30 transition-all text-gray-700 dark:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {error ? (
          <div className="bg-card/60 border border-border/40 rounded-3xl p-16 text-center">
            <p className="font-body text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Hero card */}
            <div className="bg-card/60 backdrop-blur-md border border-border/40 rounded-3xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
                    {title}
                  </h1>
                  {cities.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-gold shrink-0" />
                      {cities.map(city => (
                        <span
                          key={city}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${statusCfg.classes}`}>
                  {statusCfg.label}
                </span>
              </div>

              {r?.created_at && (
                <p className="font-body text-xs text-muted-foreground/60 mt-2">
                  Submitted {formatDate(r.created_at)}
                </p>
              )}
            </div>

            {/* Travel dates & times */}
            <Section title="Travel Dates">
              <DetailRow icon={Calendar} label="Start Date"       value={formatDate(r?.start_date)} />
              <DetailRow icon={Calendar} label="End Date"         value={formatDate(r?.end_date)} />
              <DetailRow icon={Clock}    label="Arrival Time"     value={r?.arrival_time} />
              <DetailRow icon={Clock}    label="Departure Time"   value={r?.departure_time} />
              {r?.timings_flexible && (
                <p className="text-xs text-muted-foreground mt-2 italic">Timings are flexible</p>
              )}
            </Section>

            {/* Travellers */}
            <Section title="Travellers">
              <DetailRow icon={Users} label="Adults"   value={r?.adults} />
              <DetailRow icon={Baby}  label="Children" value={r?.children > 0 ? r.children : null} />
            </Section>

            {/* Services & preferences */}
            <Section title="Services & Preferences">
              <DetailRow
                icon={Car}
                label="Transportation"
                value={hasTransportation ? 'Required' : null}
              />
              <DetailRow
                icon={Hotel}
                label="Accommodation"
                value={hasAccommodation
                  ? (r?.accommodation_stars ? `${r.accommodation_stars}★ hotel` : 'Required')
                  : null}
              />
              <DetailRow icon={Sparkles} label="Tour Type"          value={r?.tour_type} />
              <DetailRow icon={Globe}    label="Guide Languages"     value={r?.guide_languages} />
              <DetailRow icon={Tag}      label="Holiday Types"       value={r?.holiday_types} />
              <DetailRow icon={Layers}   label="Additional Services" value={r?.additional_services} />
            </Section>

            {/* Requirements / notes */}
            {r?.requirements && (
              <Section title="Requirements & Notes">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{r.requirements}</p>
                </div>
              </Section>
            )}

            {/* ── Proposals section ─────────────────────────────────────────── */}
            <div className="space-y-3 pt-2">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {t('proposals_section_title')}
                </h2>
                <p className="font-body text-xs text-muted-foreground">
                  {t('proposals_showing', {
                    shown: filteredProposals.length,
                    total: proposals.length,
                  })}
                </p>
              </div>

              {/* Filters */}
              <ProposalFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                t={t}
              />

              {/* List */}
              {proposalsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-accent/50 border-t-accent animate-spin" />
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="bg-muted/30 border border-border rounded-2xl p-10 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('proposals_no_proposals')}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs mx-auto">
                    {t('proposals_no_proposals_desc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProposals.map(p => (
                    <ProposalCard
                      key={p.id}
                      proposal={p}
                      requestCreatedAt={r?.created_at}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
