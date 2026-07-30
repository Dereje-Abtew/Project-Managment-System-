import React from 'react';
import CrudModule from '@/modules/CrudModule';
import ServiceProviderForm from '@/forms/ServiceProviderForm';
import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';
import { Button, Tag, Tooltip } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

export default function ServiceProvider() {
  document.title = 'Service Providers - PMS';
  const getColumnSearchProps = useColumnSearch();
  const history = useHistory();

  const searchConfig = {
    displayLabels: ['name', 'company'],
    searchFields: 'name,company',
    outputValue: '_id',
  };

  const entityDisplayLabels = ['name'];

  const readColumns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Company', dataIndex: 'company' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Address', dataIndex: 'address' },
    {
      title: 'Portal Access',
      dataIndex: 'username',
      render: (username) =>
        username
          ? <Tag color="green">✓ {username}</Tag>
          : <Tag color="red">No portal account</Tag>,
    },
  ];

  const dataTableColumns = [
    {
      title: <b>Name</b>,
      dataIndex: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: <b>Company</b>,
      dataIndex: 'company',
      ...getColumnSearchProps('company'),
    },
    {
      title: <b>Email</b>,
      dataIndex: 'email',
    },
    {
      title: <b>Phone</b>,
      dataIndex: 'phone',
    },
    {
      title: <b>Portal Access</b>,
      dataIndex: 'username',
      render: (username) =>
        username
          ? <Tag color="green">✓ Active</Tag>
          : <Tag color="default">None</Tag>,
    },
    {
      title: <b>UAT Sign-Offs</b>,
      key: 'uat',
      render: (_, record) => (
        <Tooltip title={`View UATs sent to ${record.name}`}>
          <Button
            size="small"
            icon={<SafetyCertificateOutlined />}
            style={{ color: '#1a5c38', borderColor: '#1a5c38' }}
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to UAT page — the pre-filter is handled via URL state
              history.push('/uat-signoff', { spId: record._id, spName: record.name });
            }}
          >
            View UATs
          </Button>
        </Tooltip>
      ),
    },
  ];

  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    entityDisplayLabels,
  };

  return (
    <CrudModule
      createForm={<ServiceProviderForm />}
      updateForm={<ServiceProviderForm isUpdateForm={true} />}
      config={config}
    />
  );
}
