'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/landing.css';

export default function Landing() {
  const mainWindowRef = useRef(null);
  const learnWindowRef = useRef(null);
  const contactUsWindowRef = useRef(null);

  return (
    <div className="landing-container">
      <div className="logo-container">
        <Image className="logo-img" src="/logoWhite.svg" alt="logo" width={120} height={40} />
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
        <Link href="/login" className="sign-link">
          Get started
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
        <div className="left-pane">
          <h1 className="hero-text">
            Skip the chaos.<br />
            Connect containers,
            effortlessly.
          </h1>
        </div>

        <div className="right-pane">
          <div className="feature-block">
            <h2 className="feature-title purple">One Network. All Devices.</h2>
            <p className="feature-desc">
              Connect all team members' devices and containers in one secure network.
            </p>
          </div>
          <div className="feature-block">
            <h2 className="feature-title blue">Clear Visibility,<br />Zero Guesswork</h2>
            <p className="feature-desc">
              Check where and what containers are circulating at a glance.
            </p>
          </div>
          <div className="feature-block">
            <h2 className="feature-title green">No More Setup Struggles</h2>
            <p className="feature-desc">
              Port forwarding, IP conflicts, network configuration…<br />
              You can forget everything. Just focus on development.
            </p>
          </div>
        </div>
      </div>

      <div ref={contactUsWindowRef} className="section contact-window">
        <div className="contact-container">
          <h1 className="contact-hero">Let’s Talk.</h1>
          <div className="contact-grid">
            <form 
              className="contact-form"
              action="https://formsubmit.co/nahyun1492@gmail.com" 
              method="POST"
            >
              <input type="text" name="name" placeholder="Your name" required />
              <input type="email" name="email" placeholder="Your email" required />
              <textarea name="message" rows="5" placeholder="Your message" required />
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
