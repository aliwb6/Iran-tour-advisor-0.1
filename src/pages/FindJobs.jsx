import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Users, Globe, FileText,
  Briefcase, RefreshCw, Search, X, CheckCircle2,
  Loader2, Home, Car, Star, Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { getAvailableTripRequests } from '../api/tripRequests';
import { guideAcceptRequest } from '../api/tourRequestFlow';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const TOUR_TYPES = ['City Tour', 'Adventure', 'Cultural', 'Historical', 'Nature', 'Religious', 'Custom'];

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SlotIndicator({ acceptedCount }) {
  const taken = acceptedCount || 0;
  const available = 3 - taken;
  const isYellow = available === 1;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <span key={i} className={`text-base leading-none ${
            i < taken
              ? isYellow ? 'text-yellow-500' : 'text-emerald-500'
              : 'text-muted-foreground/30'
          }`}>
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

function DetailRow({ icon, label, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-muted-foreground">{icon}</span>
        <span className="font-body text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="pl-6 font-body text-sm text-foreground">{children}</div>
    </div>
  );
}

function DetailsModal({ trip, guideId, onClose, onAccepted }) {
  const [accepting, setAccepting] = useState(false);
  const isFull = trip.accepted_count >= 3;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await guideAcceptRequest(guideId, trip.id);
      toast.success("Request accepted! You'll be notified when the tourist makes their choice.");
      onAccepted();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to accept trip request.');
    } finally {
      setAccepting(false);
    }
  };

  const start = fmt(trip.start_date);
  const end = fmt(trip.end_date);
  const adults = trip.adults || trip.adult_count || 1;
  const children = trip.children || trip.child_count || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-card border-b border-border/30 px-5 py-4 flex items-start justify-between gap-3 rounded-t-2xl z-10">
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground">
              Trip to {trip.destination || 'Iran'}
            </h3>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Submitted {fmt(trip.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slot indicator */}
        <div className="px-5 pt-4">
          <SlotIndicator acceptedCount={trip.accepted_count} />
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          {(start || end) && (
            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Travel Dates">
              {start}{start && end ? ' → ' : ''}{end}
              {trip.timings_flexible && (
                <span className="ml-2 font-body text-xs text-muted-foreground">(flexible)</span>
              )}
            </DetailRow>
          )}

          <DetailRow icon={<Users className="w-4 h-4" />} label="Group Size">
            {adults} adult{adults !== 1 ? 's' : ''}
            {children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}
          </DetailRow>

          {trip.tour_type && (
            <DetailRow icon={<Briefcase className="w-4 h-4" />} label="Tour Type">
              {trip.tour_type}
            </DetailRow>
          )}

          {trip.guide_languages?.length > 0 && (
            <DetailRow icon={<Globe className="w-4 h-4" />} label="Preferred Languages">
              {trip.guide_languages.join(', ')}
            </DetailRow>
          )}

          {trip.accommodation_stars && (
            <DetailRow icon={<Home className="w-4 h-4" />} label="Accommodation">
              {trip.accommodation_stars}★ hotel
            </DetailRow>
          )}

          {trip.assistance?.length > 0 && (
            <DetailRow icon={<CheckCircle2 className="w-4 h-4" />} label="Assistance Needed">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {trip.assistance.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded-full bg-muted/60 text-xs font-body text-muted-foreground border border-border/40">
                    {a}
                  </span>
                ))}
              </div>
            </DetailRow>
          )}

          {trip.holiday_types?.length > 0 && (
            <DetailRow icon={<Star className="w-4 h-4" />} label="Interests">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {trip.holiday_types.map(h => (
                  <span key={h} className="px-2 py-0.5 rounded-full bg-muted/60 text-xs font-body text-muted-foreground border border-border/40">
                    {h}
                  </span>
                ))}
              </div>
            </DetailRow>
          )}

          {trip.additional_services?.length > 0 && (
            <DetailRow icon={<Car className="w-4 h-4" />} label="Additional Services">
              {trip.additional_services.join(', ')}
            </DetailRow>
          )}

          {trip.requirements && (
            <DetailRow icon={<FileText className="w-4 h-4" />} label="Special Requirements">
              <p className="font-body text-sm text-foreground/80 leading-relaxed mt-0.5">
                {trip.requirements}
              </p>
            </DetailRow>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 pb-5 flex gap-2">
          <Button
            onClick={handleAccept}
            disabled={accepting || isFull}
            className={`flex-1 font-body font-semibold rounded-xl h-10 ${
              isFull
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-accent hover:bg-accent/90 text-white'
            }`}
          >
            {accepting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Accepting…</>
            ) : isFull ? (
              'All Slots Taken'
            ) : (
              'Accept Request'
            )}
          </Button>
          <Button variant="outline" onClick={onClose} className="font-body rounded-xl h-10 border-border/60">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function TripRequestCard({ trip, guideId, onAccepted, onViewDetails }) {
  const [accepting, setAccepting] = useState(false);
  const isFull = trip.accepted_count >= 3;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await guideAcceptRequest(guideId, trip.id);
      toast.success("Request accepted! You'll be notified when the tourist makes their choice.");
      onAccepted();
    } catch (err) {
      toast.error(err.message || 'Failed to accept trip request.');
    } finally {
      setAccepting(false);
    }
  };

  const start = fmt(trip.start_date);
  const end = fmt(trip.end_date);
  const dateLabel = start && end
    ? `${start} – ${end}`
    : start || (trip.timings_flexible ? 'Dates flexible' : null);

  const adults = trip.adults || trip.adult_count || 1;
  const children = trip.children || trip.child_count || 0;
  const totalPeople = adults + children;

  const travelerName = trip.traveler?.full_name?.split(' ')[0] || 'Traveler';
  const avatarUrl = trip.traveler?.avatar_url;
  const initials = (trip.traveler?.full_name || 'T')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-semibold text-foreground leading-snug truncate">
              Trip to {trip.destination || 'Iran'}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gold" />
              <span className="font-body text-sm truncate">{trip.destination || '—'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-accent/20 border border-border/50 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={travelerName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-body text-xs font-bold text-accent">{initials}</span>
              )}
            </div>
            <span className="font-body text-sm text-muted-foreground hidden sm:block">{travelerName}</span>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3 text-sm font-body text-muted-foreground">
          {dateLabel && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {dateLabel}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 shrink-0" />
            {totalPeople} {totalPeople === 1 ? 'person' : 'people'}
          </span>
          {trip.tour_type && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              {trip.tour_type}
            </span>
          )}
          {trip.guide_languages?.length > 0 && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              {trip.guide_languages.join(', ')}
            </span>
          )}
        </div>

        {/* Requirements snippet */}
        {trip.requirements && (
          <p className="font-body text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            <FileText className="w-3 h-3 inline-block mr-1 opacity-60" />
            {trip.requirements}
          </p>
        )}

        {/* Slot indicator */}
        <div className="mb-4">
          <SlotIndicator acceptedCount={trip.accepted_count} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={accepting || isFull}
            className={`flex-1 font-body font-semibold rounded-xl h-9 ${
              isFull
                ? 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
                : 'bg-accent hover:bg-accent/90 text-white'
            }`}
          >
            {accepting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Accepting…</>
            ) : isFull ? (
              'Slots Full'
            ) : (
              'Accept Request'
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetails}
            className="font-body text-xs rounded-xl h-9 border-border/60 shrink-0"
          >
            See Details
          </Button>
        </div>
      </div>
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
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
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
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Filters
  const [destFilter, setDestFilter] = useState('');
  const [tourTypeFilter, setTourTypeFilter] = useState('');

  const role = profile?.role || user?.user_metadata?.role;

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_requests' }, loadRequests)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, loadRequests]);

  const filtered = trips.filter(trip => {
    if (destFilter && !trip.destination?.toLowerCase().includes(destFilter.toLowerCase())) return false;
    if (tourTypeFilter && trip.tour_type !== tourTypeFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setDestFilter('');
    setTourTypeFilter('');
  };

  const hasFilters = destFilter || tourTypeFilter;

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
        <div className="bg-card border border-border/50 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
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
            <select
              value={tourTypeFilter}
              onChange={e => setTourTypeFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border/60 bg-background font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition min-w-[150px]"
            >
              <option value="">Any tour type</option>
              {TOUR_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
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
              <Bell className="w-8 h-8 text-muted-foreground/40" />
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
              <button onClick={clearFilters} className="mt-4 font-body text-sm text-accent hover:text-accent/80 transition">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map(trip => (
                <TripRequestCard
                  key={trip.id}
                  trip={trip}
                  guideId={user.id}
                  onAccepted={loadRequests}
                  onViewDetails={() => setSelectedTrip(trip)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* See Details modal */}
      <AnimatePresence>
        {selectedTrip && (
          <DetailsModal
            trip={selectedTrip}
            guideId={user?.id}
            onClose={() => setSelectedTrip(null)}
            onAccepted={loadRequests}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
