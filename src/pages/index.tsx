import type { NextPage } from 'next';

import React, { FormEvent, useState } from 'react';

import { useAuth } from '../hooks/useAuth';

import styles from './styles.module.css';

const Home: NextPage = () => {
  const { signIn, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    console.log('isAuthenticated', isAuthenticated);
    event.preventDefault();
    console.log(email, password);
    await signIn({ email, password });
    console.log('isAuthenticated', isAuthenticated);

    setEmail('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        placeholder="e-mail"
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        type="password"
        placeholder="senha"
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
};

export default Home;
