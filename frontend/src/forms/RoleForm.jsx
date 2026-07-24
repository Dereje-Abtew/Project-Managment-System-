import React from 'react';
import { Form, Input } from 'antd';

const { TextArea } = Input;

export default function RoleForm() {
  return (
    <>
      <Form.Item
        label="Name"
        name="name"
        rules={[
          {
            required: true,
            message: 'Please input role name!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[
          {
            required: true,
            message: 'Please input role description!',
          },
        ]}
      >
        <TextArea placeholder="Description" />
      </Form.Item>
    </>
  );
}
