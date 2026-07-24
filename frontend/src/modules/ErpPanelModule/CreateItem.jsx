import { Divider, Form } from 'antd';
import { useEffect } from 'react';

import { Button, PageHeader, Tag } from 'antd';

import { erp } from '@/redux/erp/actions';
import { selectCreatedItem } from '@/redux/erp/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';

import { useErpContext } from '@/context/erp';
import uniqueId from '@/utils/uinqueId';

import Loading from '@/components/Loading';
import { CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

function SaveForm({ form, config }) {
  let { CREATE_ENTITY } = config;
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusCircleOutlined />}>
      {CREATE_ENTITY}
    </Button>
  );
}
export let createFormInstance = null;

export default function CreateItem({ config, CreateForm }) {
  let { entity, CREATE_ENTITY } = config;
  const { erpContextAction } = useErpContext();
  const history = useHistory();
  const { createPanel } = erpContextAction;
  const dispatch = useDispatch();
  const { isLoading, isSuccess } = useSelector(selectCreatedItem);
  const authState = useSelector(selectAuth) || {};
  const currentUser = authState.current || authState;
  const [form] = Form.useForm();

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'create' }));
      createPanel.close();
      dispatch(erp.list({ entity }));
    }
    return () => {};
  }, [isSuccess]);

  const onSubmit = (fieldsValue) => {
    let payload = { ...fieldsValue };

    if (entity === 'Project') {
      const resolvedDirectorId =
        authState.directorId ||
        currentUser.directorId ||
        (currentUser.position === 'Director' ? currentUser.id : undefined);
      const resolvedManagerId =
        authState.managerId ||
        currentUser.managerId ||
        (currentUser.position === 'Manager' ? currentUser.id : undefined);

      payload = {
        ...payload,
        director: payload.director || resolvedDirectorId,
        projectManager: payload.projectManager || resolvedManagerId,
        deliverables: Array.isArray(payload.deliverables) ? payload.deliverables : [],
        risk: Array.isArray(payload.risk) ? payload.risk : [],
        teamMember: Array.isArray(payload.teamMember) ? payload.teamMember : [],
        startDate: payload.startDate ? payload.startDate.toISOString() : undefined,
        endDate: payload.endDate ? payload.endDate.toISOString() : undefined,
      };
    }

    dispatch(erp.create({ entity, jsonData: payload }))
      .then((response) => {
        if (response) {
          history.push(`/${entity.toLowerCase()}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
  createFormInstance = form;

  return (
    <>
      <PageHeader
        onBack={() => {
          history.push(`/${entity.toLowerCase()}`);
        }}
        title={CREATE_ENTITY}
        ghost={false}
        tags={<Tag color="volcano">Draft</Tag>}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => history.push(`/${entity.toLowerCase()}`)}
            icon={<CloseCircleOutlined />}
          >
            Cancel
          </Button>,
          <SaveForm form={form} config={config} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <CreateForm form={form} />
        </Form>
      </Loading>
    </>
  );
}
