import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function RiskRow({ field, remove, projectForm, current = null }) {
  useEffect(() => {
    calculateEmv();
  }, [field.name, field.fieldKey, projectForm, current]);

  const calculateEmv = () => {
    const formValues = projectForm.getFieldsValue();
    const risk = formValues.risk || [];
    const riskIndex = field.fieldKey;

    if (riskIndex >= 0 && riskIndex < risk.length) {
      const currentRisk = risk[riskIndex];
      const { impact, possibility } = currentRisk;
      const parsedImpact = parseFloat(impact);
      const parsedPossibility = parseFloat(possibility);
      const calculatedEmv = (parsedImpact * parsedPossibility) / 100;

      const updatedRisk = {
        ...currentRisk,
        emv: calculatedEmv,
      };

      const updatedRisks = [...risk];
      updatedRisks[riskIndex] = updatedRisk;

      projectForm.setFieldsValue({ risk: updatedRisks });
    }
  };

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col span={6}>
        <Form.Item
          name={[field.name, 'name']}
          fieldKey={[field.fieldKey, 'name']}
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="Name" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={8}>
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
          <TextArea rows={1} placeholder="Description --> Risk Response" />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item
          name={[field.name, 'possibility']}
          fieldKey={[field.fieldKey, 'possibility']}
          rules={[{ required: true, message: 'Possibility is required' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Possibility"
            onChange={calculateEmv}
          />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item
          name={[field.name, 'impact']}
          fieldKey={[field.fieldKey, 'impact']}
          rules={[{ required: true, message: 'Impact is required' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="Impact" onChange={calculateEmv} />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item name={[field.name, 'emv']} fieldKey={[field.fieldKey, 'emv']}>
          <InputNumber placeholder="EMV" disabled />
        </Form.Item>
      </Col>
      <div style={{ position: 'absolute', right: '-20px', top: ' 5px' }}>
        <MinusCircleOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
