import React, { useState, useEffect } from 'react';
import { Table, Switch } from 'antd';

const RolePermissionsTable = ({ resources, permissionsList, onResourceChange }) => {
  permissionsList.sort((a, b) => a.name.localeCompare(b.name));
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    handleSavePermissions();
  }, [permissions]);

  const handlePermissionChange = (resource, permission, checked) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [resource]: checked
        ? [...(prevPermissions[resource] || []), permission]
        : (prevPermissions[resource] || []).filter((perm) => perm !== permission),
    }));
  };

  const handleSavePermissions = () => {
    const selectedPermissions = Object.entries(permissions).map(([resource, permissionIds]) => ({
      resource,
      permissions: permissionIds,
    }));
    onResourceChange(selectedPermissions);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
      render: (resource) => {
        const { name } = resources.find((res) => res._id === resource);
        if (name === 'Dashboard') {
          return (
            <Switch
              checked={(permissions[resource] || []).includes(permission._id)}
              onChange={(checked) => handlePermissionChange(resource, permission._id, checked)}
              disabled={permission.name !== 'read'}
            />
          );
        } else {
          return (
            <Switch
              checked={(permissions[resource] || []).includes(permission._id)}
              onChange={(checked) => handlePermissionChange(resource, permission._id, checked)}
            />
          );
        }
      },
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

export default RolePermissionsTable;
