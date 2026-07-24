import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  PageHeader,
  Table,
  Descriptions,
  Tooltip,
  Input,
  Select,
  Form,
  message,
  Pagination,
} from 'antd';
import {
  AppstoreOutlined,
  BarsOutlined,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
  SaveOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import {
  selectListItems,
  selectCreatedItem,
  selectUpdatedItem,
} from '@/redux/crud/selectors';
import { GetPermissions } from '@/utils/permissionsUtils';
import { useCrudContext } from '@/context/crud';
import PageLoader from '@/components/PageLoader';
import DeleteModal from '@/components/DeleteModal';
import { CrudLayout } from '@/layout';
import UserGridCard from './components/UserGridCard';
import useResponsiveTable from '@/hooks/useResponsiveTable';
import Loading from '@/components/Loading';
import dayjs from 'dayjs';

const BRAND_GREEN = '#2E8B3A';
const BRAND_YELLOW = '#e6a817';

const { Option } = Select;

function normalizeRelationValue(value) {
  if (!value) return undefined;
  if (typeof value === 'object' && value !== null) {
    return value._id ? value : value;
  }
  return value;
}

function buildUserFormValues(current) {
  return {
    firstName: current?.firstName || '',
    lastName: current?.lastName || '',
    email: current?.email || '',
    phone: current?.phone || '',
    jobTitle: current?.jobTitle || '',
    position: current?.position || '',
    enabled: current?.enabled !== false,
    password: '',
    confirmPassword: '',
    role: normalizeRelationValue(current?.role),
    chief: normalizeRelationValue(current?.chief),
    department: normalizeRelationValue(current?.department),
    division: normalizeRelationValue(current?.division),
  };
}

// ─── Full-width Create Modal ───────────────────────────────────────────────────
function CreateModal({ config, formElements, open, onClose }) {
  const dispatch = useDispatch();
  const { isLoading, isSuccess } = useSelector(selectCreatedItem);
  const [form] = Form.useForm();
  const { entity } = config;

  const onSubmit = (fieldsValue) => {
    const trimmed = Object.keys(fieldsValue).reduce((acc, key) => {
      acc[key] = typeof fieldsValue[key] === 'string' ? fieldsValue[key].trim() : fieldsValue[key];
      return acc;
    }, {});
    dispatch(crud.create({ entity, jsonData: trimmed }));
  };

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(crud.resetAction({ actionType: 'create' }));
      dispatch(crud.list({ entity }));
      onClose();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title={
        <span style={{ fontSize: 18, fontWeight: 700, color: BRAND_GREEN }}>
          + Add New Team Member
        </span>
      }
      visible={open}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ top: 40 }}
      bodyStyle={{ padding: '24px 32px' }}
      destroyOnClose
    >
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {formElements}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN, minWidth: 120 }}
            >
              Save Team Member
            </Button>
            <Button onClick={onClose} icon={<CloseCircleOutlined />}>
              Cancel
            </Button>
          </div>
        </Form>
      </Loading>
    </Modal>
  );
}

// ─── Full-width Edit Modal ─────────────────────────────────────────────────────
function EditModal({ config, formElements, open, onClose }) {
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const [form] = Form.useForm();
  const { entity } = config;
  const { crudContextAction } = useCrudContext();
  const { modal } = crudContextAction;

  // Auto-fill all fields when modal opens with current user data
  useEffect(() => {
    if (current && open) {
      form.setFieldsValue(buildUserFormValues(current));
    }
    if (!open) {
      form.resetFields();
    }
  }, [current, open, form]);

  // Handle Update
  const onSubmit = (fieldsValue) => {
    const id = current._id;
    // Only include password if user typed one
    const jsonData = { ...fieldsValue };
    if (!jsonData.password || jsonData.password.trim() === '') {
      delete jsonData.password;
    }
    delete jsonData.confirmPassword;
    dispatch(crud.update({ entity, id, jsonData }));
  };

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(crud.resetAction({ actionType: 'update' }));
      dispatch(crud.list({ entity }));
      onClose();
    }
  }, [isSuccess]);

  // Handle Toggle Active/Inactive
  const handleToggleStatus = () => {
    const id = current._id;
    const newEnabled = !current.enabled;
    dispatch(crud.update({ entity, id, jsonData: { enabled: newEnabled } }));
  };

  // Handle Delete
  const handleDelete = () => {
    dispatch(crud.currentAction({ actionType: 'delete', data: current }));
    onClose();
    modal.open();
  };

  const isActive = current?.enabled !== false;

  return (
    <Modal
      title={
        <span style={{ fontSize: 18, fontWeight: 700, color: BRAND_GREEN }}>
          ✎ Edit Team Member
        </span>
      }
      visible={open}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ top: 40 }}
      bodyStyle={{ padding: '24px 32px' }}
      destroyOnClose
    >
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {/* All existing UserForm fields rendered here */}
          {formElements}

          {/* ── Password fields (from CodeIgniter: leave blank = no change) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
            <Form.Item
              label={
                <span>
                  Password{' '}
                  <span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>
                    (leave blank to keep current)
                  </span>
                </span>
              }
              name="password"
            >
              <Input.Password placeholder="New password (optional)" autoComplete="new-password" />
            </Form.Item>

            <Form.Item
              label={
                <span>
                  Confirm Password{' '}
                  <span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>
                    (leave blank to keep current)
                  </span>
                </span>
              }
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const pwd = getFieldValue('password');
                    if (!pwd && !value) return Promise.resolve();
                    if (pwd === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" autoComplete="new-password" />
            </Form.Item>
          </div>

          {/* ── Action buttons (from CodeIgniter style) ─────────────────── */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {/* Login — impersonate / view as this user (future feature, shown for UI parity) */}
            <Button
              style={{
                background: BRAND_YELLOW,
                borderColor: BRAND_YELLOW,
                color: '#fff',
                fontWeight: 600,
                minWidth: 90,
              }}
              onClick={() => {
                message.info('Login-as feature coming soon.');
              }}
            >
              Login
            </Button>

            {/* Delete */}
            <Button
              danger
              style={{ fontWeight: 600, minWidth: 90 }}
              onClick={() => {
                dispatch(crud.currentAction({ actionType: 'delete', data: current }));
                onClose();
              }}
            >
              Delete
            </Button>

            {/* Deactive / Active toggle */}
            <Button
              style={{
                background: isActive ? '#dc3545' : BRAND_GREEN,
                borderColor: isActive ? '#dc3545' : BRAND_GREEN,
                color: '#fff',
                fontWeight: 600,
                minWidth: 110,
              }}
              onClick={handleToggleStatus}
            >
              {isActive ? 'Deactive' : 'Active'}
            </Button>

            {/* Update — submits the form */}
            <Button
              htmlType="submit"
              style={{
                background: '#b8860b',
                borderColor: '#b8860b',
                color: '#fff',
                fontWeight: 600,
                minWidth: 90,
              }}
            >
              Update
            </Button>
          </div>
        </Form>
      </Loading>
    </Modal>
  );
}

// ─── Add New button ────────────────────────────────────────────────────────────
function AddNewItem({ config, onAdd }) {
  const { ADD_NEW_ENTITY, entity } = config;
  const permissions = GetPermissions(entity);
  if (!permissions.includes('create')) return null;
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={onAdd}
      style={{ background: BRAND_GREEN, borderColor: BRAND_GREEN, fontWeight: 600 }}
    >
      + Create
    </Button>
  );
}

// ─── Main content grid/list ────────────────────────────────────────────────────
function UserDataTableContent({ config, onEditUser }) {
  const dispatch = useDispatch();

  const [viewMode, setViewMode] = useState('grid');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { result: listResult, isLoading } = useSelector(selectListItems);
  const { pagination, items = [] } = listResult;

  const filteredItems = items.filter((item) => {
    const matchSearch =
      !searchText ||
      item.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.jobTitle?.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.enabled === true) ||
      (statusFilter === 'disabled' && item.enabled === false);

    return matchSearch && matchStatus;
  });

  const { entity, dataTableColumns = [] } = config;
  const { crudContextAction } = useCrudContext();

  const listColumns = [
    ...dataTableColumns,
    {
      title: 'Action',
      render: (row) => (
        <Button
          size="small"
          onClick={() => {
            dispatch(crud.currentAction({ actionType: 'update', data: row }));
            onEditUser();
          }}
          style={{ color: BRAND_GREEN, borderColor: BRAND_GREEN }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const { expandedRowData, tableColumns } = useResponsiveTable(listColumns, filteredItems);

  return (
    <>
      <div style={styles.wrapper}>
        <PageHeader
          title={
            <span style={{ fontWeight: 700, fontSize: 22, color: '#222' }}>
              Team Members
            </span>
          }
          ghost={false}
          style={styles.pageHeader}
          extra={[
            <Input
              key="search"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Search members…"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220, borderRadius: 8 }}
            />,

            <Select
              key="status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 140 }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="disabled">Disabled</Option>
            </Select>,

            <div key="toggle" style={styles.toggleGroup}>
              <Tooltip title="Grid View">
                <button
                  style={{ ...styles.toggleBtn, ...(viewMode === 'grid' ? styles.toggleBtnActive : {}) }}
                  onClick={() => setViewMode('grid')}
                >
                  <AppstoreOutlined />
                </button>
              </Tooltip>
              <Tooltip title="List View">
                <button
                  style={{ ...styles.toggleBtn, ...(viewMode === 'list' ? styles.toggleBtnActive : {}) }}
                  onClick={() => setViewMode('list')}
                >
                  <BarsOutlined />
                </button>
              </Tooltip>
            </div>,

            <Button
              key="refresh"
              icon={<RedoOutlined />}
              onClick={() => dispatch(crud.list({ entity: config.entity, options: { page: 1, items: 6 } }))}
            >
              Refresh
            </Button>,
          ]}
        />

        {isLoading ? (
          <div style={styles.loaderWrap}>
            <PageLoader />
          </div>
        ) : viewMode === 'grid' ? (
          filteredItems.length === 0 ? (
            <div style={styles.empty}>No team members found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={styles.grid}>
                {filteredItems.map((user) => (
                  <UserGridCard key={user._id} user={user} onEdit={() => {
                    dispatch(crud.currentAction({ actionType: 'update', data: user }));
                    onEditUser();
                  }} />
                ))}
              </div>
              {pagination && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize || 6}
                    total={pagination.total}
                    onChange={(page, pageSize) =>
                      dispatch(crud.list({ entity: config.entity, options: { page, items: pageSize } }))
                    }
                  />
                </div>
              )}
            </div>
          )
        ) : (
          <Table
            columns={tableColumns}
            rowKey={(item) => item._id}
            dataSource={filteredItems}
            pagination={{ ...pagination, pageSize: pagination.pageSize || 6, position: ['bottomCenter'] }}
            loading={isLoading}
            onChange={(pag) =>
              dispatch(crud.list({ entity: config.entity, options: { page: pag.current, items: pag.pageSize } }))
            }
            style={{ borderRadius: 12, overflow: 'hidden' }}
          />
        )}
      </div>
    </>
  );
}

// ─── Exported Module ───────────────────────────────────────────────────────────
export default function UserDataTableModule({ config, createForm, updateForm }) {
  const dispatch = useDispatch();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(crud.resetState());
    dispatch(crud.list({ entity: config.entity, options: { page: 1, items: 6 } }));
  }, []);

  // We still use CrudLayout to get DefaultLayout + DeleteModal working,
  // but we hide the side panel completely (pass null to both side panel props)
  return (
    <CrudLayout config={config} fixHeaderPanel={null} sidePanelTopContent={null} sidePanelBottomContent={null}>
      {/* Add New button is part of the PageHeader extra via a wrapper */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
        <AddNewItem config={config} onAdd={() => setCreateOpen(true)} />
      </div>

      <UserDataTableContent config={config} onEditUser={() => setEditOpen(true)} />

      {/* Create Modal */}
      <CreateModal
        config={config}
        formElements={createForm}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit Modal */}
      <EditModal
        config={config}
        formElements={updateForm}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      {/* Delete Modal */}
      <DeleteModal config={config} />
    </CrudLayout>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  wrapper: { padding: '0 0 40px' },
  pageHeader: {
    background: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    padding: '16px 24px',
  },
  loaderWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 24,
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
    color: '#8c8c8c',
    outline: 'none',
  },
  toggleBtnActive: { background: BRAND_GREEN, color: '#fff' },
  empty: { textAlign: 'center', padding: '80px 0', color: '#bfbfbf', fontSize: 16 },
};
