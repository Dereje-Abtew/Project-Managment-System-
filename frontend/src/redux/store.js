import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

import { AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';
import cryptoHelper from '@/utils/crypto';
import rootReducer from './rootReducer';

let middleware = [thunk];

let configStore = applyMiddleware(...middleware);

const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

if (process.env.NODE_ENV === 'development') {
  middleware = [...middleware];
  configStore = composeEnhancers(applyMiddleware(...middleware));
}

// Safely load auth state from localStorage — never crash on bad data
let initialState = {};
try {
  const authStore = window.localStorage.getItem(AUTH_LOCAL_STORAGE);
  if (authStore) {
    const decryptedAuth = cryptoHelper.decrypt(authStore);
    if (decryptedAuth && typeof decryptedAuth === 'object') {
      initialState = { auth: { current: decryptedAuth, isLoggedIn: true, loading: false } };
    } else {
      // Stale or corrupted — clear it so the user gets the login page
      window.localStorage.clear();
    }
  }
} catch (e) {
  console.warn('Failed to restore auth state from storage:', e);
  try { window.localStorage.clear(); } catch (_) {}
}

const store = createStore(rootReducer, initialState, configStore);

export default store;
