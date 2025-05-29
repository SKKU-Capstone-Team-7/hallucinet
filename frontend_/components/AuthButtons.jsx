"use client";
import React from 'react';
import "../styles/AuthButtons.css";
import { FaApple, FaGithub, FaGoogle, FaMicrosoft } from 'react-icons/fa';

const OAuthButtons = () => {
  const handleClick = (provider) => {
    console.log(`Clicked: ${provider}`);
  };

  return (
    <div className="oauth-container">
      <div className="oauth-button" onClick={() => handleClick("Apple")}>
        <FaApple size={22} />
      </div>
      <div className="oauth-button" onClick={() => handleClick("GitHub")}>
        <FaGithub size={22} />
      </div>
      <div className="oauth-button" onClick={() => handleClick("Google")}>
        <FaGoogle size={22} />
      </div>
      <div className="oauth-button" onClick={() => handleClick("Microsoft")}>
        <FaMicrosoft size={22} />
      </div>
    </div>
  );
};

export default OAuthButtons;
