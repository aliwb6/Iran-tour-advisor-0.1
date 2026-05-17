import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);
  const { profile, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-7xl font-light text-muted-foreground/30">404</h1>
        <div>
          <h2 className="text-2xl font-medium text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The page "{pageName}" could not be found.
          </p>
        </div>
        {isAuthenticated && profile?.role === 'admin' && (
          <div className="p-4 bg-muted rounded-lg text-sm text-left">
            <p className="font-medium">Admin Note: This page may not be implemented yet.</p>
          </div>
        )}
        <Link to="/" className="inline-block px-6 py-3 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent/90 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
