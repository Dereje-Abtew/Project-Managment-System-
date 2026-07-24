import RoleDataTableModule from '@/modules/RoleModule/RoleDataTableModule';
import configPage from './config';
import useColumnSearch from '@/hooks/useColumnSearch';

export default function Role() {
  document.title = 'Role - PMS';
  const getColumnSearchProps = useColumnSearch();

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const entityDisplayLabels = ['name'];
  const dataTableColumns = [
    {
      title: <b>Name</b>,
      dataIndex: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: <b>Description</b>,
      dataIndex: 'description',
      ...getColumnSearchProps('description'),
    },
  ];

  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    entityDisplayLabels,
  };
  return <RoleDataTableModule config={config} />;
}
