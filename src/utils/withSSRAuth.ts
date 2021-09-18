import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';

import { AuthTokenError } from '../errors/AuthTokenError';

export function withSSRAuth<T>(fn: GetServerSideProps<T>) {
  return async (
    context: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<T> | void> => {
    const cookies = parseCookies(context);

    if (!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    try {
      return await fn(context);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(context, 'nextauth.token');
        destroyCookie(context, 'nextauth.refreshToken');

        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
    }
  };
}
