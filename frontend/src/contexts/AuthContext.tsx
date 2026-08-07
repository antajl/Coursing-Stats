import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '../lib/authApi';
import { createLogger } from '../lib/logging';

const authLogger = createLogger('auth');

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<{ requires_verification?: boolean; message?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_FAVORITES_KEY = 'coursing_favorites';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    authLogger.info('Login initiated', { email });
    const response = await authApi.login(email, password);
    setUser({ id: response.user_id, email, display_name: response.display_name, created_at: '' });
    
    // Merge localStorage favorites to cloud
    await mergeLocalStorageFavorites();
    authLogger.info('Login successful', { userId: response.user_id });
  };

  const register = async (email: string, password: string, displayName: string) => {
    authLogger.info('Registration initiated', { email, displayName });
    const response = await authApi.register(email, password, displayName);
    
    if (response.requires_verification) {
      authLogger.info('Registration requires verification', { email });
      // Don't set user if verification is required
      return { requires_verification: true, message: response.message };
    }
    
    setUser({ id: response.user_id, email, display_name: response.display_name, created_at: '' });
    
    // Merge localStorage favorites to cloud
    await mergeLocalStorageFavorites();
    
    authLogger.info('Registration successful', { userId: response.user_id });
    return { requires_verification: false };
  };

  const logout = async () => {
    authLogger.info('Logout initiated', { userId: user?.id });
    try {
      await authApi.logout();
      authLogger.info('Logout successful', { userId: user?.id });
    } catch (error) {
      authLogger.error('Logout API failed', error as Error, { userId: user?.id });
      // Continue with local logout even if API fails
    } finally {
      // Always clear user state and redirect
      setUser(null);
      window.location.href = '/';
    }
  };

  const deleteAccount = async () => {
    authLogger.info('Delete account initiated', { userId: user?.id });
    try {
      await authApi.deleteAccount();
      authLogger.info('Delete account successful', { userId: user?.id });
      // Only clear user state and redirect on success
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      authLogger.error('Delete account API failed', error as Error, { userId: user?.id });
      throw error;
    }
  };

  const mergeLocalStorageFavorites = async () => {
    const localFavorites = getLocalStorageFavorites();
    if (localFavorites.length === 0) return;

    try {
      // Add each local favorite to cloud
      for (const dogId of localFavorites) {
        await authApi.addFavorite(dogId);
      }
      // Clear localStorage after successful merge
      localStorage.removeItem(LOCAL_STORAGE_FAVORITES_KEY);
    } catch (error) {
      console.error('Failed to merge favorites:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    deleteAccount,
    setUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// LocalStorage favorites for guests
export function getLocalStorageFavorites(): string[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addLocalStorageFavorite(dogId: string): void {
  const favorites = getLocalStorageFavorites();
  if (!favorites.includes(dogId)) {
    favorites.push(dogId);
    localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeLocalStorageFavorite(dogId: string): void {
  const favorites = getLocalStorageFavorites();
  const filtered = favorites.filter(id => id !== dogId);
  localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(filtered));
}

export function isLocalStorageFavorite(dogId: string): boolean {
  const favorites = getLocalStorageFavorites();
  return favorites.includes(dogId);
}
