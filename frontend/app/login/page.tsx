'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import OAuthButtons from '@/components/AuthButtons';
import { Client, Account } from 'appwrite';
import '@/styles/Login.css';

export default function Login() {
  const router = useRouter();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const project  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

  function getAccount() {
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(project);
    return new Account(client);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const account = getAccount();

    try {
      await account.get();  
      router.push('/dashboard');
      return;
    } catch (getErr) {
    }

    try {
      await account.createEmailPasswordSession(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message.includes('prohibited when a session is active')
      ) {
        router.push('/dashboard');
      } else {
        console.error(err);
        setError(err.message || 'Login failed.');
      }
    }
  };

  const canSubmit = Boolean(email && password);

  return (
    <div className="login-page">
      <div className="logo-container">
        <Link href="/"><img className="logo-img" src="/logoWhite.svg" alt="logo" /></Link>
      </div>

      <div className="login-container">
        <h2 className="login-title">Welcome back!</h2>
        <p className="login-subtitle">Please enter your details</p>
        {error && <p className="error">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <div className="pass-input-div">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {showPassword
              ? <FaEyeSlash onClick={() => setShowPassword(false)} className="toggle-icon"/>
              : <FaEye      onClick={() => setShowPassword(true)}  className="toggle-icon"/>
            }
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <div className="login-buttons">
            <button
              type="submit"
              className={`login-submit ${canSubmit ? 'active' : ''}`}
              disabled={!canSubmit}
            >
              Login
            </button>
            <OAuthButtons />
          </div>
        </form>

        <p className="login-footer">
          Don’t have an account? <Link href="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
