import React from 'react';
import { Form, Input } from 'antd';

export default function ServiceProviderForm({ isUpdateForm = false }) {
  return (
    <>
      <Form.Item
        name="name"
        label="Service Provider Name"
        rules={[
          {
            required: true,
            message: 'Please input the Service Provider Name!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="company"
        label="Company"
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          {
            type: 'email',
            message: 'The input is not valid E-mail!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="phone"
        label="Phone Number"
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="address"
        label="Address"
      >
        <Input.TextArea rows={2} />
      </Form.Item>
    </>
  );
}
