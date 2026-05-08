import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { I18nProvider } from '@/lib/i18n.jsx';
import { ThemeProvider } from '@/lib/ThemeContext.jsx';

import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Tours from '@/pages/Tours';
import Guides from '@/pages/Guides';
import CustomTrip from '@/pages/CustomTrip';
import AIAssistant from '@/pages/AIAssistant';
import About from '@/pages/About';
import Blog from '@/pages/Blog';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
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

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/custom-trip" element={<CustomTrip />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
      </Route>
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
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App