import { Menu } from 'antd';

import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectItemById } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { GetPermissions } from '@/utils/permissionsUtils';

import uniqueId from '@/utils/uinqueId';
import { useHistory } from 'react-router-dom';
import {
  COMPANY_BLUE_COLOR,
  COMPANY_DANGER_COLOR,
  COMPANY_ICONS_SIZE,
  COMPANY_YELLOW_COLOR,
} from '@/constants/companyConstants';

export default function DataTableDropMenu({ row, entity }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;
  const item = useSelector(selectItemById(row._id));
  const currentItem = item || row;

  function Read() {
    dispatch(erp.currentItem({ data: currentItem }));

    history.push(`/${entity.toLowerCase()}/read/${row._id}`);
  }

  function Edit() {
    dispatch(erp.currentAction({ actionType: 'update', data: currentItem }));

    history.push(`/${entity.toLowerCase()}/update/${row._id}`);
  }
  function Delete() {
    dispatch(erp.currentAction({ actionType: 'delete', data: currentItem }));
    modal.open();
  }

  const permissions = GetPermissions(entity);
  if (permissions.length === 0) {
    return <></>;
  }
  return (
    <Menu
      style={{ width: 130 }}
      mode="inline"
      openAnimation="zoom-big-fast"
      itemStyle={{
        border: '1px solid transparent',
        transition: 'border-color 0.3s ease-in-out',
      }}
      hoverMenuItemStyle={{
        borderColor: 'blue',
      }}
    >
      {permissions.includes('read') && (
        <Menu.Item
          style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
          key={`${uniqueId()}`}
          icon={
            <InfoCircleOutlined
              style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
            />
          }
          onClick={Read}
        >
          Details
        </Menu.Item>
      )}

      {permissions.includes('update') && (
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

      {permissions.includes('read') && (
        <Menu.Item
          style={{ color: COMPANY_YELLOW_COLOR, fontSize: COMPANY_ICONS_SIZE }}
          key={`${uniqueId()}`}
          icon={
            <UnorderedListOutlined
              style={{ color: COMPANY_YELLOW_COLOR, fontSize: COMPANY_ICONS_SIZE }}
            />
          }
          onClick={() => {
            dispatch(erp.currentItem({ data: currentItem }));
            history.push(`/project/${row._id}`);
          }}
        >
          Tasks
        </Menu.Item>
      )}

      {permissions.includes('delete') && (
        <Menu.Item
          style={{ color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
          key={`${uniqueId()}`}
          icon={
            <DeleteOutlined style={{ color: COMPANY_DANGER_COLOR, fontSize: COMPANY_ICONS_SIZE }} />
          }
          onClick={Delete}
        >
          <span style={{ color: COMPANY_DANGER_COLOR }}>Trash</span>
        </Menu.Item>
      )}
    </Menu>
  );
}
