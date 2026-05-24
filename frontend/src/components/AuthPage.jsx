import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import './AuthPage.css';

export default function AuthPage({ onAuth, theme, onThemeToggle }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const res = isRegister ? await authAPI.register(payload) : await authAPI.login(payload);
      onAuth(res.data);
      toast.success(isRegister ? 'Account created' : 'Welcome back');
    } catch (err) {
      const errors = err.response?.data?.errors;
      toast.error(errors?.[0]?.msg || err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-panel auth-panel--intro">
          <div className="auth-brand">
            <div className="brand-logo">TF</div>
            <div>
              <h1 className="brand-name">TaskFlow</h1>
              <span className="brand-sub">task management</span>
            </div>
          </div>

          <div className="auth-preview" aria-hidden="true">
            <div className="preview-row preview-row--todo" />
            <div className="preview-row preview-row--progress" />
            <div className="preview-row preview-row--done" />
          </div>

          <div className="auth-points">
            <span>Plan</span>
            <span>Track</span>
            <span>Ship</span>
          </div>
        </div>

        <div className="auth-panel auth-panel--form">
          <button className="theme-btn" onClick={onThemeToggle} title="Toggle theme">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <div className="auth-card">
            <div className="auth-card__header">
              <h2>{isRegister ? 'Create account' : 'Welcome back'}</h2>
              <p>{isRegister ? 'Start organizing your tasks.' : 'Continue managing your work.'}</p>
            </div>

            <div className="auth-tabs">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
                Login
              </button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
                Register
              </button>
            </div>

            <form onSubmit={submit} className="auth-form">
              {isRegister && (
                <label>
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
              </label>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
