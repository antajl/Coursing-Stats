import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=oauth_failed');
      return;
    }

    if (code) {
      // Forward the callback to the Auth Worker
      window.location.href = `https://auth-worker.antajltube.workers.dev/v1/oauth/yandex/callback?code=${code}`;
    } else {
      navigate('/login?error=no_code');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-camel-600 mx-auto"></div>
        <p className="mt-4 text-charcoal-600 dark:text-cream-300">Обработка авторизации...</p>
      </div>
    </div>
  );
}
