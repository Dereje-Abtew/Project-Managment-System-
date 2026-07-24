import { useEffect, useState } from 'react';

import { Col, Form, Input, Row } from 'antd';

import RolePermissionsTable from '../components/RolePermissions';

import {
  AUTH_LOCAL_STORAGE,
  PERMISSION_LOCAL_STORAGE,
  RESOURCE_LOCAL_STORAGE,
  TOKEN_COOKIE_STORAGE,
} from '@/constants/localStorageKeyConstants';
import { createFormInstance } from '@/modules/ErpPanelModule/CreateItem';
import { updateFormInstance } from '@/modules/ErpPanelModule/UpdateItem';
import cryptoHelper from '@/utils/crypto';
import CookieManager from '@/utils/helpers/cookieUtils';
export default function RoleForm({ current = null }) {
  let myForm = createFormInstance ? createFormInstance : updateFormInstance;

  const [resources, setResources] = useState([]);
  const handleResourceChange = (value) => {
    setResources(value);
  };

  const resourceResult = cryptoHelper.decrypt(window.localStorage.getItem(RESOURCE_LOCAL_STORAGE));
  const permissionResult = cryptoHelper.decrypt(
    window.localStorage.getItem(PERMISSION_LOCAL_STORAGE)
  );
  if (!resourceResult || !permissionResult) {
    window.localStorage.removeItem(AUTH_LOCAL_STORAGE);
    CookieManager.clearCookie(TOKEN_COOKIE_STORAGE);
    window.location.href = '/login';
  }
  useEffect(() => {
    myForm.setFieldsValue({ resources });
  }, [resources]);

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={12}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: 'Please input Role name!',
              },
            ]}
          >
            <Input placeholder="Name" />
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={12}>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: 'Please input Project Description!',
              },
            ]}
          >
            <Input placeholder="Description" />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Form.Item
            name="resources"
            initialValue={resources}
            rules={[
              {
                required: true,
                message: 'At least one permission is required!',
              },
            ]}
          >
            <Input type="hidden" />
          </Form.Item>
        </Col>
      </Row>
      <RolePermissionsTable
        resources={resourceResult}
        permissionsList={permissionResult}
        onResourceChange={handleResourceChange}
        current={current}
      ></RolePermissionsTable>
    </>
  );
}
