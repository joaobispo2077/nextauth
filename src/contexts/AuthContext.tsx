import React, { createContext, useState } from 'react';

import { api } from '../services/api';

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
};

export const AuthContext = createContext({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function signIn(credentials: SignInCredentials) {
    try {
      const response = await api.post('/sessions', credentials);
      console.log('response', response.data);
      console.log(credentials);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error(err);
      console.error(err.name);
      console.error(err.message);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
