import React, { useEffect } from 'react';
import { Form, Divider } from 'antd';
import dayjs from 'dayjs';
import { Button, PageHeader } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';

import uniqueId from '@/utils/uinqueId';
import { selectUpdatedItem } from '@/redux/erp/selectors';
import Loading from '@/components/Loading';

import { CloseCircleOutlined, SaveFilled } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';

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

export default function UpdateDeliverable({ config, UpdateForm }) {
  let { entity, UPDATE_ENTITY } = config;
  const dispatch = useDispatch();
  const history = useHistory();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const [form] = Form.useForm();
  updateFormInstance = form;

  const { id } = useParams();

  const onSubmit = (fieldsValue) => {
    const payload = {
      ...fieldsValue,
      deliverables: Array.isArray(fieldsValue.deliverables) ? fieldsValue.deliverables : [],
      risk: Array.isArray(fieldsValue.risk) ? fieldsValue.risk : [],
      teamMember: Array.isArray(fieldsValue.teamMember) ? fieldsValue.teamMember : [],
      startDate: fieldsValue.startDate ? fieldsValue.startDate.toISOString() : undefined,
      endDate: fieldsValue.endDate ? fieldsValue.endDate.toISOString() : undefined,
    };

    dispatch(erp.update({ entity, id, jsonData: payload }));
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
      const deliverables = Array.isArray(current.deliverables)
        ? current.deliverables.map((mile) => {
            const updatedMile = { ...mile };
            if (updatedMile.startDate) {
              updatedMile.startDate = dayjs(updatedMile.startDate);
            }
            if (updatedMile.endDate) {
              updatedMile.endDate = dayjs(updatedMile.endDate);
            }
            return updatedMile;
          })
        : current.deliverables;

      const currentToSet = {
        ...current,
        deliverables,
        startDate: current.startDate ? dayjs(current.startDate) : current.startDate,
        endDate: current.endDate ? dayjs(current.endDate) : current.endDate,
      };

      form.setFieldsValue(currentToSet);
    }
  }, [current, form]);

  return (
    <>
      <PageHeader
        onBack={() => {
          history.goBack();
        }}
        title={UPDATE_ENTITY}
        ghost={false}
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
          {<UpdateForm current={current} form={form} />}
        </Form>
      </Loading>
    </>
  );
}
