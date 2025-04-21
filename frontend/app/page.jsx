'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/landing.css'; // CSS 파일을 import

export default function Landing() {
  const mainWindowRef = useRef(null);
  const learnWindowRef = useRef(null);
  const contactUsWindowRef = useRef(null);

  return (
    <div className="landing-container">
      {/* 로고 추가 */}
      <div className="logo-container">
        <Image src="/logoWhite.svg" alt="logo" width={120} height={40} />
      </div>

      <div className="navigation">
        <button
          onClick={() => mainWindowRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="nav-button"
        >
          Home
        </button>
        <button
          onClick={() => learnWindowRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="nav-button"
        >
          Learn
        </button>
        <button
          onClick={() => contactUsWindowRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="nav-button"
        >
          Contact Us
        </button>
        <Link href="/register" className="sign-link">
          Sign In/Sign Up
        </Link>
      </div>

      <div ref={mainWindowRef} className="main-window">
        <div className="main-content">
          <div className="title-image">
            <Image src="/title.svg" alt="hallucinet title" width={600} height={200} />
          </div>
        </div>
      </div>

      <div ref={learnWindowRef} className="section learn-window">
        <div className="section-content">Learn Window</div>
      </div>

      {/* Contact Us 윈도우 */}
      <div ref={contactUsWindowRef} className="section contact-window">
        <div className="section-content">Contact Us Window</div>
      </div>
    </div>
  );
}
