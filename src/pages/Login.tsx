import React, { useState } from 'react';
import { signIn, signUp } from '../lib/auth';

interface LoginProps {
  onAuthenticated: () => void;
}

export const Login: React.FC<LoginProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    const action = mode === 'login' ? signIn : signUp;
    const result = await action(username, password);

    if (!result.ok) {
      setError(result.message);
    } else {
      setMessage(mode === 'login' ? 'Signed in.' : 'Account created.');
      onAuthenticated();
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <header className="header">
        <div>
          <p className="eyebrow">Workout</p>
          <h1>Welcome back</h1>
          <p className="muted">Sign in or register with username and password.</p>
        </div>
      </header>
      <main className="content">
        <section className="panel">
          <div className="panel-head">
            <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
            <button
              type="button"
              className="link-btn"
              onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
            >
              {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
            </button>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Register'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};
