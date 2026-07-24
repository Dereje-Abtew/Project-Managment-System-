import dayjs from 'dayjs';
import React from 'react';

import CrudModule from '@/modules/CrudModule';
import DivisionForm from '@/forms/DivisionForm';

import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';

export default function Division() {
  document.title = 'Division - PMS';
  const getColumnSearchProps = useColumnSearch();

  const searchConfig = {
    displayLabels: ['divisionName'],
    searchFields: 'divisionName',
    outputValue: '_id',
  };
  const entityDisplayLabels = ['number', 'divisionName'];

  const readColumns = [
    {
      title: 'Division Name',
      dataIndex: 'divisionName',
    },
  ];

  const dataTableColumns = [
    {
      title: <b>Division Name</b>,
      dataIndex: ['divisionName'],
      ...getColumnSearchProps('divisionName'),
    },
    {
      title: 'Department Name',
      dataIndex: ['department', 'departmentName'],
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
      createForm={<DivisionForm />}
      updateForm={<DivisionForm isUpdateForm={true} />}
      config={config}
    />
  );
}
