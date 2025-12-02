import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { BottomNav } from './components/BottomNav';
import { signOut } from './lib/auth';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type SessionState = 'checking' | 'authed' | 'unauthenticated';

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>('checking');

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setSessionState('unauthenticated');
      return;
    }

    const resolveSession = async () => {
      const { data } = await client.auth.getSession();
      setSessionState(data.session ? 'authed' : 'unauthenticated');
    };

    resolveSession();

    const { data: listener } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSessionState(session ? 'authed' : 'unauthenticated');
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (sessionState !== 'authed') {
    return <Login onAuthenticated={() => setSessionState('authed')} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Workout</p>
          <h1>Dashboard</h1>
          <p className="muted">You are signed in.</p>
        </div>
      </header>
      <Home />
      <BottomNav />
    </div>
  );
};

export default App;
