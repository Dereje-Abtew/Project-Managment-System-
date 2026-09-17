export const API_BASE_URL =
  process.env.NODE_ENV === 'production' || process.env.REACT_APP_DEV_REMOTE === 'remote'
    ? process.env.REACT_APP_BACKEND_SERVER + '/api/'
    : (process.env.REACT_APP_BACKEND_SERVER || 'http://10.10.13.85:8181') + '/api/';

export const BASE_URL =
  process.env.NODE_ENV === 'production' || process.env.REACT_APP_DEV_REMOTE === 'remote'
    ? process.env.REACT_APP_BACKEND_SERVER
    : (process.env.REACT_APP_BACKEND_SERVER || 'http://10.10.13.85:8181');

export const ACCESS_TOKEN_NAME = 'x-auth-token';
