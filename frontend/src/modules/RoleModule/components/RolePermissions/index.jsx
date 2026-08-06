import React, { useState, useEffect } from 'react';
import { Table, Switch, Button, Space, Tag } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const RolePermissionsTable = ({ resources, permissionsList, onResourceChange, current = null }) => {
  permissionsList.sort((a, b) => a.name.localeCompare(b.name));
  const [permissions, setPermissions] = useState({});

  // Initialize permissions from current role (for edit mode)
  useEffect(() => {
    if (current && current.resources) {
      const initialPermissions = {};
      current.resources.forEach((res) => {
        initialPermissions[res.resource] = res.permissions || [];
      });
      setPermissions(initialPermissions);
    }
  }, [current]);

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

  // Select ALL permissions for all resources
  const handleSelectAll = () => {
    const allPermissions = {};
    resources.forEach((resource) => {
      // For Dashboard, only allow 'read' permission
      if (resource.name === 'Dashboard') {
        const readPermission = permissionsList.find(p => p.name === 'read');
        allPermissions[resource._id] = readPermission ? [readPermission._id] : [];
      } else {
        // For other resources, add all permissions
        allPermissions[resource._id] = permissionsList.map(p => p._id);
      }
    });
    setPermissions(allPermissions);
  };

  // Select NONE - clear all permissions
  const handleSelectNone = () => {
    setPermissions({});
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

  // Calculate total enabled permissions for display
  const totalEnabled = Object.values(permissions).reduce((sum, perms) => sum + perms.length, 0);
  const totalPossible = resources.length * permissionsList.length;

  const columns = [
    {
      title: 'Resource',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (name) => <strong>{name}</strong>,
    },
    ...permissionsList.map((permission) => ({
      title: capitalizeFirstLetter(permission.name),
      dataIndex: '_id',
      key: permission._id,
      align: 'center',
      width: 120,
      render: (resource) => {
        const { name } = resources.find((res) => res._id === resource);
        const isChecked = (permissions[resource] || []).includes(permission._id);
        const isDisabled = name === 'Dashboard' && permission.name !== 'read';
        
        return (
          <Switch
            checked={isChecked}
            onChange={(checked) => handlePermissionChange(resource, permission._id, checked)}
            disabled={isDisabled}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            style={{
              backgroundColor: isChecked ? '#1a5c38' : undefined,
            }}
          />
        );
      },
    })),
  ];

  const dataSource = resources.map((resource) => ({
    ...resource,
    key: resource._id,
  }));

  return (
    <div>
      {/* Header with Select All/None buttons */}
      <div style={{ 
        marginBottom: 16, 
        padding: '16px 20px', 
        background: '#f8faff', 
        borderRadius: 8,
        border: '1px solid #d9e2f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, marginBottom: 8, color: '#1a5c38' }}>
            Resource Permissions
          </h3>
          <Space size="middle">
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
              {totalEnabled} / {totalPossible} Permissions Enabled
            </Tag>
            <span style={{ color: '#666', fontSize: 13 }}>
              Configure access rights for each resource
            </span>
          </Space>
        </div>
        <Space size="middle">
          <Button 
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleSelectAll}
            style={{ 
              backgroundColor: '#1a5c38',
              borderColor: '#1a5c38',
              fontWeight: 500
            }}
          >
            Select ALL
          </Button>
          <Button 
            danger
            icon={<CloseOutlined />}
            onClick={handleSelectNone}
            style={{ fontWeight: 500 }}
          >
            Select NONE
          </Button>
        </Space>
      </div>

      {/* Permissions Table */}
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
        size="middle"
        style={{
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
        }}
      />

      {/* Footer Info */}
      <div style={{ 
        marginTop: 16, 
        padding: 12, 
        background: '#fff9e6',
        borderRadius: 6,
        border: '1px solid #ffe58f',
        fontSize: 13,
        color: '#614700'
      }}>
        <strong>Note:</strong> Dashboard resource is restricted to READ-only permission for security reasons.
      </div>
    </div>
  );
};

export default RolePermissionsTable;
