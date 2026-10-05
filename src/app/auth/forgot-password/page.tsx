'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import TurnstileWidget from '@/components/TurnstileWidget';
import { TURNSTILE_ENABLED } from '@/lib/turnstile-config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [resetSignal, setResetSignal] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
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
      
      const response = await axios.post('/api/auth/forgot-password', {
        email,
        turnstileToken,
      });
      setMessage(response.data.message);
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
      setTurnstileToken('');
      setResetSignal((value) => value + 1);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="page-title mb-6 text-center">Forgot Password</h1>
        
        {message && (
          <div className="alert-success mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="field-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field mt-1"
              required
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center help">
          Remember your password?{' '}
          <Link href="/auth/signin" className="link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}