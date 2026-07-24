import axios from 'axios';
import { notification } from 'antd';
import { API_BASE_URL } from '@/config/serverConfig';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const makeApiRequest = async (method, url, data, successMessage, errorMessage) => {
  try {
    const response = await axios[method](`${API_BASE_URL}/${url}`, data);

    handleSuccess(successMessage);
    return response.data;
  } catch (error) {
    handleError(error, errorMessage);
  }
};

export const handleSuccess = (message) => {
  notification.config({
    duration: 5,
  });
  notification.success({
    message: `Request success`,
    description: message,
  });
};

export const handleError = (error, errorMessage) => {
  let errorDescription = errorMessage || 'Request failed';
  if (error.response && error.response.data && error.response.data.message) {
    errorDescription = error.response.data.message;
  }
  notification.config({
    duration: 10,
  });
  notification.error({
    message: 'Request failed',
    description: errorDescription,
  });
};
