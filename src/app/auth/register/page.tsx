'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import TurnstileWidget from '@/components/TurnstileWidget';
import { TURNSTILE_ENABLED } from '@/lib/turnstile-config';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [resetSignal, setResetSignal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Please complete the bot check');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Register the user
      await axios.post('/api/auth/register', {
        name,
        email,
        password,
        turnstileToken,
      });
      
      // Redirect to sign in page after successful registration
      router.push('/auth/signin?registered=true');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
      setTurnstileToken('');
      setResetSignal((value) => value + 1);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="page-title mb-6 text-center">Register</h1>
        
        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="field-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder='Your Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field mt-1"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder='Your Email'
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
          
          <div>
            <label htmlFor="confirmPassword" className="field-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder='confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center help">
          Already have an account?{' '}
          <Link href="/auth/signin" className="link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 