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
        name="username"
        label="Portal Username"
        tooltip="Username for service provider to login to the UAT portal"
        rules={[
          {
            required: !isUpdateForm,
            message: 'Please input a username for portal access!',
          },
        ]}
      >
        <Input placeholder="username (for UAT portal login)" />
      </Form.Item>
      {!isUpdateForm && (
        <Form.Item
          name="password"
          label="Portal Password"
          tooltip="Password for service provider to login to the UAT portal"
          rules={[
            {
              required: true,
              message: 'Please input a password!',
            },
            {
              min: 6,
              message: 'Password must be at least 6 characters!',
            },
          ]}
        >
          <Input.Password placeholder="password (minimum 6 characters)" />
        </Form.Item>
      )}
      <Form.Item
        name="address"
        label="Address"
      >
        <Input.TextArea rows={2} />
      </Form.Item>
    </>
  );
}
