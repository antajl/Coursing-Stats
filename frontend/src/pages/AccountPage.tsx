import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/authApi';
import { getDogProfile } from '../lib/staticData';
import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';

interface Dog {
  id: string;
  name_lat: string;
  name_ru: string;
  breed: string;
}

export default function AccountPage() {
  const { user, logout, isAuthenticated, deleteAccount, setUser } = useAuth();
  const [favorites, setFavorites] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkProvider, setLinkProvider] = useState('');
  const [linkProviderUserId, setLinkProviderUserId] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linking, setLinking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle OAuth callback token - check on mount only
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const linkAccount = params.get('link_account');
    
    console.log('AccountPage useEffect - token from URL:', token ? token.substring(0, 10) + '...' : 'null');
    console.log('Current localStorage token:', localStorage.getItem('auth_token')?.substring(0, 10) + '...');
    
    if (linkAccount === 'true') {
      console.log('Account linking needed');
      setLinkEmail(params.get('email') || '');
      setLinkProvider(params.get('provider') || '');
      setLinkProviderUserId(params.get('provider_user_id') || '');
      setShowLinkModal(true);
      // Remove link parameters from URL
      window.history.replaceState({}, '', '/account');
    } else if (token) {
      console.log('Setting token from OAuth...');
      authApi.setTokenFromOAuth(token);
      // Remove token from URL
      window.history.replaceState({}, '', '/account');
      // Refresh session instead of reloading page
      console.log('Refreshing session...');
      authApi.refreshSession().then(userData => {
        if (userData) {
          console.log('Session refreshed successfully, user:', userData);
          setUser(userData);
        } else {
          console.log('Session refresh failed');
        }
      });
    } else {
      console.log('No token in URL, checking existing token...');
    }
  }, [setUser]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadFavorites = async () => {
      try {
        const { favorites: favoriteIds } = await authApi.getFavorites();
        
        // Load dog profiles for each favorite
        const dogProfiles = await Promise.all(
          favoriteIds.map(async (id) => {
            try {
              const dog = await getDogProfile(id);
              if (dog.success && dog.data) {
                return { id, ...dog.data } as Dog;
              }
              return null;
            } catch {
              return null;
            }
          })
        );

        setFavorites(dogProfiles.filter((d): d is Dog => d !== null));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  const handleRemoveFavorite = async (dogId: string) => {
    setRemoving(dogId);
    try {
      await authApi.removeFavorite(dogId);
      setFavorites(favorites.filter(d => d.id !== dogId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Не удалось удалить аккаунт: ' + (error as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const handleLinkAccount = async () => {
    setLinking(true);
    try {
      const response = await fetch('https://auth-worker.antajltube.workers.dev/v1/oauth/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: linkEmail,
          password: linkPassword,
          provider: linkProvider,
          provider_user_id: linkProviderUserId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to link account');
      }

      const data = await response.json();
      authApi.setTokenFromOAuth(data.token);
      setShowLinkModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to link account:', error);
      alert('Не удалось связать аккаунт: ' + (error as Error).message);
    } finally {
      setLinking(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal-900 dark:text-cream-100 mb-4">
            Войдите в аккаунт
          </h1>
          <Link
            to="/login"
            className="inline-block bg-camel-600 hover:bg-camel-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900 dark:text-cream-100 mb-2">
          Профиль
        </h1>
        <p className="text-charcoal-600 dark:text-cream-300">
          {user?.display_name} ({user?.email})
        </p>
      </div>

      <div className="mb-8 flex gap-4">
        <button
          onClick={handleLogout}
          className="text-charcoal-600 dark:text-cream-300 hover:text-charcoal-900 dark:hover:text-cream-100 transition-colors"
        >
          Выйти из аккаунта
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-800 dark:hover:text-terracotta-300 transition-colors"
        >
          Удалить аккаунт
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 dark:text-cream-100 mb-4">
          Избранные собаки
        </h2>

        {loading ? (
          <div className="text-charcoal-600 dark:text-cream-300">Загрузка...</div>
        ) : favorites.length === 0 ? (
          <div className="bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-600 rounded-lg p-8 text-center">
            <Star className="w-12 h-12 text-charcoal-400 dark:text-charcoal-500 mx-auto mb-4" />
            <p className="text-charcoal-700 dark:text-cream-300 mb-4">
              У вас пока нет избранных собак
            </p>
            <Link
              to="/competitions"
              className="inline-block bg-camel-600 hover:bg-camel-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Найти собак
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {favorites.map((dog) => (
              <div
                key={dog.id}
                className="bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg p-4 flex items-center justify-between"
              >
                <Link
                  to={`/dog/${dog.id}`}
                  className="flex-1"
                >
                  <h3 className="font-semibold text-charcoal-900 dark:text-cream-100">
                    {dog.name_lat}
                  </h3>
                  <p className="text-sm text-charcoal-600 dark:text-cream-300">
                    {dog.name_ru}
                  </p>
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                    {dog.breed}
                  </p>
                </Link>
                <button
                  onClick={() => handleRemoveFavorite(dog.id)}
                  disabled={removing === dog.id}
                  className="ml-4 p-2 text-charcoal-500 hover:text-terracotta-600 dark:text-charcoal-400 dark:hover:text-terracotta-500 transition-colors disabled:opacity-50"
                  title="Удалить из избранного"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Linking Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-cream-100 mb-4">
              Связать аккаунт
            </h2>
            <p className="text-charcoal-600 dark:text-cream-300 mb-4">
              Аккаунт с email {linkEmail} уже существует. Хотите связать его с {linkProvider}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal-700 dark:text-cream-300 mb-2">
                Пароль (если есть)
              </label>
              <input
                type="password"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                className="w-full px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100"
                placeholder="Введите пароль для подтверждения"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLinkAccount}
                disabled={linking}
                className="flex-1 bg-camel-600 hover:bg-camel-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {linking ? 'Связывание...' : 'Связать'}
              </button>
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 bg-charcoal-200 hover:bg-charcoal-300 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-charcoal-900 dark:text-cream-100 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-cream-100 mb-4">
              Удалить аккаунт
            </h2>
            <p className="text-charcoal-600 dark:text-cream-300 mb-4">
              Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить. Все ваши данные, включая избранные собаки, будут удалены.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Удаление...' : 'Удалить'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-charcoal-200 hover:bg-charcoal-300 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-charcoal-900 dark:text-cream-100 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
