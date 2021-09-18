import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies';

import { signOut } from '../../contexts/AuthContext';
import { AuthTokenError } from '../../errors/AuthTokenError';

type handleRequestFailurePayload = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

let isRefreshing = false;
let failedRequestsQueue: handleRequestFailurePayload[] = [];

const setupAPIClient = (
  context: GetServerSidePropsContext | undefined = undefined,
) => {
  let cookies = parseCookies(context);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      authorization: `Bearer ${cookies['nextauth.token']}`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      console.log(error);
      if (error.response?.status === 401) {
        if (error.response?.data?.code === 'token.expired') {
          console.log('refresh');
          cookies = parseCookies(context);
          const { 'nextauth.refreshToken': refreshToken } = cookies;

          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;
            api
              .post('/refresh', {
                refreshToken,
              })
              .then((response) => {
                const { token, refreshToken: newRefreshToken } = response.data;

                setCookie(null, 'nextauth.token', token, {
                  maxAge: 30 * 24 * 60 * 60, // 30 days
                  path: '/',
                });

                setCookie(null, 'nextauth.refreshToken', newRefreshToken, {
                  maxAge: 30 * 24 * 60 * 60, // 30 days
                  path: '/',
                });

                api.defaults.headers['authorization'] = `Bearer ${token}`;

                failedRequestsQueue.forEach((req) => req.onSuccess(token));
                failedRequestsQueue = [];
              })
              .catch((error) => {
                failedRequestsQueue.forEach((req) =>
                  req.onFailure(error as AxiosError),
                );
                failedRequestsQueue = [];
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers['authorization'] = `Bearer ${token}`;
                resolve(api(originalConfig));
              },
              onFailure: (error: AxiosError) => {
                reject(error);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
};

export { setupAPIClient };
