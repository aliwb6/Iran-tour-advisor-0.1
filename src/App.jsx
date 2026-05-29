import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import GuideOnboarding from '@/pages/GuideOnboarding';
import { I18nProvider } from '@/lib/i18n.jsx';
import { ThemeProvider } from '@/lib/ThemeContext.jsx';

import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Tours from '@/pages/Tours';
import TourDetails from '@/pages/TourDetails';
import PackageDetails from '@/pages/PackageDetails';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Guides from '@/pages/Guides';
import Agencies from '@/pages/Agencies';
import GuideDetails from '@/pages/GuideDetails';
import AgencyProfile from '@/pages/AgencyProfile';
import TripRequest from '@/pages/TripRequest';
import AIAssistant from '@/pages/AIAssistant';
import About from '@/pages/About';
import Blog from '@/pages/Blog';
import ArticleDetails from '@/pages/ArticleDetails';
import Chat from '@/pages/Chat';
import ProfilePage from '@/pages/profile/ProfilePage';
import SettingsPage from '@/pages/profile/SettingsPage';
import BookingsPage from '@/pages/profile/BookingsPage';
import RequestsPage from '@/pages/profile/RequestsPage';
import CityPage from '@/pages/CityPage';
import FindJobs from '@/pages/FindJobs';
import MyTripRequests from '@/pages/MyTripRequests';
import RequestDetailPage from '@/pages/profile/RequestDetailPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center">
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
          </div>
          <span className="font-body text-sm text-muted-foreground">Iran Tour Advisor</span>
        </div>
      </div>
    );
  }

  return (
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
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<ArticleDetails />} />
        <Route path="/destinations/:citySlug" element={<CityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<SettingsPage />} />
        <Route path="/profile/bookings" element={<BookingsPage />} />
        <Route path="/profile/requests" element={<RequestsPage />} />
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
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App