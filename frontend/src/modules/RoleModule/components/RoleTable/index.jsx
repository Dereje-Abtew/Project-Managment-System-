import React from 'react';
import { Table, Switch } from 'antd';

const RoleTable = ({ resources, permissionsList, current }) => {
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getResourcePermissions = (resourceId) => {
    const resource = current.resources.find((resource) => resource.resource === resourceId);
    if (resource) {
      return resource.permissions;
    }
    return [];
  };

  const columns = [
    {
      title: 'Resource',
      dataIndex: 'name',
      key: 'name',
    },
    ...permissionsList.map((permission) => ({
      title: capitalizeFirstLetter(permission.name),
      dataIndex: '_id',
      key: permission._id,
      render: (resource) => (
        <Switch checked={getResourcePermissions(resource).includes(permission._id)} />
      ),
    })),
  ];

  const dataSource = resources.map((resource) => ({
    ...resource,
    key: resource.id,
  }));

  return (
    <>
      <Table columns={columns} dataSource={dataSource} />
    </>
  );
};

export default RoleTable;
