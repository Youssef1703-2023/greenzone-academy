import { requireSupabase, supabase } from './supabaseClient';

function normalizeProfile(profile, authUser) {
  if (!profile && !authUser) return null;
  return {
    id: profile?.id || authUser?.id,
    name: profile?.full_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Student',
    email: profile?.email || authUser?.email,
    role: profile?.role || 'student',
    status: profile?.status || 'active',
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

  const { data, error } = await withTimeout(
    supabase.auth.getSession(),
    'Session check timed out. Please refresh and try again.'
  );
  if (error) throw error;

  const authUser = data.session?.user || null;
  if (!authUser) return { session: data.session, user: null, profile: null };

  let profile = null;
  try {
    profile = await getProfile(authUser.id, authUser);
  } catch {
    profile = null;
  }

  return { session: data.session, user: normalizeProfile(profile, authUser), profile };
}

export async function getProfile(userId, authUser = null) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('id,full_name,email,role,status')
    .eq('id', userId)
    .maybeSingle();

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
    const { data, error } = await withTimeout(
      client.auth.signInWithPassword({ email, password }),
      'Login request timed out. Please try again.'
    );

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Login failed. Please try again.' };

    let profile = null;
    try {
      profile = await withTimeout(
        getProfile(data.user.id, data.user),
        'Profile loading timed out. Please try again.'
      );
    } catch (profileError) {
      await client.auth.signOut();
      return {
        success: false,
        error: getErrorMessage(profileError, 'Login succeeded, but profile loading failed.'),
      };
    }

    const user = normalizeProfile(profile, data.user);
    if (user.status === 'disabled') {
      await client.auth.signOut();
      return { success: false, error: 'This account is disabled.' };
    }

    return { success: true, role: user.role, user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Login failed. Please try again.') };
  }
}

export async function signUp(fullName, email, password) {
  const client = requireSupabase();
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
  return { success: true, user: normalizeProfile(data) };
}
