import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { authApi } from '../services/api.client';
import { useAuthStore } from '../store/auth.store';
import { AuthResponse } from '../types';
import './AuthPages.css';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Phone number must be at least 6 digits').max(20),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _cp, ...payload } = data;
      const res = await authApi.register(payload);
      const { user, token } = res.data.data as AuthResponse;
      login(user, token);
      const redirect = user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      const e = err as AxiosError<{ error: { message: string; fields?: Record<string, string> } }>;
      const errorData = e.response?.data?.error;
      setServerError(errorData?.message || 'Registration failed. Please try again.');
    }
  };

  const passwordValue = watch('password', '');
  const strengthChecks = [
    { label: 'At least 8 characters', valid: passwordValue.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(passwordValue) },
    { label: 'Contains a number', valid: /[0-9]/.test(passwordValue) },
  ];

  return (
    <div className="auth-page">
      {/* ─── Top Navbar ─────────────────────────────────────────── */}
      <div className="auth-navbar">
        <Link to="/" className="auth-nav-logo">
          <img src="/logo.png" alt="UniPass Logo" className="logo-img" />
          <span className="logo-text">UniPass</span>
        </Link>
        <Link to="/" className="auth-nav-link">Back to Home</Link>
      </div>

      <div className="auth-content">
        {/* ─── Left Panel (White) ───────────────────────────────── */}
        <div className="auth-left">
          <div className="auth-left-content">
            <h1 className="auth-hero-title">
              Join campus cinema<br />in minutes
            </h1>
            <p className="auth-hero-subtitle">
              Create your free UniPass account to start booking seats and receiving secure digital tickets.
            </p>

            {/* Mobile/Ticket Mockup */}
            <div className="auth-phone-mockup">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="ft-header" style={{ marginBottom: 16 }}>
                  <div className="ft-logo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    UniPass
                  </div>
                </div>
                <div className="ft-qr">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=unipass-login-demo" alt="QR Code" />
                </div>
                <div className="ft-details">
                  <h3>INTERSTELLAR</h3>
                  <p>15 Sept 2026<br/>6:00 PM<br/>Screen 1 • Seat A3</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Panel (Light Blue) ─────────────────────────── */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <div className="auth-card-logo">
                <img src="/logo.png" alt="UniPass Logo" className="logo-img" />
                <span>UniPass</span>
              </div>
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">
                Already registered?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>

            {serverError && (
              <div className="alert alert-error animate-fade-in" style={{ marginBottom: 20 }}>
                <span>{serverError}</span>
              </div>
            )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="firstName" className="form-label">
                  First name <span className="required">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  className={`form-control ${errors.firstName ? 'error' : ''}`}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <span className="form-error">⚠ {errors.firstName.message}</span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="lastName" className="form-label">
                  Last name <span className="required">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Smith"
                  className={`form-control ${errors.lastName ? 'error' : ''}`}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <span className="form-error">⚠ {errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="reg-email" className="form-label">
                Email address <span className="required">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@university.ac.uk"
                className={`form-control ${errors.email ? 'error' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <span className="form-error">⚠ {errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone number <span className="required">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+44 7700 900000"
                className={`form-control ${errors.phone ? 'error' : ''}`}
                {...register('phone')}
              />
              {errors.phone && (
                <span className="form-error">⚠ {errors.phone.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <div className="input-icon-wrap">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  style={{ paddingRight: 40 }}
                  {...register('password')}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">⚠ {errors.password.message}</span>
              )}
              {passwordValue.length > 0 && (
                <div className="password-strength">
                  {strengthChecks.map((c) => (
                    <div key={c.label} className={`strength-check ${c.valid ? 'valid' : 'invalid'}`}>
                      <span>{c.valid ? '✓' : '○'}</span>
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password <span className="required">*</span>
              </label>
              <div className="input-icon-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  style={{ paddingRight: 40 }}
                  {...register('confirmPassword')}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="form-error">⚠ {errors.confirmPassword.message}</span>
              )}
            </div>

            <p className="form-hint" style={{ marginBottom: 16 }}>
              By registering, you will be assigned a <strong>Student</strong> account.
              Accounts are verified against university records.
            </p>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              id="register-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
