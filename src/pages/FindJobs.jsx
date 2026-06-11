import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Users, Wallet, ChevronDown, ChevronUp,
  Briefcase, RefreshCw, Search, X,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { getAvailableTripRequests } from '../api/tripRequests';
import SubmitProposalModal from '@/components/dashboard/SubmitProposalModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const INTEREST_COLORS = {
  Architecture: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  History:      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Nature:       'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Food:         'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Photography:  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Desert:       'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Luxury:       'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  Culture:      'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  Research:     'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  Art:          'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

const ALL_INTERESTS = Object.keys(INTEREST_COLORS);
const BUDGET_OPTIONS = ['', 'Budget', 'Mid-range', 'Luxury'];

function SlotIndicator({ slotCount }) {
  const taken = slotCount || 0;
  const available = 3 - taken;
  const isYellow = available === 1;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className={`text-base leading-none ${
              i < taken
                ? isYellow
                  ? 'text-yellow-500'
                  : 'text-emerald-500'
                : 'text-muted-foreground/30'
            }`}
          >
            {i < taken ? '●' : '○'}
          </span>
        ))}
      </div>
      <span className={`font-body text-xs font-medium ${
        isYellow ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'
      }`}>
        {available} spot{available !== 1 ? 's' : ''} left
      </span>
    </div>
  );
}

function TripRequestCard({ trip, guideId, onAccepted }) {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const startDate = trip.travel_dates?.start
    ? new Date(trip.travel_dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const endDate = trip.travel_dates?.end
    ? new Date(trip.travel_dates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const dateLabel = startDate && endDate ? `${startDate} – ${endDate}` : startDate || 'Dates flexible';

  const travelerName = trip.traveler?.full_name?.split(' ')[0] || 'Traveler';
  const avatarUrl = trip.traveler?.avatar_url;
  const initials = (trip.traveler?.full_name || 'T')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-semibold text-foreground leading-snug truncate">
              {trip.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gold" />
              <span className="font-body text-sm truncate">{trip.destination}</span>
            </div>
          </div>

          {/* Traveler avatar */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-accent/20 border border-border/50 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={travelerName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-body text-xs font-bold text-accent">{initials}</span>
              )}
            </div>
            <span className="font-body text-sm text-muted-foreground">{travelerName}</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm font-body text-muted-foreground">
          {(startDate || endDate) && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {dateLabel}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 shrink-0" />
            {trip.group_size || 1} {(trip.group_size || 1) === 1 ? 'person' : 'people'}
          </span>
          {trip.budget_range && (
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              {trip.budget_range}
            </span>
          )}
        </div>

        {/* Interests */}
        {trip.interests && trip.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {trip.interests.map(interest => (
              <span
                key={interest}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body ${
                  INTEREST_COLORS[interest] || 'bg-muted text-muted-foreground'
                }`}
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Slot indicator */}
        <div className="mb-4">
          <SlotIndicator slotCount={trip.slot_count} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="flex-1 bg-accent hover:bg-accent/90 text-white font-body font-semibold rounded-xl h-9"
          >
            Accept & Propose
          </Button>

          {trip.notes && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded(e => !e)}
              className="font-body text-xs rounded-xl h-9 border-border/60"
            >
              View Details
              {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </Button>
          )}
        </div>
      </div>

      {/* Accordion: notes */}
      <AnimatePresence>
        {expanded && trip.notes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 pt-0 border-t border-border/30">
              <p className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 pt-4">
                Special Requirements
              </p>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">
                {trip.notes}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubmitProposalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        request={trip}
        guideId={guideId}
        onSuccess={() => { setModalOpen(false); onAccepted(); }}
      />
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-18 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function FindJobs() {
  const { user, profile, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [destFilter, setDestFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState([]);
  const [budgetFilter, setBudgetFilter] = useState('');

  const role = profile?.role || user?.user_metadata?.role;

  // Redirect non-guides
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && role && role !== 'guide' && role !== 'agency') {
      navigate('/');
    }
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoadingAuth, isAuthenticated, role, navigate]);

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const data = await getAvailableTripRequests(user.id);
      setTrips(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load trip requests.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    loadRequests();

    const channel = supabase
      .channel('find_jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trip_requests' },
        loadRequests
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, loadRequests]);

  // Filtered results
  const filtered = trips.filter(trip => {
    if (destFilter && !trip.destination.toLowerCase().includes(destFilter.toLowerCase())) return false;
    if (interestFilter.length > 0 && !interestFilter.every(i => trip.interests?.includes(i))) return false;
    if (budgetFilter && trip.budget_range !== budgetFilter) return false;
    return true;
  });

  const toggleInterestFilter = (interest) => {
    setInterestFilter(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const clearFilters = () => {
    setDestFilter('');
    setInterestFilter([]);
    setBudgetFilter('');
  };

  const hasFilters = destFilter || interestFilter.length > 0 || budgetFilter;

  if (isLoadingAuth || (isAuthenticated && !role)) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-accent" />
            </div>
            <p className="font-body text-xs uppercase tracking-widest text-gold">Guide Portal</p>
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Find Jobs</h1>
          <p className="font-body text-muted-foreground mt-1.5">
            Browse open trip requests from travelers. Only 3 guides can accept each request.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Destination search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by destination…"
                value={destFilter}
                onChange={e => setDestFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-background font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition"
              />
            </div>

            {/* Budget filter */}
            <select
              value={budgetFilter}
              onChange={e => setBudgetFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border/60 bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition min-w-[140px]"
            >
              {BUDGET_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt || 'Any budget'}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border/60 bg-background font-body text-sm text-muted-foreground hover:text-foreground hover:border-border transition"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Interest tag filters */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_INTERESTS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterestFilter(interest)}
                className={`px-3 py-1 rounded-full text-xs font-medium font-body border transition-all ${
                  interestFilter.includes(interest)
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border/50 text-muted-foreground hover:border-accent/40 hover:text-foreground'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="font-body text-sm text-muted-foreground mb-4">
            {filtered.length === 0
              ? 'No trip requests found'
              : `${filtered.length} trip request${filtered.length !== 1 ? 's' : ''} available`}
            {hasFilters && ' (filtered)'}
          </p>
        )}

        {/* Content */}
        {error ? (
          <div className="text-center py-16">
            <p className="font-body text-sm text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={loadRequests} className="font-body">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
              {hasFilters ? 'No matches found' : 'No open requests right now'}
            </h3>
            <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
              {hasFilters
                ? 'Try adjusting your filters to see more results.'
                : 'New trip requests from travelers will appear here. Check back soon!'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 font-body text-sm text-accent hover:text-accent/80 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filtered.map(trip => (
                <TripRequestCard
                  key={trip.id}
                  trip={trip}
                  guideId={user.id}
                  onAccepted={loadRequests}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
