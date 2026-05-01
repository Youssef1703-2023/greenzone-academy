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

export async function getCurrentSession() {
  if (!supabase) return { session: null, user: null, profile: null };

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const authUser = data.session?.user || null;
  if (!authUser) return { session: data.session, user: null, profile: null };

  const profile = await getProfile(authUser.id, authUser);
  return { session: data.session, user: normalizeProfile(profile, authUser), profile };
}

export async function getProfile(userId, authUser = null) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('*')
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
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };

  const profile = await getProfile(data.user.id, data.user);
  const user = normalizeProfile(profile, data.user);
  if (user.status === 'disabled') {
    await client.auth.signOut();
    return { success: false, error: 'This account is disabled.' };
  }

  return { success: true, role: user.role, user };
}

export async function signUp(fullName, email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

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
        error: profileError?.message || 'Account was created, but profile setup failed.',
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
