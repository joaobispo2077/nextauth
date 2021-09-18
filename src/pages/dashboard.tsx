import { useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    api.get('/me').then(console.log);
  }, []);
  return (
    <div>
      <h1>Dashboard: {user?.email}</h1>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (context) => {
  return {
    props: {},
  };
});
