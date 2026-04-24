import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../lib/services/auth/authService';
import { supabase } from '../lib/config/supabase';
import {
  parseAuthParamsFromUrl,
  applySessionFromAuthUrl,
} from '../lib/services/auth/passwordRecovery';
import { normalizeEmail } from '../lib/utils/authValidation';
import { STORAGE_PASSWORD_RECOVERY_PENDING } from '../lib/config/storageKeys';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

async function readRecoveryPendingFlag() {
  try {
    const v = await AsyncStorage.getItem(STORAGE_PASSWORD_RECOVERY_PENDING);
    return v === '1';
  } catch {
    return false;
  }
}

async function writeRecoveryPendingFlag(value) {
  try {
    if (value) {
      await AsyncStorage.setItem(STORAGE_PASSWORD_RECOVERY_PENDING, '1');
    } else {
      await AsyncStorage.removeItem(STORAGE_PASSWORD_RECOVERY_PENDING);
    }
  } catch (e) {
    console.warn('Recovery flag storage error:', e);
  }
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordRecoveryActive, setPasswordRecoveryActive] = useState(false);
  const passwordRecoveryActiveRef = useRef(false);

  const setRecoveryActive = useCallback(async (active) => {
    passwordRecoveryActiveRef.current = active;
    setPasswordRecoveryActive(active);
    await writeRecoveryPendingFlag(active);
  }, []);

  const hydrateUserFromSession = useCallback(async () => {
    const result = await authService.getCurrentUser();
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      return true;
    }
    setUser(null);
    setIsAuthenticated(false);
    return false;
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      const pending = (await readRecoveryPendingFlag()) || passwordRecoveryActiveRef.current;
      const { data: { session } } = await supabase.auth.getSession();

      if (pending && session) {
        await setRecoveryActive(true);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      if (pending && !session) {
        await setRecoveryActive(false);
      }

      if (!session) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      await hydrateUserFromSession();
    } catch (error) {
      console.error('Check auth error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [hydrateUserFromSession, setRecoveryActive]);

  const tryConsumeAuthUrl = useCallback(
    async (url) => {
      if (!url) return;
      const parsed = parseAuthParamsFromUrl(url);
      if (parsed?.type === 'recovery') {
        passwordRecoveryActiveRef.current = true;
      }

      const result = await applySessionFromAuthUrl(url);
      if (!result.ok) {
        if (parsed?.type === 'recovery') {
          passwordRecoveryActiveRef.current = false;
        }
        if (result.error) {
          console.warn('Auth URL session error:', result.error);
        }
        return;
      }

      if (result.isRecovery) {
        await setRecoveryActive(true);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      if (result.session) {
        await hydrateUserFromSession();
      }
    },
    [hydrateUserFromSession, setRecoveryActive]
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (mounted && initialUrl) {
        await tryConsumeAuthUrl(initialUrl);
      }
      if (mounted) {
        await checkAuth();
      }
    };

    bootstrap();

    const linkSub = Linking.addEventListener('url', ({ url }) => {
      void tryConsumeAuthUrl(url);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        passwordRecoveryActiveRef.current = true;
        await setRecoveryActive(true);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      if (event === 'SIGNED_OUT') {
        await setRecoveryActive(false);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        if (passwordRecoveryActiveRef.current) {
          return;
        }
        const result = await authService.getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      mounted = false;
      linkSub.remove();
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- single bootstrap + stable listeners
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        await setRecoveryActive(false);
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const result = await authService.signUp(email, password, name);
      if (!result.success) {
        return result;
      }

      // Do not call signIn here: with "confirm email" enabled, signUp returns no session and
      // signIn fails with "Email not confirmed" — and it doubles auth calls (rate limits).
      if (result.needsEmailConfirmation) {
        return {
          success: true,
          needsEmailConfirmation: true,
          message:
            'We sent a confirmation link to your email. Open it, then log in here.',
        };
      }

      let userResult = await authService.getCurrentUser();
      if (!userResult.success || !userResult.user) {
        for (let i = 0; i < 2; i++) {
          await new Promise((r) => setTimeout(r, 500));
          userResult = await authService.getCurrentUser();
          if (userResult.success && userResult.user) break;
        }
      }

      if (userResult.success && userResult.user) {
        await setRecoveryActive(false);
        setUser(userResult.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return {
        success: true,
        needsEmailConfirmation: true,
        message:
          'Account was created. If the app did not open your home screen, check your email to confirm, then log in.',
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      const result = await authService.signOut();
      if (result.success) {
        await setRecoveryActive(false);
        setUser(null);
        setIsAuthenticated(false);
      }
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) {
      return { success: false, error: 'Please enter your email' };
    }
    return authService.requestPasswordReset(normalized);
  };

  const completePasswordRecovery = async (newPassword) => {
    try {
      const result = await authService.updatePassword(newPassword);
      if (!result.success) {
        return result;
      }
      await setRecoveryActive(false);
      const userResult = await authService.getCurrentUser();
      if (userResult.success && userResult.user) {
        setUser(userResult.user);
        setIsAuthenticated(true);
      }
      return { success: true };
    } catch (error) {
      console.error('Complete password recovery error:', error);
      return { success: false, error: error.message || 'Failed to update password' };
    }
  };

  const cancelPasswordRecovery = async () => {
    try {
      await authService.signOut();
      await setRecoveryActive(false);
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Cancel password recovery error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    isAuthenticated,
    user,
    isAdmin: user?.role === 'admin',
    isLoading,
    passwordRecoveryActive,
    login,
    signup,
    logout,
    checkAuth,
    requestPasswordReset,
    completePasswordRecovery,
    cancelPasswordRecovery,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
