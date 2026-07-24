import dayjs from 'dayjs';
import React from 'react';

import CrudModule from '@/modules/CrudModule';
import CategoryForm from '@/forms/CategoryForm';

import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';

export default function Category() {
  document.title = 'Category - PMS';
  const getColumnSearchProps = useColumnSearch();

  const searchConfig = {
    displayLabels: ['categoryName'],
    searchFields: 'categoryName',
    outputValue: '_id',
  };
  const entityDisplayLabels = ['number', 'categoryName'];

  const readColumns = [
    {
      title: 'Category Name',
      dataIndex: 'categoryName',
    },
  ];

  const dataTableColumns = [
    {
      title: <b>Category Name</b>,
      dataIndex: ['categoryName'],
      ...getColumnSearchProps('categoryName'),
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
      createForm={<CategoryForm />}
      updateForm={<CategoryForm isUpdateForm={true} />}
      config={config}
    />
  );
}
