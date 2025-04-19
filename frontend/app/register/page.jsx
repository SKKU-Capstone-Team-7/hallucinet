"use client";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Link from "next/link";
import OAuthButtons from "@/components/AuthButtons";
import "@/styles/Register.css";


export default function Register() {
    const [form, setForm] = useState({
      name: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  
    const [showPassword, setShowPassword] = useState(false);
  
    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
  
    const isFormValid =
      form.name && form.lastname && form.email && form.password && form.confirmPassword;
  
    return (
      <div className="register-page">
        <div className="logo-container">
          <img src="/logoWhite.svg" alt="Logo" className="logo" />
          </div>
        <div className="register-container">
          <h2 className="register-title">Create an Account</h2>
          <p className="register-subtitle">Please enter your details</p>
          <form className="register-form">
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <div className="pass-input-div">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
              {showPassword ? (
                <FaEyeSlash onClick={() => setShowPassword(false)} />
              ) : (
                <FaEye onClick={() => setShowPassword(true)} />
              )}
            </div>
            <div className="pass-input-div">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {showPassword ? (
                <FaEyeSlash onClick={() => setShowPassword(false)} />
              ) : (
                <FaEye onClick={() => setShowPassword(true)} />
              )}
            </div>
            <button
              type="submit"
              className={`register-button ${isFormValid ? "active" : ""}`}
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
  };