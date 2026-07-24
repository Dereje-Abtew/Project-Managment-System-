import React from 'react';
import { Form, Input } from 'antd';

export default function ChiefForm() {
  return (
    <>
      <Form.Item
        label="Chief Name"
        name="chiefName"
        rules={[
          {
            required: true,
            message: 'Please input chief name!',
          },
        ]}
      >
        <Input />
      </Form.Item>
    </>
  );
}
