import { Menu } from 'antd';

import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectItemById } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { GetPermissions } from '@/utils/permissionsUtils';

import uniqueId from '@/utils/uinqueId';
import { useHistory } from 'react-router-dom';
import { COMPANY_BLUE_COLOR, COMPANY_ICONS_SIZE } from '@/constants/companyConstants';

export default function DataTableDropMenu({ row, entity }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;
  const item = useSelector(selectItemById(row._id));
  function Read() {
    dispatch(erp.currentItem({ data: item }));

    history.push(`/role/read/${row._id}`);
  }

  function Edit() {
    dispatch(erp.currentAction({ actionType: 'update', data: item }));

    history.push(`/role/update/${row._id}`);
  }
  function Delete() {
    dispatch(erp.currentAction({ actionType: 'delete', data: item }));
    modal.open();
  }

  const permissions = GetPermissions(entity);
  if (permissions.length === 0) {
    return <></>;
  }
  return (
    <Menu style={{ width: 130 }}>
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
          Show
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

      {permissions.includes('delete') && (
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
    </Menu>
  );
}
