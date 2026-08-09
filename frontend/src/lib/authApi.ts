const AUTH_API_URL = 'https://auth-worker.antajltube.workers.dev/v1';
const TOKEN_KEY = 'auth_token';

export interface User {
  id: string;
  email: string;
  display_name: string;
  /** ISO string, unix seconds/ms, or empty — auth-worker shape varies */
  created_at: string | number;
  /** false for Yandex-only accounts until password is set */
  has_password?: boolean;
  auth_provider?: 'oauth' | 'password';
}

export interface AuthResponse {
  user_id: string;
  display_name: string;
}

export interface RegisterResponse extends AuthResponse {
  requires_verification?: boolean;
  message?: string;
  token?: string;
}

export interface ErrorResponse {
  error: string;
}

// Get token from localStorage
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Set token in localStorage
function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Clear token from localStorage
function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Helper to make authenticated requests
async function authFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${AUTH_API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    let errorCode: string | undefined;
    try {
      const error: ErrorResponse & { code?: string } = await response.json();
      errorMessage = error.error || errorMessage;
      errorCode = error.code;
    } catch {
      errorMessage = (await response.text()) || errorMessage;
    }
    if (response.status === 401) {
      // Don't clear token on login failures — only on authenticated endpoints
      const isAuthEndpoint =
        url.startsWith('/auth/login') ||
        url.startsWith('/auth/register') ||
        url.startsWith('/auth/forgot') ||
        url.startsWith('/auth/reset');
      if (!isAuthEndpoint) clearToken();
    }
    const err = new Error(errorMessage) as Error & { code?: string };
    if (errorCode) err.code = errorCode;
    throw err;
  }

  return response.json();
}

export const authApi = {
  // Register
  async register(email: string, password: string, displayName: string): Promise<RegisterResponse> {
    const response = await authFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName }),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  // Login
  async login(email: string, password: string): Promise<AuthResponse & { token: string }> {
    const response = await authFetch<AuthResponse & { token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(response.token);
    return response;
  },

  // Logout
  async logout(): Promise<{ success: boolean }> {
    const response = await authFetch<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
    clearToken();
    return response;
  },

  // Delete account
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const response = await authFetch<{ success: boolean; message: string }>('/auth/account', {
      method: 'DELETE',
    });
    clearToken();
    return response;
  },

  // Get current user
  async getMe(): Promise<User> {
    const token = getToken();
    if (!token) {
      throw new Error('No token available');
    }
    return authFetch<User>('/me');
  },

  // Refresh session - validate token and get user data
  async refreshSession(): Promise<User | null> {
    const token = getToken();
    if (!token) {
      return null;
    }
    try {
      return await this.getMe();
    } catch (error) {
      return null;
    }
  },

  // Set token from OAuth callback
  setTokenFromOAuth(token: string): void {
    setToken(token);
  },

  // Update display name
  async updateMe(displayName: string): Promise<{ display_name: string }> {
    return authFetch<{ display_name: string }>('/me', {
      method: 'PATCH',
      body: JSON.stringify({ display_name: displayName }),
    });
  },

  async setPassword(password: string): Promise<{ success: boolean; message: string }> {
    return authFetch<{ success: boolean; message: string }>('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  async forgotPassword(email: string): Promise<{
    message: string
    email_sent?: boolean
    mail_configured?: boolean
    code?: string
  }> {
    return authFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    return authFetch<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  // Get favorites
  async getFavorites(): Promise<{ favorites: string[] }> {
    return authFetch<{ favorites: string[] }>('/me/favorites');
  },

  // Add favorite
  async addFavorite(dogId: string): Promise<{ success: boolean }> {
    return authFetch<{ success: boolean }>(`/me/favorites/${dogId}`, {
      method: 'PUT',
    });
  },

  // Remove favorite
  async removeFavorite(dogId: string): Promise<{ success: boolean }> {
    return authFetch<{ success: boolean }>(`/me/favorites/${dogId}`, {
      method: 'DELETE',
    });
  },
};
