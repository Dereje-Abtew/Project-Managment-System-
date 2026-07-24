import UserForm from '@/forms/UserForm';
import UserDataTableModule from '@/modules/UserModule/UserDataTableModule';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';

export default function User() {
  document.title = 'Team Members - PMS';
  const getColumnSearchProps = useColumnSearch();

  const searchConfig = {
    displayLabels: ['firstName', 'lastName'],
    searchFields: 'firstName,lastName',
    outputValue: '_id',
  };
  const entityDisplayLabels = ['firstName', 'lastName'];

  const readColumns = [
    { title: 'First Name', dataIndex: 'firstName' },
    { title: 'Last Name', dataIndex: 'lastName' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Department', dataIndex: 'departmentName' },
    { title: 'Division', dataIndex: 'divisionName' },
    { title: 'Email', dataIndex: 'email' },
  ];

  const dataTableColumns = [
    {
      title: <b>First Name</b>,
      dataIndex: ['firstName'],
      ...getColumnSearchProps('firstName'),
    },
    {
      title: <b>Last Name</b>,
      dataIndex: ['lastName'],
      ...getColumnSearchProps('lastName'),
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
    },
    {
      title: <b>Email</b>,
      dataIndex: ['email'],
      ...getColumnSearchProps('email'),
    },
    {
      title: <b>Phone</b>,
      dataIndex: ['phone'],
      ...getColumnSearchProps('phone'),
    },
    {
      title: <b>Job Title</b>,
      dataIndex: 'jobTitle',
      ...getColumnSearchProps('jobTitle'),
    },
    {
      title: <b>Status</b>,
      dataIndex: 'enabled',
      render: (enabled) => (
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          checked={enabled}
        />
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
    <UserDataTableModule
      createForm={<UserForm />}
      updateForm={<UserForm isUpdateForm={true} />}
      config={config}
    />
  );
}
