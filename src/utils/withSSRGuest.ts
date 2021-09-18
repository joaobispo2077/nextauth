import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { parseCookies } from 'nookies';

export function withSSRGuest<T>(fn: GetServerSideProps<T>) {
  return async (
    context: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(context);
    console.log('getServerSideProps', cookies);

    if (cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    return await fn(context);
  };
}
