import React, { createContext, useEffect, useState } from 'react';

import Router from 'next/router';
import { parseCookies, setCookie } from 'nookies';

import { api } from '../services/api';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};

export const AuthContext = createContext({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api.get('/me').then((response) => {
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('/sessions', { email, password });
      const { token, refreshToken, roles, permissions } = response.data;

      setUser({ roles, permissions, email });
      setCookie(null, 'nextauth.token', token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      setCookie(null, 'nextauth.refreshToken', refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      api.defaults.headers['authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      console.error(err.name);
      console.error(err.message);
    }
  }

  return (
    <AuthContext.Provider
      value={{ signIn, isAuthenticated, user: user as User }}
    >
      {children}
    </AuthContext.Provider>
  );
};
