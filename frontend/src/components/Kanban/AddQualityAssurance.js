import React from 'react';

import { Form, Modal } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
const AddQualityAssurance = ({
  isAddQualityAssuranceModalOpen,
  setAddQualityAssuranceModal,
  taskId = null,
  onQualityAssuranceCreate,
}) => {
  const [form] = Form.useForm();

  return (
    <>
      <Modal
        centered
        visible={isAddQualityAssuranceModalOpen}
        title={<h1>Add Quality Assurance</h1>}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setAddQualityAssuranceModal(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              form.resetFields();
              values = { ...values, taskId: taskId };
              onQualityAssuranceCreate(values);
            })
            .catch((error) => {});
        }}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item
            name="qualityAssurance"
            label="Quality Assurance"
            rules={[
              {
                required: true,
                message: 'Please enter valid user to add!',
              },
            ]}
          >
            <AutoCompleteAsync
              entity={'user'}
              displayLabels={['firstName', 'lastName']}
              searchFields={['firstName', 'lastName']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddQualityAssurance;
