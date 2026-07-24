import { useProfileContext } from '@/context/profileContext';
import useOnFetch from '@/hooks/useOnFetch';
import { request } from '@/request';

import { Form, Input, Modal } from 'antd';
import React, { useEffect } from 'react';
import history from '@/utils/history';

const PasswordModal = ({ config }) => {
  const { state, profileContextAction } = useProfileContext();
  const { modal } = profileContextAction;
  const { passwordModal } = state;
  const modalTitle = 'Change password';

  const [passForm] = Form.useForm();

  const { onFetch, isSuccess } = useOnFetch();

  useEffect(() => {
    if (isSuccess) {
      passForm.resetFields();
      modal.close();
      history.push('/logout');
    }
  }, [isSuccess, passForm, modal]);

  const handelSubmit = async (fieldsValue) => {
    const entity = 'user/change-password/' + config.id;
    const updateFn = () => request.patch({ entity, jsonData: fieldsValue });
    await onFetch(updateFn);
  };
  return (
    <Modal
      title={modalTitle}
      visible={passwordModal.isOpen}
      onCancel={modal.close}
      okText="Update"
      onOk={() => passForm.submit()}
    >
      <Form form={passForm} layout="vertical" onFinish={handelSubmit}>
        <Form.Item
          label="New Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your Password!',
              min: 8,
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm Password"
          name="repassword"
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords that you entered do not match!')
                );
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PasswordModal;
