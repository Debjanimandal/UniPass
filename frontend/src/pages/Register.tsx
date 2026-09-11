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
      navigate('/student/dashboard', { replace: true });
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
            Join campus cinema in minutes
          </h1>
          <p className="auth-hero-subtitle">
            Create your free UniPass account to start booking seats and receiving secure digital tickets.
          </p>
          <div className="auth-hero-features">
            {['Free to register', 'Book seats instantly', 'Digital QR tickets', 'Secure & private'].map((f) => (
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
              <span>⚠</span>
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
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                {...register('password')}
              />
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
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                {...register('confirmPassword')}
              />
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
  );
}
