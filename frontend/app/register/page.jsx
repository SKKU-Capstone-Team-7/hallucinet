'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, generateId } from '@/lib/appwrite';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import Link from 'next/link';
import OAuthButtons from '@/components/AuthButtons';
import '@/styles/Register.css';

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

  const isFormValid =
    form.name &&
    form.lastname &&
    form.email &&
    form.password &&
    form.password === form.confirmPassword;

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await account.create(
        generateId(),
        form.email,
        form.password,
        `${form.name} ${form.lastname}`
      );
      await account.createEmailPasswordSession(
        form.email,
        form.password
      );
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="register-page">
      <div className="logo-container">
        <Link href="/">
          <img className="logo-img" src="/logoWhite.svg" alt="logo" />
        </Link>
      </div>

      <div className="register-container">
        <h2 className="register-title">Create an Account</h2>
        <p className="register-subtitle">Please enter your details</p>

        {error && <p className="error">{error}</p>}

        <form className="register-form" onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            placeholder="Name"
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
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            {showPassword
              ? <FaEyeSlash onClick={() => setShowPassword(false)} />
              : <FaEye      onClick={() => setShowPassword(true)}  />
            }
          </div>

          <div className="pass-input-div">
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {showPassword
              ? <FaEyeSlash onClick={() => setShowPassword(false)} />
              : <FaEye      onClick={() => setShowPassword(true)}  />
            }
          </div>

          <button
            type="submit"
            className={`register-button ${isFormValid ? 'active' : ''}`}
            disabled={!isFormValid}
          >
            Sign Up
          </button>
        </form>
        <OAuthButtons />
        <p className="register-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
