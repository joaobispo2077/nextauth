import React, { createContext, useState } from 'react';

import Router from 'next/router';

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

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('/sessions', { email, password });
      const { roles, permissions } = response.data;

      setUser({ roles, permissions, email });
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
