export const API_BASE_URL =
  process.env.NODE_ENV === 'production' || process.env.REACT_APP_DEV_REMOTE === 'remote'
    ? process.env.REACT_APP_BACKEND_SERVER + '/api/'
    : (process.env.REACT_APP_BACKEND_SERVER || 'http://localhost:7524') + '/api/';

export const BASE_URL =
  process.env.NODE_ENV === 'production' || process.env.REACT_APP_DEV_REMOTE === 'remote'
    ? process.env.REACT_APP_BACKEND_SERVER
    : (process.env.REACT_APP_BACKEND_SERVER || 'http://localhost:7524');

export const ACCESS_TOKEN_NAME = 'x-auth-token';
