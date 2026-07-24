import dayjs from 'dayjs';
import React from 'react';

import CrudModule from '@/modules/CrudModule';
import DepartmentForm from '@/forms/DepartmentForm';

import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';

export default function Departmnet() {
  document.title = 'Department - PMS';
  const getColumnSearchProps = useColumnSearch();

  const searchConfig = {
    displayLabels: ['DepartmentName'],
    searchFields: 'DepartmentName',
    outputValue: '_id',
  };
  const entityDisplayLabels = ['number', 'DepartmentName'];

  const readColumns = [
    {
      title: 'Department Name',
      dataIndex: 'departmentName',
    },
  ];

  const dataTableColumns = [
    {
      title: <b>Department Name</b>,
      dataIndex: ['departmentName'],
      ...getColumnSearchProps('DepartmentName'),
    },
    {
      title: 'Chief Name',
      dataIndex: ['chief', 'chiefName'],
    },
    {
      title: 'Created On',
      dataIndex: 'created',
      render: (date) => dayjs(date).format('dddd, MMMM D, YYYY'),
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
      createForm={<DepartmentForm />}
      updateForm={<DepartmentForm isUpdateForm={true} />}
      config={config}
    />
  );
}
