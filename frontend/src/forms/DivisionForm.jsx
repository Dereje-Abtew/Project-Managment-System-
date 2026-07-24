import React from 'react';
import { Form, Input } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';

export default function DivisionForm() {
  return (
    <>
      <Form.Item
        label="Division Name"
        name="divisionName"
        rules={[
          {
            required: true,
            message: 'Please input Division name!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="department"
        label="Department Name"
        rules={[
          {
            required: true,
            message: 'Please select User Department!',
          },
        ]}
      >
        <AutoCompleteAsync
          entity={'department'}
          displayLabels={['departmentName']}
          searchFields={'departmentName'}
        />
      </Form.Item>
    </>
  );
}
