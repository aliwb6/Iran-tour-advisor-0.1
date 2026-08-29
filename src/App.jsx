import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import GuideOnboarding from '@/pages/GuideOnboarding';
import { I18nProvider } from '@/lib/i18n.jsx';
import { ThemeProvider } from '@/lib/ThemeContext.jsx';

import Layout from '@/components/layout/Layout';
// Home is the landing route — kept eager so first paint never waits on a chunk.
import Home from '@/pages/Home';

// Heavy / secondary routes are code-split so they don't bloat the initial bundle.
const Tours = lazy(() => import('@/pages/Tours'));
const TourDetails = lazy(() => import('@/pages/TourDetails'));
const PackageDetails = lazy(() => import('@/pages/PackageDetails'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const Guides = lazy(() => import('@/pages/Guides'));
const Agencies = lazy(() => import('@/pages/Agencies'));
const GuideDetails = lazy(() => import('@/pages/GuideDetails'));
const AgencyProfile = lazy(() => import('@/pages/AgencyProfile'));
const TripRequest = lazy(() => import('@/pages/TripRequest'));
const AIAssistant = lazy(() => import('@/pages/AIAssistant'));
const About = lazy(() => import('@/pages/About'));
const Blog = lazy(() => import('@/pages/Blog'));
const ArticleDetails = lazy(() => import('@/pages/ArticleDetails'));
const Chat = lazy(() => import('@/pages/Chat'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/profile/SettingsPage'));
const RequestsPage = lazy(() => import('@/pages/profile/RequestsPage'));
const CityPage = lazy(() => import('@/pages/CityPage'));
const FindJobs = lazy(() => import('@/pages/FindJobs'));
const MyTripRequests = lazy(() => import('@/pages/MyTripRequests'));
const RequestDetailPage = lazy(() => import('@/pages/profile/RequestDetailPage'));
const Signup = lazy(() => import('@/pages/Signup'));
const Login = lazy(() => import('@/pages/Login'));
const Destinations = lazy(() => import('@/pages/Destinations'));
const Search = lazy(() => import('@/pages/Search'));

import { NotificationsProvider } from '@/lib/NotificationsContext';

function RouteFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center">
        <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
      </div>
    </div>
  );
}

function TripRequestsRedirect() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-accent animate-spin border-t-transparent" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ALL roles (tourist, guide, agency) go to /profile/requests — the tourist-style trip request page
  // Guides use this page as travelers when they want to book a tour for themselves
  return <Navigate to="/profile/requests" replace />;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center">
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
          </div>
          <span className="font-body text-sm text-muted-foreground">Iran Trip Advisor</span>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:slug" element={<TourDetails />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:id" element={<GuideDetails />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/agencies/:id" element={<AgencyProfile />} />
          <Route path="/request-trip/:guideId" element={<TripRequest />} />
          <Route path="/request-trip/agency/:guideId" element={<TripRequest />} />
          <Route path="/agencies/:id" element={<AgencyProfile />} />
          <Route path="/request-trip/:guideId" element={<TripRequest />} />
          <Route path="/request-trip/agency/:guideId" element={<TripRequest />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<ArticleDetails />} />
          <Route path="/destinations/:citySlug" element={<CityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/settings" element={<SettingsPage />} />

          <Route path="/profile/requests" element={<RequestsPage />} />
          <Route path="/find-jobs" element={<FindJobs />} />
          <Route path="/my-trips" element={<MyTripRequests />} />
          <Route path="/profile/requests/:id" element={<RequestDetailPage />} />
          <Route path="/find-jobs" element={<FindJobs />} />
          <Route path="/my-trips" element={<MyTripRequests />} />
        </Route>
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/guide-onboarding" element={<GuideOnboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:section" element={<Dashboard />} />
        <Route path="/chat/:guideId" element={<Chat />} />
        <Route path="/trip-requests" element={<TripRequestsRedirect />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <QueryClientProvider client={queryClientInstance}>
          <ThemeProvider>
            <I18nProvider>
              <Router>
                <AuthenticatedApp />
              </Router>
              <Toaster />
              <SonnerToaster richColors position="top-right" />
            </I18nProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </NotificationsProvider>
    </AuthProvider>
  )
}

export default App
