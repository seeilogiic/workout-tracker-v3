import { supabase } from './supabase';

type AuthResult =
  | { ok: true }
  | { ok: false; message: string };

const usernameToEmail = (username: string): string => {
  // Supabase auth requires an email; map a username to a deterministic email.
  const trimmed = username.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.includes('@') ? trimmed : `${trimmed}@user.login`;
};

export async function signUp(username: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  const email = usernameToEmail(username);
  if (!email) {
    return { ok: false, message: 'Username is required.' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await supabase.from('profiles').upsert(
    { id: (await supabase.auth.getUser()).data.user?.id, username },
    { onConflict: 'id' },
  );

  return { ok: true };
}

export async function signIn(username: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  const email = usernameToEmail(username);
  if (!email) {
    return { ok: false, message: 'Username is required.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
