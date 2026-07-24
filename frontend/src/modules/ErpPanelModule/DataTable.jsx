import { selectAuth } from '@/redux/auth/selectors';
import { erp } from '@/redux/erp/actions';
import { selectListItems } from '@/redux/erp/selectors';
import { GetPermissions } from '@/utils/permissionsUtils';
import uniqueId from '@/utils/uinqueId';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Dropdown, PageHeader, Table } from 'antd';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import PageLoader from '@/components/PageLoader';
import { COMPANY_BLUE_COLOR, COMPANY_ICONS_SIZE } from '@/constants/companyConstants';
import useResponsiveTable from '@/hooks/useResponsiveTable';
import { RedoOutlined } from '@ant-design/icons';
function AddNewItem({ config }) {
  const history = useHistory();
  const { ADD_NEW_ENTITY, entity } = config;
  const handelClick = () => {
    history.push(`/${entity.toLowerCase()}/create`);
  };

  const permissions = GetPermissions(entity);

  return permissions.length > 0 && permissions.includes('create') ? (
    <Button onClick={handelClick} type="primary" icon={<PlusCircleOutlined />}>
      {ADD_NEW_ENTITY}
    </Button>
  ) : (
    <></>
  );
}

export default function DataTable({ config, DataTableDropMenu }) {
  let { entity, dataTableColumns, create = true } = config;
  const { DATATABLE_TITLE } = config;
  dataTableColumns = [
    ...dataTableColumns,
    {
      title: 'Action',
      render: (row) => (
        <Dropdown
          placement="bottomRight"
          overlay={DataTableDropMenu({ row, entity })}
          trigger={['click']}
        >
          <EditOutlined
            style={{ cursor: 'pointer', color: COMPANY_BLUE_COLOR, fontSize: COMPANY_ICONS_SIZE }}
          />
        </Dropdown>
      ),
    },
  ];
  const currentUser = useSelector(selectAuth);

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  let { pagination, items } = listResult;

  if (items.length > 0 && entity === 'project') {
    items = items.filter(
      (item) =>
        item.teamLeader?._id === currentUser.id ||
        item.projectManager?._id === currentUser.id ||
        item.director?._id === currentUser.id
    );
  }

  const dispatch = useDispatch();

  const handelDataTableLoad = useCallback((pagination) => {
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(erp.list({ entity, options }));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    dispatch(erp.list({ entity }));

    return () => {
      controller.abort();
    };
  }, []);

  const { expandedRowData, tableColumns, tableHeader } = useResponsiveTable(
    dataTableColumns,
    items
  );

  return (
    <>
      <div ref={tableHeader}>
        <PageHeader
          title={DATATABLE_TITLE}
          ghost={true}
          extra={[
            <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
              Refresh
            </Button>,
            create ? <AddNewItem config={config} key={`${uniqueId()}`} /> : <></>,
          ]}
          style={{
            padding: '20px 0px',
          }}
        ></PageHeader>
      </div>
      {listIsLoading ? (
        <div className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen">
          <PageLoader />
        </div>
      ) : (
        <Table
          columns={tableColumns}
          rowKey={(item) => item._id}
          dataSource={items}
          pagination={pagination}
          loading={listIsLoading}
          onChange={handelDataTableLoad}
        />
      )}
    </>
  );
}
