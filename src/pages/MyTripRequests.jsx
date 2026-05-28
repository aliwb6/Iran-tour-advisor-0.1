import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MapPin, Calendar, Users, MessageCircle,
  RefreshCw, CheckCircle2, Clock, Zap, AlertCircle, Loader2,
  Star, UserCheck, ChevronDown, ChevronUp, Globe, FileText, Home,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../lib/AuthContext';
import { getMyTripRequests, rebroadcastTripRequest } from '../api/tripRequests';
import { touristSelectGuide } from '../api/tourRequestFlow';
import TripRequestForm from '@/components/profile/TripRequestForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  active: {
    label: 'Active',
    icon: Zap,
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  matched: {
    label: 'Matched',
    icon: CheckCircle2,
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  proposals_ready: {
    label: 'Choose a Guide',
    icon: UserCheck,
    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium font-body ${cfg.classes}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function SlotBar({ slotCount }) {
  const taken = slotCount || 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-6 h-1.5 rounded-full transition-colors ${
              i < taken ? 'bg-accent' : 'bg-border/50'
            }`}
          />
        ))}
      </div>
      <span className="font-body text-xs text-muted-foreground">
        {taken}/3 guide{taken !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

function GuideSlot({ slot, tripId, tripStatus, onSelect, selecting }) {
  const navigate = useNavigate();
  const guideName = slot.guide?.full_name || 'Guide';
  const avatarUrl = slot.guide?.avatar_url;
  const initials = (slot.guide?.full_name || 'G')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const slotStatusLabel = {
    chatting:  { label: 'Chatting',  color: 'text-accent' },
    accepted:  { label: 'Ready',     color: 'text-emerald-600' },
    selected:  { label: 'Selected ✓',color: 'text-emerald-600' },
    rejected:  { label: 'Declined',  color: 'text-muted-foreground line-through' },
    finalized: { label: 'Finalized', color: 'text-emerald-600' },
  }[slot.status] || { label: slot.status, color: 'text-muted-foreground' };

  if (slot.status === 'rejected') return null;

  const canSelect = tripStatus === 'proposals_ready';

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-muted/30 border border-border/30">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={guideName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-body text-xs font-bold text-accent">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-body text-sm font-medium text-foreground truncate">{guideName}</p>
          <div className="flex items-center gap-2">
            <p className={`font-body text-xs ${slotStatusLabel.color}`}>{slotStatusLabel.label}</p>
            {slot.guide?.city && (
              <span className="font-body text-xs text-muted-foreground">· {slot.guide.city}</span>
            )}
            {slot.guide?.rating > 0 && (
              <span className="font-body text-xs text-muted-foreground flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-gold text-gold" />
                {Number(slot.guide.rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {canSelect ? (
        <Button
          size="sm"
          onClick={() => onSelect(slot.guide_id)}
          disabled={selecting}
          className="bg-accent hover:bg-accent/90 text-white font-body text-xs rounded-lg h-7 gap-1 shrink-0"
        >
          {selecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
          Select
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/chat/${slot.guide_id}`)}
          className="font-body text-xs rounded-lg h-7 border-border/60 gap-1 shrink-0"
        >
          <MessageCircle className="w-3 h-3" />
          Message
        </Button>
      )}
    </div>
  );
}

function TripCard({ trip, onRebroadcast, onRefresh }) {
  const [rebroadcasting, setRebroadcasting] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const startDate = trip.travel_dates?.start
    ? new Date(trip.travel_dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const endDate = trip.travel_dates?.end
    ? new Date(trip.travel_dates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const activeSlots = (trip.slots || []).filter(s => s.status !== 'rejected');

  const handleRebroadcast = async () => {
    setRebroadcasting(true);
    try {
      await rebroadcastTripRequest(trip.id);
      toast.success('Your trip request has been re-broadcast to guides!');
      onRebroadcast();
    } catch (err) {
      toast.error(err.message || 'Failed to re-broadcast.');
    } finally {
      setRebroadcasting(false);
    }
  };

  const handleSelectGuide = async (guideId) => {
    setSelecting(true);
    try {
      await touristSelectGuide(trip.id, guideId);
      toast.success('Guide selected! Your trip is now confirmed.');
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to select guide.');
      setSelecting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm"
    >
      {/* proposals_ready banner */}
      {trip.status === 'proposals_ready' && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-violet-500/10 border-b border-violet-500/20">
          <UserCheck className="w-4 h-4 text-violet-600 shrink-0" />
          <span className="font-body text-sm font-medium text-violet-700 dark:text-violet-400">
            3 guides are ready for your trip! Choose one below.
          </span>
        </div>
      )}

      {/* Confirmed banner */}
      {trip.status === 'confirmed' && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-body text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Guide confirmed — your trip is all set!
          </span>
        </div>
      )}

      {/* Completed banner */}
      {trip.status === 'completed' && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-body text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Trip Finalized — Enjoy your journey!
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-semibold text-foreground leading-snug">
              {trip.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gold" />
              <span className="font-body text-sm">{trip.destination}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {trip.source === 'request' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                Request
              </span>
            )}
            <StatusBadge status={trip.status} />
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-3 font-body text-sm text-muted-foreground">
          {(startDate || endDate) && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {startDate}{startDate && endDate ? ' → ' : ''}{endDate}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 shrink-0" />
            {trip.group_size || 1} {(trip.group_size || 1) === 1 ? 'person' : 'people'}
          </span>
          {trip.broadcast_count > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <RefreshCw className="w-3 h-3 shrink-0" />
              Re-broadcast ×{trip.broadcast_count}
            </span>
          )}
        </div>

        {/* Slot bar — shows real guide count from trip_slots */}
        <div className="mb-4">
          <SlotBar slotCount={activeSlots.length} />
        </div>

        {/* Guide slots */}
        {activeSlots.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {trip.status === 'proposals_ready' ? 'Choose your guide' : 'Guides Connected'}
            </p>
            {activeSlots.map(slot => (
              <GuideSlot
                key={slot.id}
                slot={slot}
                tripId={trip.id}
                tripStatus={trip.status}
                onSelect={handleSelectGuide}
                selecting={selecting}
              />
            ))}
          </div>
        )}

        {/* View trip details toggle */}
        <button
          onClick={() => setShowDetails(d => !d)}
          className="w-full flex items-center justify-center gap-1 py-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition"
        >
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showDetails ? 'Hide details' : 'View trip details'}
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="border-t border-border/30 pt-3 mt-1 space-y-2.5">
                {trip.tour_type && (
                  <p className="font-body text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="font-semibold text-foreground/60 min-w-[90px]">Tour type:</span>
                    {trip.tour_type}
                  </p>
                )}
                {trip.guide_languages?.length > 0 && (
                  <p className="font-body text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="font-semibold text-foreground/60 min-w-[90px]">Language:</span>
                    {trip.guide_languages.join(', ')}
                  </p>
                )}
                {trip.accommodation_stars && (
                  <p className="font-body text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="font-semibold text-foreground/60 min-w-[90px]">Accommodation:</span>
                    {trip.accommodation_stars}★ hotel
                  </p>
                )}
                {trip.assistance?.length > 0 && (
                  <p className="font-body text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="font-semibold text-foreground/60 min-w-[90px]">Assistance:</span>
                    {trip.assistance.join(', ')}
                  </p>
                )}
                {trip.holiday_types?.length > 0 && (
                  <p className="font-body text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="font-semibold text-foreground/60 min-w-[90px]">Interests:</span>
                    {trip.holiday_types.join(', ')}
                  </p>
                )}
                {trip.requirements && (
                  <div className="font-body text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/60 block mb-1">Requirements:</span>
                    <p className="leading-relaxed">{trip.requirements}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Re-broadcast for expired */}
        {trip.status === 'expired' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRebroadcast}
            disabled={rebroadcasting}
            className="w-full font-body text-sm rounded-xl border-dashed border-border/60 gap-2"
          >
            {rebroadcasting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {rebroadcasting ? 'Re-broadcasting…' : 'Re-broadcast to Guides'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-36" />
          <div className="flex gap-3">
            <Skeleton className="h-1.5 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyTripRequests() {
  const { user, profile, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const role = profile?.role || user?.user_metadata?.role;

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate('/login');
  }, [isLoadingAuth, isAuthenticated, navigate]);

  const loadTrips = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const data = await getMyTripRequests(user.id);
      setTrips(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your trips.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) loadTrips();
  }, [user?.id, loadTrips]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="font-body text-xs uppercase tracking-widest text-gold mb-1">Travel Planning</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">My Trip Requests</h1>
          <p className="font-body text-muted-foreground mt-1.5">
            Track your trip requests and communicate with matched guides.
          </p>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-16">
            <p className="font-body text-sm text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={loadTrips} className="font-body">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
              No trip requests yet
            </h3>
            <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              Create your first trip request and get matched with expert local guides.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-accent hover:bg-accent/90 text-white font-body font-semibold rounded-xl gap-2"
            >
              <Plus className="w-4 h-4" />
              New Trip Request
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} onRebroadcast={loadTrips} onRefresh={loadTrips} />
            ))}
          </div>
        )}
      </div>

      {/* Floating action button */}
      {trips.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-white font-body font-semibold text-sm shadow-lg shadow-accent/30 hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Trip Request
          </motion.button>
        </div>
      )}

      {/* Multi-step trip request modal (shared with /profile/requests) */}
      <TripRequestForm
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); loadTrips(); }}
      />
    </div>
  );
}
