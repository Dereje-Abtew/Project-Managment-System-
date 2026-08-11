import * as actionTypes from './types';
import * as authService from '@/auth';
import {
  COOKIE_EXPIRATION_DAYS,
  AUTH_LOCAL_STORAGE,
  TOKEN_COOKIE_STORAGE,
} from '@/constants/localStorageKeyConstants';
import { AuthorizedRoutes } from '@/utils/authorizedRouteUtils';
import history from '@/utils/history';
import cryptoHelper from '@/utils/crypto';
import CookieManager from '@/utils/helpers/cookieUtils';

export const login =
  ({ loginData }) =>
  async (dispatch) => {
    dispatch({
      type: actionTypes.LOADING_REQUEST,
      payload: { loading: true },
    });
    const data = await authService.login({ loginData });

    const { fullload } = loginData;

    if (data.success === true) {
      // window.localStorage.setItem(isLoggedInLocalStorage, true);
      // window.localStorage.setItem(authLocalStorage, cryptoHelper.encrypt(data.result));

      const { token, ...userInfo } = data.result;
      CookieManager.setCookie(
        TOKEN_COOKIE_STORAGE,
        cryptoHelper.encrypt(token),
        COOKIE_EXPIRATION_DAYS
      );
      window.localStorage.setItem(AUTH_LOCAL_STORAGE, cryptoHelper.encrypt(userInfo));

      // Small delay to ensure cookie is written before API calls
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        await AuthorizedRoutes(fullload, data.result);
      } catch (error) {
        console.error('Error loading authorized routes:', error);
        // Continue anyway - routes will be loaded on next navigation
      }

      dispatch({
        type: actionTypes.LOGIN_SUCCESS,
        payload: data.result,
      });
      // Use history.push instead of window.location to avoid full page reload
      // This allows cookies to persist properly before navigation
      history.push('/');
    } else {
      dispatch({
        type: actionTypes.FAILED_REQUEST,
        payload: data,
      });
    }
  };

export const logout = () => async (dispatch) => {
  authService.logout();
  dispatch({
    type: actionTypes.LOGOUT_SUCCESS,
  });
  history.push('/login');
};
