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
  // try {
  //   // ECCONRESET ERROR
  //   console.log('running');
  //   const apiClient = setupAPIClient(context);
  //   console.log('apiClient');
  //   const response = await apiClient.get('/me');
  //   console.log('data is', response.data);
  // } catch (error) {
  //   console.log(error);
  //   console.log(error.name);
  //   console.log(error.message);
  //   console.log('error');
  // }
  return {
    props: {},
  };
});
