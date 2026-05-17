import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/supabaseClient';
import { motion } from 'framer-motion';
import { User, MapPin, Star, Clock, CheckCircle, AlertCircle, Edit3, Eye, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ views: 0, bookings: 0, rating: 0 });

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
    if (!isLoadingAuth && isAuthenticated && profile?.role === 'tourist') {
      navigate('/');
    }
  }, [isAuthenticated, isLoadingAuth, profile, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isApproved = profile?.is_verified === true;
  const roleLabel = profile?.role === 'guide' ? 'Local Guide' : 'Travel Agency';
  const roleColor = profile?.role === 'guide' ? 'text-emerald-600' : 'text-blue-600';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">{profile?.full_name || 'User'}</p>
              <p className={`text-xs font-body ${roleColor}`}>{roleLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Site
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Approval Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isApproved
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
              : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
          }`}
        >
          {isApproved ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          )}
          <div>
            <p className={`font-body font-semibold text-sm ${isApproved ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {isApproved ? 'Profile Approved & Active' : 'Pending Admin Approval'}
            </p>
            <p className={`font-body text-xs mt-0.5 ${isApproved ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'}`}>
              {isApproved
                ? 'Your profile is visible to travelers on the platform.'
                : 'Your profile is under review. You will be notified once approved. This usually takes 1-2 business days.'}
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Profile Views', value: stats.views, icon: Eye, color: 'text-blue-500' },
            { label: 'Booking Requests', value: stats.bookings, icon: Star, color: 'text-gold' },
            { label: 'Rating', value: stats.rating > 0 ? stats.rating.toFixed(1) : '—', icon: Star, color: 'text-amber-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border/50 p-5"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-foreground">Your Profile</h2>
            <button
              onClick={() => navigate('/guide-onboarding')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-gold/20 flex items-center justify-center">
                <User className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="font-heading font-bold text-foreground">{profile?.full_name || '—'}</p>
                <p className="font-body text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: 'City', value: profile?.city || '—', icon: MapPin },
                { label: 'Account Type', value: roleLabel, icon: User },
                { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—', icon: Clock },
                { label: 'Status', value: isApproved ? 'Active' : 'Pending', icon: CheckCircle },
              ].map((item) => (
                <div key={item.label} className="bg-muted/40 rounded-xl p-3">
                  <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-body text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {profile?.bio && (
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="font-body text-xs text-muted-foreground mb-1">Bio</p>
                <p className="font-body text-sm text-foreground">{profile.bio}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Next Steps */}
        {!isApproved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border/50 p-6"
          >
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Next Steps</h2>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Complete your profile with a bio and city', done: !!profile?.bio },
                { step: '2', text: 'Wait for admin approval (1-2 business days)', done: false },
                { step: '3', text: 'Start receiving booking requests from travelers', done: false },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.done ? '✓' : item.step}
                  </div>
                  <p className={`font-body text-sm ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
