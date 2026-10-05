'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TurnstileWidget from '@/components/TurnstileWidget';
import { TURNSTILE_ENABLED } from '@/lib/turnstile-config';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [resetSignal, setResetSignal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Please complete the bot check');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        turnstileToken,
      });
      
      if (result?.error) {
        setError(
          result.error.includes('Bot check')
            ? result.error
            : 'Invalid email or password'
        );
        return;
      }
      
      // Redirect to home page on successful login
      router.push('/workspace');
      router.refresh();
    } catch (error) {
      setError('An error occurred during sign in');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
      setTurnstileToken('');
      setResetSignal((value) => value + 1);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="page-title mb-6 text-center">Sign In</h1>
        
        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder='Registered email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field mt-1"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center help">
          <Link href="/auth/forgot-password" className="link">
            Forgot your password?
          </Link>
        </div>
        
        <div className="mt-6 text-center help">
          Don't have an account?{' '}
          <Link href="/auth/register" className="link">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
} 