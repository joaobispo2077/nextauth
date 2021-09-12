import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();

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
      } else {
        console.log('vish');
      }
    }
  },
);

export { api };
