import React from 'react';
import { Form, Modal } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
const AddMember = ({ isAddMemberModalOpen, setAddMemberModal, taskId = null, onMemberCreate }) => {
  const [form] = Form.useForm();

  return (
    <>
      <Modal
        centered
        visible={isAddMemberModalOpen}
        title={<h1>Add Member</h1>}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setAddMemberModal(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              form.resetFields();
              values = { ...values, taskId: taskId };
              onMemberCreate(values);
            })
            .catch((error) => {});
        }}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item
            name="teamMember"
            label="Member"
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

export default AddMember;
