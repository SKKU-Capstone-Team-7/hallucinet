'use client'; 

import Link from "next/link";
import "../styles/landing.css"; 

export default function Landing() {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <h1 className="landing-title">Test Landing Page!!!</h1>
        <p className="landing-subtitle">
         Testing!!!
        </p>

        <div className="landing-buttons">
          <Link href="/login" className="landing-btn login">Log In</Link>
          <Link href="/register" className="landing-btn register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
