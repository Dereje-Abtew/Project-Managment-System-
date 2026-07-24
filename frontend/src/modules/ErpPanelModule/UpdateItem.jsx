import React, { useEffect } from 'react';
import { Form, Divider } from 'antd';
import { Button, PageHeader } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';

import uniqueId from '@/utils/uinqueId';
import { selectUpdatedItem } from '@/redux/erp/selectors';
import Loading from '@/components/Loading';

import { CloseCircleOutlined, SaveFilled } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import { StatusTag } from '@/components/Tag';

function SaveForm({ form, config }) {
  let { UPDATE_ENTITY } = config;
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<SaveFilled />}>
      {UPDATE_ENTITY}
    </Button>
  );
}
export let updateFormInstance = null;

export default function UpdateItem({ config, UpdateForm }) {
  let { entity, UPDATE_ENTITY } = config;
  const dispatch = useDispatch();
  const history = useHistory();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const [form] = Form.useForm();
  updateFormInstance = form;

  const { id } = useParams();

  const onSubmit = (fieldsValue) => {
    dispatch(erp.update({ entity, id, jsonData: fieldsValue }));
  };
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'update' }));
      history.push(`/${entity.toLowerCase()}/read/${id}`);
      dispatch(erp.list({ entity }));
    }
  }, [isSuccess]);

  useEffect(() => {
    if (current) {
      form.setFieldsValue(current);
    }
  }, [current]);

  return (
    <>
      <PageHeader
        onBack={() => {
          history.goBack();
        }}
        title={UPDATE_ENTITY}
        ghost={false}
        tags={StatusTag(form.getFieldValue().status)}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              history.push(`/${entity.toLowerCase()}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            Cancel
          </Button>,
          <SaveForm config={config} form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <UpdateForm current={current} />
        </Form>
      </Loading>
    </>
  );
}
