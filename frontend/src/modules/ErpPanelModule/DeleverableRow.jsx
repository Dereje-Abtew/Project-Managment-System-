import React from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';
import { DatePicker } from '@/components/CustomAntd';

import { MinusCircleOutlined } from '@ant-design/icons';
const { TextArea } = Input;

export default function DeliverableRow({ field, remove, current = null }) {
  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col className="gutter-row" span={4}>
        <Form.Item
          name={[field.name, 'name']}
          fieldKey={[field.fieldKey, 'name']}
          rules={[
            {
              required: true,
              message: 'Name is required',
            },
          ]}
        >
          <Input placeholder="Deliverable Name" />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={6}>
        <Form.Item
          name={[field.name, 'description']}
          fieldKey={[field.fieldKey, 'description']}
          rules={[
            {
              required: true,
              message: 'Description is required',
            },
          ]}
        >
          <TextArea rows={1} placeholder="Deliverable Description" />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={4}>
        <Form.Item
          name={[field.name, 'startDate']}
          fieldKey={[field.fieldKey, 'startDate']}
          rules={[
            {
              required: true,
              type: 'object',
              message: 'Start date is required.',
            },
          ]}
        >
          <DatePicker style={{ width: '100%' }} showTime />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={4}>
        <Form.Item
          name={[field.name, 'endDate']}
          fieldKey={[field.fieldKey, 'endDate']}
          rules={[
            {
              required: true,
              message: 'End Date is required',
              type: 'object',
            },
          ]}
        >
          <DatePicker style={{ width: '100%' }} showTime />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item
          name={[field.name, 'cost']}
          fieldKey={[field.fieldKey, 'cost']}
          rules={[{ required: true, message: 'Cost is required' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} placeholder="Cost" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item
          name={[field.name, 'weight']}
          fieldKey={[field.fieldKey, 'weight']}
          rules={[{ required: true, message: 'Weight is required' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} placeholder="Weight" />
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: '-20px', top: ' 5px' }}>
        <MinusCircleOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
