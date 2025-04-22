"use client";
import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import OAuthButtons from "@/components/AuthButtons";
import { Client, Account } from "appwrite";
import { useEffect } from "react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function dologin() {
    const client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject("67ef5621003d5fdb528d");

    const account = new Account(client);
    const curSession = account.getSession("current");

    const user = await account
      .get()
      .then((user) => {
        // Has existing session
        console.log(`Existing Session: ${JSON.stringify(user)}`);
        return user;
      })
      .catch((err) =>
        (async () => {
          // No existing session. Login
          const user = await account.createEmailPasswordSession(
            email,
            password,
          );
          console.log(`Session: ${JSON.stringify(user)}`);
          return user;
        })(),
      );

    const jwt = await account.createJWT();
    console.log(`JWT: ${JSON.stringify(jwt)}`);

    fetch("/api/v1/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt.jwt}`,
      },
    })
      .then((res) => res.text())
      .then((body) => {
        alert(`Server responded: ${body}`);
      });
  }

  return (
    <div className="login-page">
      <div className="logo-container">
        <Link href="/">
          <img
            className="logo-img"
            src="/logoWhite.svg"
            alt="logo"
            width={120}
            height={40}
          />
        </Link>
      </div>
      <div className="login-container">
        <h2 className="login-title">Welcome back!</h2>
        <p className="login-subtitle">Please enter your details</p>

        <form className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="pass-input-div">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <FaEyeSlash
                className="toggle-icon"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <FaEye
                className="toggle-icon"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          <div className="login-options">
            <div className="remember-me">
              <input type="checkbox" id="remember-checkbox" />
              <label htmlFor="remember-checkbox">Remember me</label>
            </div>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <div className="login-buttons">
            <button
              type="button"
              onClick={dologin}
              className="btn-login"
            >
              Login
            </button>
            <OAuthButtons />
          </div>
        </form>
        <p className="login-footer">
          Have no account? <Link href="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
