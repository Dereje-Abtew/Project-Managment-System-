import React from 'react';
import { Form, Input } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';

export default function DepartmentForm() {
  return (
    <>
      <Form.Item
        label="Department Name"
        name="departmentName"
        rules={[
          {
            required: true,
            message: 'Please input Department name!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="chief"
        label="Chief Name"
        rules={[
          {
            required: true,
            message: 'Please select User Chief!',
          },
        ]}
      >
        <AutoCompleteAsync
          entity={'chief'}
          displayLabels={['chiefName']}
          searchFields={'chiefName'}
        />
      </Form.Item>
    </>
  );
}
