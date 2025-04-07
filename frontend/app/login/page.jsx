"use client";
import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import OAuthButtons from "@/components/AuthButtons";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Welcome back!</h2>
        <p className="login-subtitle">Please enter your details</p>

        <form className="login-form">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="pass-input-div">
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {showPassword ? <FaEyeSlash className="toggle-icon" onClick={() => setShowPassword(false)} /> : <FaEye className="toggle-icon" onClick={() => setShowPassword(true)} />}
          </div>

          <div className="login-options">
            <div className="remember-me">
              <input type="checkbox" id="remember-checkbox" />
              <label htmlFor="remember-checkbox">Remember me</label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <div className="login-buttons">
            <button type="button" className={`login-submit ${email && password ? 'active' : ''}`} disabled={!email || !password}>Log In</button>
            <OAuthButtons />
          </div>
        </form>

        <p className="login-footer">
          Don't have an account? <Link href="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
