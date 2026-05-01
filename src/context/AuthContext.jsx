import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'greenzone_user';
const USERS_DB_KEY = 'greenzone_users_db';

/* ── Helper Functions ── */

/** Get current logged-in user from localStorage */
function getCurrentUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      // Ensure name always exists
      if (!user.name) user.name = 'Student';
      return user;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

/** Save current user to localStorage */
function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/** Remove current user from localStorage */
function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Simple mock user database stored in localStorage.
 * Maps email → { name, role } so login can look up
 * a previously registered user's real name.
 */
function getUsersDB() {
  try {
    const db = localStorage.getItem(USERS_DB_KEY);
    return db ? JSON.parse(db) : {};
  } catch {
    return {};
  }
}

function saveToUsersDB(email, name, role) {
  const db = getUsersDB();
  db[email.toLowerCase()] = { name, role };
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

function lookupUserByEmail(email) {
  const db = getUsersDB();
  return db[email.toLowerCase()] || null;
}

/* ── Auth Provider ── */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock authentication — accepts any valid-looking email + non-empty password
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 3) {
      return { success: false, error: 'Password is too short.' };
    }

    // Admin Bypass
    if (email === 'joetech.dev.systems@gmail.com' && password === 'Youssef14@@') {
      const adminUser = {
        name: 'Joe Tech',
        email,
        role: 'admin'
      };
      saveUser(adminUser);
      setUser(adminUser);
      return { success: true, role: 'admin' };
    }

    // Look up if this email was previously registered (via sign up)
    const existing = lookupUserByEmail(email);

    const mockUser = {
      name: existing?.name || 'Student',
      email,
      role: existing?.role && existing.role !== 'admin' ? existing.role : 'student',
    };

    saveUser(mockUser);
    setUser(mockUser);
    return { success: true, role: mockUser.role };
  };

  const signup = (name, email, password) => {
    const mockUser = {
      name,
      email,
      role: 'student',
    };

    // Save to mock DB so login can find them later
    saveToUsersDB(email, name, 'student');
    saveUser(mockUser);
    setUser(mockUser);
    return { success: true };
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateUser = (name, email) => {
    const updatedUser = {
      ...user,
      name,
      email
    };
    saveToUsersDB(email, name, updatedUser.role);
    saveUser(updatedUser);
    setUser(updatedUser);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
