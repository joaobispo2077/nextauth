import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';

import { AuthTokenError } from '../errors/AuthTokenError';

import { validateUserAccess } from './validadeUserAccess';

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
};

export function withSSRAuth<T>(
  fn: GetServerSideProps<T>,
  options?: WithSSRAuthOptions,
) {
  return async (
    context: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<T> | void> => {
    const cookies = parseCookies(context);
    const token = cookies['nextauth.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    if (options) {
      const user = jwt.decode(token) as Required<WithSSRAuthOptions>;
      const { roles, permissions } = options;

      const userCanSeePage = validateUserAccess({
        user,
        roles,
        permissions,
      });

      if (!userCanSeePage) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          },
        };
      }
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
