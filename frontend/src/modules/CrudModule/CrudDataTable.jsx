import React from 'react';

import { Button, Menu } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectItemById } from '@/redux/crud/selectors';
import { useCrudContext } from '@/context/crud';
import uniqueId from '@/utils/uinqueId';
import DataTable from '@/components/DataTable';
import { DownOutlined, DownloadOutlined } from '@ant-design/icons';

import { GetPermissions } from '@/utils/permissionsUtils';
import { COMPANY_BLUE_COLOR, COMPANY_ICONS_SIZE } from '@/constants/companyConstants';

function AddNewItem({ config }) {
  const { entity } = config;
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;
  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };
  const permissions = GetPermissions(entity);

  // If permissions array is empty, the resource hasn't been assigned to this role yet.
  // Fall back to showing full access (create button visible) so admins can manage the entity.
  // Only hide if the role explicitly has permissions configured but 'create' is not among them.
  const canCreate = permissions.length === 0 || permissions.includes('create');

  return canCreate ? (
    <Button onClick={handelClick} type="primary" icon={<PlusCircleOutlined />}>
      {ADD_NEW_ENTITY}
    </Button>
  ) : (
    <></>
  );
}

export function DropDownRowMenu({ row, config, exportRow }) {
  const { entity } = config;
  const dispatch = useDispatch();
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox } = crudContextAction;
  const item = useSelector(selectItemById(row._id));
  const Show = () => {
    dispatch(crud.currentItem({ data: item }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };
  function Edit() {
    dispatch(crud.currentItem({ data: item }));
    dispatch(crud.currentAction({ actionType: 'update', data: item }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }
  function Delete() {
    dispatch(crud.currentAction({ actionType: 'delete', data: item }));
    modal.open();
  }
  const permissions = GetPermissions(entity);
  // If permissions array is empty, resource isn't configured for this role yet.
  // Fall back to full access so admins can always manage entities.
  const effectivePermissions = permissions.length === 0
    ? ['read', 'update', 'delete']
    : permissions;
  return (
    <Menu style={{ width: 130 }}>
      {effectivePermissions.includes('read') && (
        <Menu.Item
          style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
          key={`${uniqueId()}`}
          icon={
            <InfoCircleOutlined
              style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
            />
          }
          onClick={Show}
        >
          Show
        </Menu.Item>
      )}

      {effectivePermissions.includes('update') && (
        <Menu.Item
          style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
          key={`${uniqueId()}`}
          icon={
            <EditOutlined style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }} />
          }
          onClick={Edit}
        >
          Edit
        </Menu.Item>
      )}

      {effectivePermissions.includes('delete') && (
        <Menu.Item
          style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
          key={`${uniqueId()}`}
          icon={
            <DeleteOutlined style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }} />
          }
          onClick={Delete}
        >
          Delete
        </Menu.Item>
      )}
      
      {exportRow && (
        <Menu.SubMenu
          key={`${uniqueId()}`}
          icon={<DownloadOutlined style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }} />}
          title="Export"
        >
          <Menu.Item key={`${uniqueId()}_json`} onClick={() => exportRow('json')}>JSON</Menu.Item>
          <Menu.Item key={`${uniqueId()}_csv`} onClick={() => exportRow('csv')}>CSV</Menu.Item>
          <Menu.Item key={`${uniqueId()}_excel`} onClick={() => exportRow('excel')}>Excel</Menu.Item>
        </Menu.SubMenu>
      )}
    </Menu>
  );
}
export default function CrudDataTable({ config }) {
  return <DataTable config={config} DropDownRowMenu={DropDownRowMenu} AddNewItem={AddNewItem} />;
}
