import dayjs from 'dayjs';
import React from 'react';

import CrudModule from '@/modules/CrudModule';
import ChiefForm from '@/forms/ChiefForm';

import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';

export default function Chief() {
  document.title = 'Chief - PMS';
  const getColumnSearchProps = useColumnSearch();

  const searchConfig = {
    displayLabels: ['chiefName'],
    searchFields: 'chiefName',
    outputValue: '_id',
  };
  const entityDisplayLabels = ['number', 'chiefName'];

  const readColumns = [
    {
      title: 'Chief Name',
      dataIndex: 'chiefName',
    },
  ];

  const dataTableColumns = [
    {
      title: <b>Chief Name</b>,
      dataIndex: ['chiefName'],
      ...getColumnSearchProps('chiefName'),
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
      createForm={<ChiefForm />}
      updateForm={<ChiefForm isUpdateForm={true} />}
      config={config}
    />
  );
}
