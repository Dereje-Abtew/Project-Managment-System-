import React from 'react';
import { Form, Input } from 'antd';

export default function CategoryForm() {
  return (
    <>
      <Form.Item
        label="Category Name"
        name="categoryName"
        rules={[
          {
            required: true,
            message: 'Please input Category name!',
          },
        ]}
      >
        <Input />
      </Form.Item>
    </>
  );
}
