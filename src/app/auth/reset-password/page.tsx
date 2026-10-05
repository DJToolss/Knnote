'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import TurnstileWidget from '@/components/TurnstileWidget';
import { TURNSTILE_ENABLED } from '@/lib/turnstile-config';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [resetSignal, setResetSignal] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Please complete the bot check');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password,
        turnstileToken,
      });
      
      setMessage(response.data.message);
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
      setTurnstileToken('');
      setResetSignal((value) => value + 1);
    }
  };

  if (!token && !error) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="help text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="page-title mb-6 text-center">Reset Password</h1>
        
        {message && (
          <div className="alert-success mb-4">
            {message}
            <div className="mt-2 text-sm">Redirecting to sign in...</div>
          </div>
        )}
        
        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}
        
        {token && !message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="field-label">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field mt-1"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="field-label">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="field mt-1"
                required
                minLength={6}
              />
            </div>

            {TURNSTILE_ENABLED && (
              <TurnstileWidget onVerify={setTurnstileToken} resetSignal={resetSignal} />
            )}
            
            <div>
              <button
                type="submit"
                disabled={loading || (TURNSTILE_ENABLED && !turnstileToken)}
                className="btn-primary w-full disabled:opacity-70"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-6 text-center help">
          <Link href="/auth/signin" className="link">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="auth-shell">
        <div className="auth-card">
          <div className="help text-center">Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}