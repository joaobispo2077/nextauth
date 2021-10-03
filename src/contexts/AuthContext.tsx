import React, { createContext, useEffect, useState } from 'react';

import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { GetServerSidePropsContext } from 'next';

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
  signOut(): void;
  isAuthenticated: boolean;
  user: User;
};

export const AuthContext = createContext({} as AuthContextData);

// export const signOut = (
//   ctx: GetServerSidePropsContext | undefined = undefined,
// ) => {
//   destroyCookie(ctx, 'nextauth.token');
//   destroyCookie(ctx, 'nextauth.refreshToken');

//   if (process.browser) {
//     Router.push('/');
//   }
// };

let authChannel: BroadcastChannel;

export const signOut = () => {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  authChannel.postMessage('logout');

  Router.push('/');
};

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('nextauth@auth');

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'logout':
          signOut();
          break;
        case 'signin':
          window.location.reload();
          break;
        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api
        .get('/me')
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      console.log('signIn', { email, password });
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

      authChannel.postMessage('signin');
      Router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      console.error(err.name);
      console.error(err.message);
    }
  }

  return (
    <AuthContext.Provider
      value={{ signIn, signOut, isAuthenticated, user: user as User }}
    >
      {children}
    </AuthContext.Provider>
  );
};
