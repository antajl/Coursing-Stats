import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageLoader from '../components/PageLoader';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Токен не указан');
      return;
    }

    fetch(`https://auth-worker.antajltube.workers.dev/v1/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Ошибка подтверждения');
        }
      })
      .catch(err => {
        setStatus('error');
        setMessage('Ошибка соединения');
      });
  }, [searchParams]);

  if (status === 'loading') {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-old-money-200">
        {status === 'success' ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-old-money-900 mb-3">Email подтвержден</h1>
            <p className="text-old-money-600 mb-8 text-lg">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-6 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors font-medium text-lg"
            >
              Войти в аккаунт
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-old-money-900 mb-3">Ошибка</h1>
            <p className="text-old-money-600 mb-8 text-lg">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-6 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors font-medium text-lg"
            >
              На страницу входа
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
