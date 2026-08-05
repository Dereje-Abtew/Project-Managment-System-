import { notification } from 'antd';

import codeMessage from './codeMessage';

const errorHandler = (error) => {
  const { response } = error;

  if (response && response.status) {
    const { data } = response;
    const message = data && data.message;
    const fields = data && data.fields;

    // Build a detailed error description
    let errorText = message || codeMessage[response.status];

    // If field-level errors are available, append them as a clean list
    if (fields && typeof fields === 'object') {
      const fieldMessages = Object.values(fields)
        .map((msg) => `• ${msg}`)
        .join('\n');
      errorText = `Please fix the following:\n${fieldMessages}`;
    }

    const { status } = response;
    notification.config({
      duration: 10,
    });
    notification.error({
      message: `Request failed`,
      description: errorText,
    });
    const requestUrl = error.config?.url || '';
    if (status === 401) {
      if (!requestUrl.includes('sp-portal')) {
        window.location.href = '/logout';
      } else {
        notification.error({
          message: 'Unauthorized',
          description: 'SP portal access is not authorized from this account.',
        });
      }
    }
    if (response.data && response.data.jwtExpired) {
      if (!requestUrl.includes('sp-portal')) {
        window.location.href = '/logout';
      }
    }
    return response.data;
  } else {
    notification.config({
      duration: 5,
    });
    notification.error({
      message: 'No internet connection',
      description: 'Cannot connect to the server, Check your internet network',
    });
    return {
      success: false,
      //  result: null,
      message: 'Cannot connect to the server, Check your internet network',
    };
  }
};

export default errorHandler;
