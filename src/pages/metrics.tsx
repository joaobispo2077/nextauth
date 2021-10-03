import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  return <h1>Métricas</h1>;
}

export const getServerSideProps = withSSRAuth(
  async (context) => {
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
  },
  {
    permissions: ['metrics.listv2'],
  },
);
