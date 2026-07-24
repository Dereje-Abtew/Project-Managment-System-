import { API_BASE_URL } from '@/config/serverConfig';

import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import { AUTH_LOCAL_STORAGE, TOKEN_COOKIE_STORAGE } from '@/constants/localStorageKeyConstants';
import CookieManager from '@/utils/helpers/cookieUtils';
import signatureGenerator from '@/utils/hashSignature';
import getCurrentTime from '@/utils/helpers/getCurrentTime';

export const login = async ({ loginData }) => {
  try {
    const current = getCurrentTime();
    const signature = signatureGenerator.CreateSignature(current);

    let token = process.env.REACT_APP_AUTH_TOKEN;
    console.log('token', token);
    const response = await fetch(API_BASE_URL + `login?timestamp=${new Date().getTime()}`, {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token} ${signature} ${current}`, // Include the token in the 'Authorization' header
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(loginData),
    });

    const { status } = response;
    const data = await response.json();
    successHandler(
      { data, status },
      {
        notifyOnSuccess: false,
        notifyOnFailed: true,
      }
    );
    return data;
  } catch (error) {
    return errorHandler(error);
  }
};
export const logout = async () => {
  try {
    window.localStorage.removeItem(AUTH_LOCAL_STORAGE);
    CookieManager.clearCookie(TOKEN_COOKIE_STORAGE);
  } catch (error) {
    return errorHandler(error);
  }
};
