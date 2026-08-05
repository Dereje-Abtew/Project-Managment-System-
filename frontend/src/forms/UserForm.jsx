import { useState } from 'react';
import { Form, Input, Switch, Select } from 'antd';
const { Option } = Select;

import AutoCompleteAsync from '@/components/AutoCompleteAsync';

export default function UserForm({ isUpdateForm = false }) {
  const [position, setPosition] = useState('');

  const handlePositionChange = (value) => {
    setPosition(value);
  };

  return (
    <>
      {/* Row 1: First Name + Last Name */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: 'Please input First name!' }]}
        >
          <Input placeholder="e.g. Biniyam" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: 'Please input Last name!' }]}
        >
          <Input placeholder="e.g. Kefelegn" />
        </Form.Item>
      </div>

      {/* Row 2: Email + Phone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input Email!' }]}
        >
          <Input placeholder="e.g. user@globalbank.et" disabled={isUpdateForm} />
        </Form.Item>

        <Form.Item
          label="Mobile"
          name="phone"
          rules={[{ required: true, message: 'Please input Phone Number!' }]}
        >
          <Input type="tel" placeholder="e.g. +251911000000" />
        </Form.Item>
      </div>

      {/* Row 3: Job Title + Position */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          label="Job Title"
          name="jobTitle"
          rules={[{ required: true, message: 'Please input the Job Title!' }]}
        >
          <Input placeholder="e.g. Senior Developer" />
        </Form.Item>

        <Form.Item
          name="position"
          label="Position"
          rules={[{ required: true, message: 'Please select User Position!' }]}
        >
          <Select placeholder="Select a position" onChange={handlePositionChange}>
            <Option value="Chief">Chief</Option>
            <Option value="Director">Director</Option>
            <Option value="Manager">Manager</Option>
            <Option value="Professional">Professional</Option>
            <Option value="Stakeholder">Stakeholder</Option>
          </Select>
        </Form.Item>
      </div>

      {/* Row 4: Role + conditional org field */}
      {/* We use Form.Item shouldUpdate so position changes re-render the org field */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select User Role!' }]}
        >
          <AutoCompleteAsync entity={'role'} displayLabels={['name']} searchFields={'name'} />
        </Form.Item>

        {/* Conditional org field — reads position from local state OR form value */}
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.position !== curr.position}>
          {({ getFieldValue }) => {
            const pos = getFieldValue('position') || position;
            
            // Stakeholder position doesn't need chief/department/division
            if (pos === 'Stakeholder') {
              return null; // Don't show any organization field
            }
            
            if (pos === 'Chief') {
              return (
                <Form.Item
                  label="Chief"
                  name="chief"
                  rules={[{ required: true, message: 'Please select User Chief!' }]}
                >
                  <AutoCompleteAsync
                    entity={'chief'}
                    displayLabels={['chiefName']}
                    searchFields={'chiefName'}
                  />
                </Form.Item>
              );
            }
            if (pos === 'Director') {
              return (
                <Form.Item
                  label="Department"
                  name="department"
                  rules={[{ required: true, message: 'Please select Department!' }]}
                >
                  <AutoCompleteAsync
                    entity={'department'}
                    displayLabels={['departmentName']}
                    searchFields={'departmentName'}
                  />
                </Form.Item>
              );
            }
            if (pos === 'Manager' || pos === 'Professional') {
              return (
                <Form.Item
                  label="Division"
                  name="division"
                  rules={[{ required: true, message: 'Please select Division!' }]}
                >
                  <AutoCompleteAsync
                    entity={'division'}
                    displayLabels={['divisionName']}
                    searchFields={'divisionName'}
                  />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>
      </div>

      {/* Status toggle */}
      <Form.Item
        label="Is User enabled?"
        name="enabled"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
      </Form.Item>
    </>
  );
}
