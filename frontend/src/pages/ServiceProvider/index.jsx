import React from 'react';
import CrudModule from '@/modules/CrudModule';
import ServiceProviderForm from '@/forms/ServiceProviderForm';
import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';

export default function ServiceProvider() {
  document.title = 'Service Providers - PMS';
  const getColumnSearchProps = useColumnSearch();

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
