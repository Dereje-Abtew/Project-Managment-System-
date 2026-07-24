import { Divider } from 'antd';
import { useEffect, useState } from 'react';

import { CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Descriptions, PageHeader } from 'antd';

import { erp } from '@/redux/erp/actions';
import { useDispatch, useSelector } from 'react-redux';

import { useErpContext } from '@/context/erp';
import uniqueId from '@/utils/uinqueId';

import { selectCurrentItem } from '@/redux/erp/selectors';

import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import RoleTable from '../components/RoleTable';

import { COMPANY_ICONS_SIZE } from '@/constants/companyConstants';
import {
  AUTH_LOCAL_STORAGE,
  PERMISSION_LOCAL_STORAGE,
  RESOURCE_LOCAL_STORAGE,
  TOKEN_COOKIE_STORAGE,
} from '@/constants/localStorageKeyConstants';
import cryptoHelper from '@/utils/crypto';
import CookieManager from '@/utils/helpers/cookieUtils';

export default function ReadRoleItem({ config, selectedItem }) {
  const { entity } = config;
  const dispatch = useDispatch();
  const { erpContextAction } = useErpContext();
  const history = useHistory();

  const { result: currentResult } = useSelector(selectCurrentItem);

  const { readPanel, updatePanel } = erpContextAction;

  const resetErp = {
    total: 0,
  };

  const [currentErp, setCurrentErp] = useState(selectedItem ?? resetErp);
  useEffect(() => {
    const controller = new AbortController();
    if (currentResult) {
      const { resources } = currentResult;

      if (resources) {
        setCurrentErp(currentResult);
      }
    }
    return () => controller.abort();
  }, [currentResult]);

  // const { result: resourceResult, isLoading: resourceLoading } = useFetch(() =>
  //   request.get({ entity: 'resources' })
  // );

  // const { result: permissionResult, isLoading: permissionLoading } = useFetch(() =>
  //   request.get({ entity: 'permissions' })
  // );

  const resourceResult = cryptoHelper.decrypt(window.localStorage.getItem(RESOURCE_LOCAL_STORAGE));
  const permissionResult = cryptoHelper.decrypt(
    window.localStorage.getItem(PERMISSION_LOCAL_STORAGE)
  );

  if (!resourceResult || !permissionResult) {
    window.localStorage.removeItem(AUTH_LOCAL_STORAGE);
    CookieManager.clearCookie(TOKEN_COOKIE_STORAGE);
    window.location.href = '/login';
  }
  return (
    <>
      <PageHeader
        onBack={() => {
          readPanel.close();
          history.goBack();
        }}
        title={`${currentErp.name} `}
        ghost={false}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              readPanel.close();
              history.push(`/${entity.toLowerCase()}`);
            }}
            icon={
              <CloseCircleOutlined
                style={{
                  fontSize: COMPANY_ICONS_SIZE,
                }}
              />
            }
          >
            Close
          </Button>,

          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                erp.currentAction({
                  actionType: 'update',
                  data: currentErp,
                })
              );
              updatePanel.open();
              history.push(`/${entity.toLowerCase()}/update/${currentErp._id}`);
            }}
            type="primary"
            icon={<EditOutlined style={{ fontSize: COMPANY_ICONS_SIZE }} />}
          >
            Edit Role
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <Divider />
      <Descriptions title="Role Detail">
        <Descriptions.Item label="Name ">
          <strong> {currentErp.name} </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Description ">
          <strong> {currentErp.description} </strong>
        </Descriptions.Item>
      </Descriptions>

      <Divider dashed style={{ marginTop: 0, marginBottom: 15 }} />

      <RoleTable
        resources={resourceResult}
        permissionsList={permissionResult}
        current={currentErp}
      ></RoleTable>

      <div
        style={{
          width: '500px',
          float: 'right',
          textAlign: 'right',
          fontWeight: '700',
        }}
      ></div>
    </>
  );
}
