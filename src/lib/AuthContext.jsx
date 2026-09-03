import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/supabaseClient';

const AuthContext = createContext(null);
const profileRequests = new Map();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({});

  const fetchProfile = useCallback(async (userId) => {
    if (!profileRequests.has(userId)) {
      const request = Promise.resolve(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
      ).finally(() => profileRequests.delete(userId));
      profileRequests.set(userId, request);
    }

    const { data, error } = await profileRequests.get(userId);
    if (!error && data) setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    // وضعیت session رو چک کن
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchProfile(session.user.id);
        }
      })
      .catch(() => setAuthError({ type: 'session_check_failed' }))
      .finally(() => {
        setIsLoadingAuth(false);
        setAuthChecked(true);
      });

    // گوش بده به تغییرات auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/signup';
  };

  const checkAppState = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setIsAuthenticated(true);
      fetchProfile(session.user.id);
    }
  };

  const checkUserAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setIsAuthenticated(true);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,          // اطلاعات کامل کاربر + role
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
      fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
