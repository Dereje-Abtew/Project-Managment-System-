import React from 'react';
import { Alert } from 'antd';

const SecondaryAlert = ({ message, action }) => (
  <Alert
    showIcon
    className="bg-gray-100 border border-gray-300 text-gray-700"
    action={action}
    message={message}
  />
);

export default SecondaryAlert;
