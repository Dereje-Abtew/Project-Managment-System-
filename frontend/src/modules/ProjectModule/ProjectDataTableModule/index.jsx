import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dropdown,
  PageHeader,
  Table,
  Descriptions,
  Tooltip,
  Input,
  Select,
} from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  PlusCircleOutlined,
  RedoOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ErpLayout } from '@/layout';
import { erp } from '@/redux/erp/actions';
import { selectAuth } from '@/redux/auth/selectors';
import { selectListItems } from '@/redux/erp/selectors';
import { GetPermissions } from '@/utils/permissionsUtils';
import PageLoader from '@/components/PageLoader';
import Delete from '@/modules/ErpPanelModule/DeleteItem';
import { useErpContext } from '@/context/erp';
import useResponsiveTable from '@/hooks/useResponsiveTable';
import uniqueId from '@/utils/uinqueId';
import { COMPANY_BLUE_COLOR, COMPANY_ICONS_SIZE } from '@/constants/companyConstants';

import DataTableDropMenu from './components/DataTableDropMenu';
import ProjectGridCard from './components/ProjectGridCard';

const { Option } = Select;

// ─── Add New button ────────────────────────────────────────────────────────────
function AddNewItem({ config }) {
  const history = useHistory();
  const { ADD_NEW_ENTITY, entity } = config;
  const permissions = GetPermissions(entity);
  if (!permissions.includes('create')) return null;
  return (
    <Button
      type="primary"
      icon={<PlusCircleOutlined />}
      onClick={() => history.push(`/${entity.toLowerCase()}/create`)}
    >
      {ADD_NEW_ENTITY}
    </Button>
  );
}

// ─── Main module ───────────────────────────────────────────────────────────────
function ProjectDataTable({ config }) {
  const dispatch = useDispatch();
  const { state } = useErpContext();
  const { deleteModal } = state;

  // view mode: 'grid' | 'list'
  const [viewMode, setViewMode] = useState('grid');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const currentUser = useSelector(selectAuth) || {};
  const currentUserId = currentUser.id || currentUser.current?.id;
  const { result: listResult, isLoading } = useSelector(selectListItems);
  let { pagination, items } = listResult;

  // Filter to only projects the current user belongs to
  if (items.length > 0) {
    items = items.filter((item) => {
      if (!currentUserId) return true; // show all if user id unknown
      const asLeader = item.teamLeader?._id === currentUserId;
      const asManager = item.projectManager?._id === currentUserId;
      const asDirector = item.director?._id === currentUserId;
      const asMember = Array.isArray(item.teamMemberInfo)
        ? item.teamMemberInfo.some((m) => m?._id === currentUserId)
        : Array.isArray(item.teamMember)
        ? item.teamMember.some((m) => m?._id === currentUserId)
        : false;
      const asQA = Array.isArray(item.qualityAssuranceInfo)
        ? item.qualityAssuranceInfo.some((m) => m?._id === currentUserId)
        : Array.isArray(item.qualityAssurance)
        ? item.qualityAssurance.some((m) => m?._id === currentUserId)
        : false;
      return asLeader || asManager || asDirector || asMember || asQA;
    });
  }

  // Apply search + status filter
  const filteredItems = items.filter((item) => {
    const matchSearch =
      !searchText ||
      item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category?.categoryName?.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  useEffect(() => {
    dispatch(erp.list({ entity: config.entity }));
  }, []);

  const handleTableChange = useCallback(
    (pagination) => {
      dispatch(erp.list({ entity: config.entity, options: { page: pagination.current, items: pagination.pageSize } }));
    },
    [config.entity]
  );

  // Build columns for list view (reuse from config)
  const { entity, dataTableColumns = [] } = config;
  const serialColumn = {
    title: '#',
    key: 'serial',
    width: 80,
    align: 'center',
    render: (_t, _r, index) => {
      const current = pagination?.current || 1;
      const pageSize = pagination?.pageSize || 10;
      return (current - 1) * pageSize + (index + 1);
    },
  };

  const listColumns = [
    serialColumn,
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

  const { expandedRowData, tableColumns } = useResponsiveTable(listColumns, filteredItems);

  return (
    <>
      <div style={styles.wrapper}>
        {/* ── Page Header ── */}
        <PageHeader
          title={config.DATATABLE_TITLE}
          ghost={false}
          style={styles.pageHeader}
          extra={[
            /* Search */
            <Input
              key="search"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Search projects…"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220, borderRadius: 8 }}
            />,

            /* Status filter */
            <Select
              key="status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 140, borderRadius: 8 }}
            >
              <Option value="all">All Statuses</Option>
              <Option value="onGoing">On Going</Option>
              <Option value="pending">Pending</Option>
              <Option value="closed">Closed</Option>
            </Select>,

            /* View toggle - removed per user request */

            /* Refresh */
            <Button key="refresh" icon={<RedoOutlined />} onClick={() => dispatch(erp.list({ entity: config.entity }))}>
              Refresh
            </Button>,

            /* Add New */
            <AddNewItem key="add" config={config} />,
          ]}
        />

        {/* ── Content ── */}
        {isLoading ? (
          <div style={styles.loaderWrap}>
            <PageLoader />
          </div>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          filteredItems.length === 0 ? (
            <div style={styles.empty}>No projects found.</div>
          ) : (
            <div style={styles.grid}>
              {filteredItems.map((project) => (
                <div
                  key={project._id}
                  style={styles.gridItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <ProjectGridCard project={project} />
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── LIST VIEW ── */
          <Table
            columns={tableColumns}
            rowKey={(item) => item._id}
            dataSource={filteredItems}
            pagination={pagination}
            loading={isLoading}
            onChange={handleTableChange}
            style={{ borderRadius: 12, overflow: 'hidden' }}
          />
        )}
      </div>

      {/* Delete modal */}
      <Delete config={config} isVisible={deleteModal.isOpen} />
    </>
  );
}

export default function ProjectDataTableModule({ config }) {
  return (
    <ErpLayout>
      <ProjectDataTable config={config} />
    </ErpLayout>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    padding: '0 0 40px',
  },
  pageHeader: {
    background: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    padding: '16px 24px',
  },
  loaderWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  gridItem: {
    borderRadius: 14,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  toggleGroup: {
    display: 'inline-flex',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #d9d9d9',
    background: '#fff',
  },
  toggleBtn: {
    width: 36,
    height: 32,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s, color 0.2s',
    color: '#8c8c8c',
    outline: 'none',
  },
  toggleBtnActive: {
    background: '#2E8B3A',
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 0',
    color: '#bfbfbf',
    fontSize: 16,
  },
};
