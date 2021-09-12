import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

import { signOut } from '../../contexts/AuthContext';

type handleRequestFailurePayload = {
  onSuccess: (toen: string) => void;
  onFailure: (error: AxiosError) => void;
};

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue: handleRequestFailurePayload[] = [];

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
    if (error.response?.status === 401) {
      if (error.response?.data?.code === 'token.expired') {
        cookies = parseCookies();
        const { 'nextauth.refreshToken': refreshToken } = cookies;

        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const response = await api.post('/refresh', {
              refreshToken,
            });
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
          } catch (error) {
            failedRequestsQueue.forEach((req) =>
              req.onFailure(error as AxiosError),
            );
            failedRequestsQueue = [];
          } finally {
            isRefreshing = false;
          }
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
        signOut();
      }
    }

    return Promise.reject(error);
  },
);

export { api };
