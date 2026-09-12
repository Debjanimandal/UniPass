import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { authApi } from '../services/api.client';
import { useAuthStore } from '../store/auth.store';
import { AuthResponse } from '../types';
import './AuthPages.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const getRedirect = (role: string) => {
    if (from) return from;
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'GUARD') return '/guard/scan';
    return '/student/dashboard';
  };

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await authApi.login(data);
      const { user, token } = res.data.data as AuthResponse;
      login(user, token);
      navigate(getRedirect(user.role), { replace: true });
    } catch (err) {
      const e = err as AxiosError<{ error: { message: string } }>;
      setServerError(
        e.response?.data?.error?.message || 'Something went wrong. Please try again.'
      );
    }
  };

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
              Welcome back<br />to UniPass
            </h1>
            <p className="auth-hero-subtitle">
              Sign in to manage your bookings, tickets, and secure event access.
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
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-subtitle">Sign in to continue to your UniPass account.</p>
            </div>

            {serverError && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email address</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className={`form-control has-icon ${errors.email ? 'error' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-icon-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
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
                {errors.password && <span className="form-error">{errors.password.message}</span>}
              </div>

              <div className="form-options">
                <label className="checkbox-wrap">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? <div className="spinner" /> : 'Sign In'}
              </button>
              


            </form>

            <div className="auth-footer">
              Don't have an account? <Link to="/register">Create an account</Link>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
}
