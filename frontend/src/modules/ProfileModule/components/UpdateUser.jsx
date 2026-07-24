import { useProfileContext } from '@/context/profileContext';
import uniqueId from '@/utils/uinqueId';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Descriptions, Form, PageHeader, Row } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserProfileForm from '@/forms/UserProfileForm';
import { crud } from '@/redux/crud/actions';
import { selectCurrentItem, selectUpdatedItem } from '@/redux/crud/selectors';

const UpdateUser = ({ config }) => {
  const { profileContextAction } = useProfileContext();
  const { updatePanel } = profileContextAction;
  const dispatch = useDispatch();
  const { ENTITY_NAME } = config;

  const { result } = useSelector(selectCurrentItem);
  const updated = useSelector(selectUpdatedItem);
  const [form] = Form.useForm();

  useEffect(() => {
    if (result) {
      form.setFieldsValue({
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        position: result.position,
        jobTitle: result.jobTitle,
        phone: result.phone,
      });
    }
  }, [result, form]);

  useEffect(() => {
    if (updated?.isSuccess) {
      updatePanel.close();
    }
  }, [updated?.isSuccess, updatePanel]);

  const handleSubmit = () => {
    form.submit();
  };

  const onSubmit = (fieldsValue) => {
    const id = config.id;
    dispatch(crud.update({ entity: 'user', id, jsonData: fieldsValue }));
  };

  // Read-only context info (not editable)
  const displayChiefName =
    result?.userChiefName || result?.chief?.chiefName || result?.division?.department?.chief?.chiefName || '-';
  const displayDepartmentName =
    result?.department?.departmentName || result?.division?.department?.departmentName || '-';
  const displayDivisionName = result?.division?.divisionName || '-';

  return (
    <>
      <PageHeader
        onBack={() => updatePanel.close()}
        title={`Edit ${ENTITY_NAME}`}
        ghost={false}
        extra={[
          <Button
            onClick={() => updatePanel.close()}
            key={`${uniqueId()}`}
            icon={<CloseCircleOutlined />}
          >
            Close
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={handleSubmit}
            type="primary"
            icon={<SaveOutlined />}
          >
            Save
          </Button>,
        ]}
        style={{ padding: '20px 0px' }}
      />

      <Row gutter={[32, 0]} align="start">
        {/* Editable fields */}
        <Col xs={24} md={12}>
          <Form
            form={form}
            onFinish={onSubmit}
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
          >
            <UserProfileForm />
          </Form>
        </Col>

        {/* Read-only org context */}
        <Col xs={24} md={12}>
          <Descriptions
            title="Organization Info"
            labelStyle={{ fontWeight: 600 }}
            size="small"
            column={1}
            style={{ marginTop: 8 }}
          >
            <Descriptions.Item label="Chief">{displayChiefName}</Descriptions.Item>
            <Descriptions.Item label="Department">{displayDepartmentName}</Descriptions.Item>
            <Descriptions.Item label="Division">{displayDivisionName}</Descriptions.Item>
          </Descriptions>
          <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
            Organization structure is managed by your administrator.
          </p>
        </Col>
      </Row>
    </>
  );
};

export default UpdateUser;
