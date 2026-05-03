import { requireSupabase, supabase } from './supabaseClient';
import { cachedQuery, clearQueryCache } from './queryCache';

const FALLBACK_STORAGE_KEY = 'greenzone_user_fallback';

function readCachedUser(authUser) {
  try {
    const stored = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!stored) return null;

    const cachedUser = JSON.parse(stored);
    const cachedEmail = cachedUser?.email?.toLowerCase();
    const authEmail = authUser?.email?.toLowerCase();

    if (cachedUser?.id && cachedUser.id === authUser?.id) return cachedUser;
    if (cachedEmail && authEmail && cachedEmail === authEmail) return cachedUser;
  } catch {
    localStorage.removeItem(FALLBACK_STORAGE_KEY);
  }
  return null;
}

function normalizeProfile(profile, authUser, cachedUser = null) {
  if (!profile && !authUser) return null;
  return {
    id: profile?.id || authUser?.id,
    name: profile?.full_name || cachedUser?.name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Student',
    email: profile?.email || authUser?.email,
    role: profile?.role || cachedUser?.role || authUser?.user_metadata?.role || 'student',
    status: profile?.status || cachedUser?.status || 'active',
  };
}

function getErrorMessage(error, fallback) {
  return error?.message || error?.error_description || fallback;
}

async function withTimeout(promise, message, timeoutMs = 8000) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getCurrentSession() {
  if (!supabase) return { session: null, user: null, profile: null };

  const { data, error } = await cachedQuery(
    'auth:session',
    () => withTimeout(
      supabase.auth.getSession(),
      'Session check timed out. Please refresh and try again.'
    ),
    { ttl: 20_000 },
  );
  if (error) throw error;

  const authUser = data.session?.user || null;
  if (!authUser) return { session: data.session, user: null, profile: null };

  let profile;
  try {
    profile = await getProfile(authUser.id, authUser);
  } catch {
    profile = null;
  }

  return { session: data.session, user: normalizeProfile(profile, authUser, readCachedUser(authUser)), profile };
}

export async function getProfile(userId, authUser = null) {
  const client = requireSupabase();
  const { data, error } = await cachedQuery(
    ['auth:profile', userId],
    () => client
      .from('profiles')
      .select('id,full_name,email,role,status')
      .eq('id', userId)
      .maybeSingle(),
    { ttl: 45_000 },
  );

  if (error) throw error;
  if (data) return data;

  if (!authUser) return null;

  const fallbackProfile = {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
    role: 'student',
    status: 'active',
  };

  const { data: created, error: createError } = await client
    .from('profiles')
    .upsert(fallbackProfile, { onConflict: 'id' })
    .select('*')
    .single();

  if (createError) throw createError;
  return created;
}

export async function signIn(email, password) {
  const client = requireSupabase();
  try {
    clearQueryCache('auth:');
    const { data, error } = await withTimeout(
      client.auth.signInWithPassword({ email, password }),
      'Login request timed out. Please try again.',
      6500
    );

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Login failed. Please try again.' };

    const cachedUser = readCachedUser(data.user);
    let profile = null;
    let profilePending = false;
    try {
      profile = await withTimeout(
        getProfile(data.user.id, data.user),
        'Profile loading timed out.',
        3000
      );
    } catch {
      profilePending = true;
    }

    const user = normalizeProfile(profile, data.user, cachedUser);
    if (user.status === 'disabled') {
      await client.auth.signOut();
      return { success: false, error: 'This account is disabled.' };
    }

    return { success: true, role: user.role, user, profilePending };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Login failed. Please try again.') };
  }
}

export async function signUp(fullName, email, password) {
  const client = requireSupabase();
  clearQueryCache('auth:');
  const { data, error } = await withTimeout(
    client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    }),
    'Signup request timed out. Please try again.'
  );

  if (error) return { success: false, error: error.message };

  if (data.user && !data.session) {
    return {
      success: true,
      requiresConfirmation: true,
      role: 'student',
      user: normalizeProfile(null, data.user),
    };
  }

  if (data.user) {
    try {
      const profile = await getProfile(data.user.id, data.user);
      return { success: true, role: profile.role || 'student', user: normalizeProfile(profile, data.user) };
    } catch (profileError) {
      return {
        success: false,
        error: getErrorMessage(profileError, 'Account was created, but profile setup failed.'),
      };
    }
  }

  return { success: true, role: 'student', user: null };
}

export async function signOut() {
  if (!supabase) return;
  clearQueryCache();
  await supabase.auth.signOut();
}

export async function updateProfile(userId, { name, email }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .update({ full_name: name, email })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) return { success: false, error: error.message };
  clearQueryCache('auth:profile');
  return { success: true, user: normalizeProfile(data) };
}
