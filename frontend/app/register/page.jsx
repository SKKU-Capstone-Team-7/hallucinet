'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import OAuthButtons from '@/components/AuthButtons';
import { Client, Account, ID } from 'appwrite';
import '@/styles/Register.css';
import { toast, Bounce } from 'react-toastify';

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');


  const allFieldsFilled =
    form.name.trim() &&
    form.lastname.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    form.confirmPassword.trim();

  const passwordsMatch = form.password === form.confirmPassword;

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const apiBase  = process.env.NEXT_PUBLIC_API_BASE_URL;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function doRegister() {
    const client  = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);
  
    
    await account.create(
      ID.unique(),
      form.email,
      form.password,
      `${form.name} ${form.lastname}`
    );
  
    
    await account.createEmailPasswordSession(form.email, form.password);
      
    const profile = await account.get();
  
    const { jwt } = await account.createJWT();
    
    const url = `${apiBase}/users/me`;
    console.log('Posting to:', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({ appwriteId: profile.$id }),
    });
  
    const text = await res.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
    console.log('Response status:', res.status, res.statusText);
    console.log('Response body:', payload);
  
    if (!res.ok) {
      const msg = typeof payload === 'object'
        ? payload.message || JSON.stringify(payload)
        : payload;
      throw new Error(msg || `DB error ${res.status}`);
    }
  
    return profile;
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!allFieldsFilled) {
      setError('All fields are required');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    try {
      const profile = await doRegister();
      toast.success(`Welcome, ${profile.name || profile.email}!`, { transition: Bounce });
      router.push('/onboarding');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed');
    }
  }

  
  return (
    <div className="register-page">
      <div className="logo-container">
        <Link href="/">
          <img
            className="logo-img"
            src="/logoWhite.svg"
            alt="logo"
          />
        </Link>
      </div>

      <div className="register-container">
        <h2 className="register-title">Create an Account</h2>
        <p className="register-subtitle">
          Please enter your details
        </p>

        {error && <p className="error">{error}</p>}

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >
          <input
            name="name"
            type="text"
            placeholder="First Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="lastname"
            type="text"
            placeholder="Last Name"
            value={form.lastname}
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <div className="pass-input-div">
            <input
              name="password"
              type={
                showPassword ? 'text' : 'password'
              }
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            {showPassword ? (
              <FaEyeSlash
                onClick={() =>
                  setShowPassword(false)
                }
              />
            ) : (
              <FaEye
                onClick={() =>
                  setShowPassword(true)
                }
              />
            )}
          </div>

          <div className="pass-input-div">
            <input
              name="confirmPassword"
              type={
                showPassword ? 'text' : 'password'
              }
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {showPassword ? (
              <FaEyeSlash
                onClick={() =>
                  setShowPassword(false)
                }
              />
            ) : (
              <FaEye
                onClick={() =>
                  setShowPassword(true)
                }
              />
            )}
          </div>

          <button
            type="submit"
            className={`login-submit ${
              allFieldsFilled ? 'active' : ''
            }`}
            disabled={!allFieldsFilled}
          >
            Sign Up
          </button>
        </form>

        <OAuthButtons />

        <p className="register-footer">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
