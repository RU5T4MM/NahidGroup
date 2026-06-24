 import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from '../utils/translations';

const AppContext = createContext();

export const parseResponse = async (res, defaultMsg = 'Request failed') => {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text || res.statusText };
  }
  if (!res.ok) {
    throw new Error(data.message || defaultMsg);
  }
  return data;
};

export const AppProvider = ({ children }) => {
  // Theme & Language
  const [theme, setTheme] = useState(localStorage.getItem('kb_theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('kb_lang') || 'en');
  const t = translations[language] || translations.en;

  // Authentication
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kb_token') || null);
  const [loading, setLoading] = useState(true);

  // Global State lists (Cached for fast rendering & offline sync)
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Apply Theme & RTL to document
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Theme
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('kb_theme', theme);
  }, [theme]);

  useEffect(() => {
    const body = window.document.body;
    // Language & RTL
    if (language === 'ur') {
      body.classList.add('rtl-layout');
      body.setAttribute('dir', 'rtl');
    } else {
      body.classList.remove('rtl-layout');
      body.setAttribute('dir', 'ltr');
    }
    localStorage.setItem('kb_lang', language);
  }, [language]);

  // Load User profile on boot
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          // Set language from profile preference if exists
          if (userData.language) {
            setLanguage(userData.language);
          }
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  // --- Auth Handlers ---

  const signup = async (formData) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await parseResponse(res, 'Signup failed');
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('kb_token', data.token);
    return data.user;
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await parseResponse(res, 'Login failed');
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('kb_token', data.token);
    return data.user;
  };

  const sendOtp = async (phone) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await parseResponse(res, 'Failed to send OTP');
  };

  const verifyOtp = async (payload) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await parseResponse(res, 'OTP verification failed');

    // If OTP is verified but registration is incomplete, returns { newUser: true }
    if (data.newUser) {
      return data;
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('kb_token', data.token);
    return data.user;
  };

  const forgotPassword = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await parseResponse(res, 'Failed to request password reset');
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    return await parseResponse(res, 'Failed to reset password');
  };

  const updateProfile = async (profileData) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    const data = await parseResponse(res, 'Failed to update profile');
    setUser(data.user);
    if (profileData.language) {
      setLanguage(profileData.language);
    }
    return data.user;
  };

  const updateSubscriptionLocal = (updatedUser) => {
    setUser(updatedUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCustomers([]);
    localStorage.removeItem('kb_token');
  };

  // --- API Fetch Helper ---
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    
    // Add content type if sending body and not form-data (Multipart/form-data sets its own boundary)
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
      throw new Error('Session expired, please login again.');
    }
    return res;
  };

  // --- Notification System ---
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  return (
    <AppContext.Provider value={{
      theme,
      setTheme,
      language,
      setLanguage,
      t,
      user,
      token,
      loading,
      customers,
      setCustomers,
      notifications,
      addNotification,
      signup,
      login,
      sendOtp,
      verifyOtp,
      forgotPassword,
      resetPassword,
      updateProfile,
      updateSubscriptionLocal,
      logout,
      fetchWithAuth,
      parseResponse
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
