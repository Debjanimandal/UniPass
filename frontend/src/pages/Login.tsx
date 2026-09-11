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
      <div className="auth-left">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="currentColor" opacity="0.9"/>
              </svg>
            </div>
            <span className="logo-text">UniPass</span>
          </Link>
        </div>
        <div className="auth-hero-content">
          <h1 className="auth-hero-title">
            Welcome back to campus cinema
          </h1>
          <p className="auth-hero-subtitle">
            Log in to browse screenings, manage your bookings, and access your digital tickets.
          </p>
          <div className="auth-hero-features">
            {['Browse films & events', 'Pick your seat', 'Get your QR ticket', 'Secure venue entry'].map((f) => (
              <div key={f} className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Sign in</h2>
            <p className="auth-subtitle">
              New to UniPass?{' '}
              <Link to="/register" className="auth-link">
                Create an account
              </Link>
            </p>
          </div>

          {serverError && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom: 20 }}>
              <span>⚠</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address <span className="required">*</span>
              </label>
              <input
                id="email"
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
              <label htmlFor="password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                {...register('password')}
              />
              {errors.password && (
                <span className="form-error">⚠ {errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              id="login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-demo-accounts">
            <p className="auth-demo-label">Demo accounts</p>
            <div className="auth-demo-grid">
              {[
                { label: 'Student', email: 'aisha@student.unipass.edu', pw: 'Student@1234' },
                { label: 'Guard', email: 'guard@unipass.edu', pw: 'Guard@1234' },
                { label: 'Admin', email: 'admin@unipass.edu', pw: 'Admin@1234' },
              ].map((a) => (
                <div key={a.label} className="auth-demo-item">
                  <span className="auth-demo-role">{a.label}</span>
                  <code className="auth-demo-email">{a.email}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
