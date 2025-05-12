'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import OAuthButtons from '@/components/AuthButtons';
import { Client, Account } from 'appwrite';
import '@/styles/Login.css';
import { toast, Bounce } from 'react-toastify';

export default function Login() {
  const router = useRouter();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const canSubmit = email.trim() !== '' && password.trim() !== '';

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const project  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

  async function dologin() {
    const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)

    const account = new Account(client)
    const curSession = account.getSession("current")

    const user = await account.get()
    .then(user =>  {
      console.log(`Existing Session: ${JSON.stringify(user)}`)
      return user
      }
    ).catch(err => (async () => {
        const user = await account.createEmailPasswordSession(email, password)
        console.log(`Session: ${JSON.stringify(user)}`)
        return user
      })()
    )

    const jwt = await account.createJWT()
    console.log(`JWT: ${JSON.stringify(jwt)}`)

    fetch('/api/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    }).then(res => res.text())
      .then(body => {
        alert(`Server responded: ${body}`)
      })
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await dologin();
      toast.success('Login successful!', { transition: Bounce });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password');
    }
  }


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
