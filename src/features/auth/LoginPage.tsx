import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from './authSlice';
import { useLoginMutation } from './api';
import { getErrorMessage } from '@/lib/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (result) => {
          dispatch(setCredentials(result));
          navigate('/', { replace: true });
        },
      },
    );
  }

  return (
    <div
      className="flex min-h-svh"
      style={{ background: 'hsl(220 20% 97%)' }}
    >
      {/* ── Left: Branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 px-10 py-12"
        style={{
          background: 'white',
          borderRight: '1px solid hsl(220 15% 91%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'hsl(245 75% 55%)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: 'hsl(222 47% 11%)' }}>Mini ERP</p>
            <p className="text-xs" style={{ color: 'hsl(220 13% 55%)' }}>Business Management System</p>
          </div>
        </div>

        {/* Center illustration / features */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold leading-snug" style={{ color: 'hsl(222 47% 11%)' }}>
              Run your business<br />from one place.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(220 13% 50%)' }}>
              Manage products, track sales, and control team access — all in a single clean interface.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                ),
                title: 'Inventory Management',
                desc: 'Real-time stock tracking with low-stock alerts',
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: 'Sales & Revenue',
                desc: 'Record transactions and track revenue trends',
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: 'Roles & Permissions',
                desc: 'Fine-grained access control per team member',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{
                  background: 'hsl(220 20% 97%)',
                  border: '1px solid hsl(220 15% 91%)',
                }}
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: 'hsl(245 75% 55% / 0.1)',
                    color: 'hsl(245 75% 50%)',
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'hsl(222 47% 14%)' }}>{f.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(220 13% 52%)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'hsl(220 13% 65%)' }}>
          © {new Date().getFullYear()} Mini ERP. All rights reserved.
        </p>
      </div>

      {/* ── Right: Sign-in form ── */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-4">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'hsl(245 75% 55%)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-base font-bold" style={{ color: 'hsl(222 47% 11%)' }}>Mini ERP</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(222 47% 11%)' }}>
              Sign in
            </h1>
            <p className="text-sm" style={{ color: 'hsl(220 13% 50%)' }}>
              Enter your credentials to access your workspace
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: 'white',
              border: '1px solid hsl(220 15% 90%)',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: 'hsl(222 47% 18%)' }}
                >
                  Email address
                </label>
                <div className="relative">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
                    style={{ color: 'hsl(220 13% 60%)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="erp-input pl-9"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: 'hsl(222 47% 18%)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
                    style={{ color: 'hsl(220 13% 60%)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="erp-input pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center transition-colors duration-150 hover:text-primary"
                    style={{ color: 'hsl(220 13% 60%)' }}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {loginMutation.isError && (
                <div
                  className="flex items-start gap-2 rounded-lg p-3 text-sm"
                  style={{
                    background: 'hsl(358 72% 52% / 0.06)',
                    border: '1px solid hsl(358 72% 52% / 0.18)',
                    color: 'hsl(358 72% 42%)',
                  }}
                >
                  <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {getErrorMessage(loginMutation.error)}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="btn-primary w-full justify-center py-2.5"
              >
                {loginMutation.isPending ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
