import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Menu, Dropdown } from 'antd';
import {
  BellOutlined, LogoutOutlined, SettingOutlined,
  UserOutlined, DownOutlined, MenuOutlined,
} from '@ant-design/icons';
import { selectAuth } from '@/redux/auth/selectors';
import history from '@/utils/history';
import uniqueId from '@/utils/uinqueId';
import capitalizeFirstLetter from '@/utils/stringHelpers';
import { useAppContext } from '@/context/appContext';

const GREEN  = '#064e3b';
const YELLOW = '#F1B31C';

export default function HeaderContent() {
  const authState   = useSelector(selectAuth) || {};
  const currentUser = authState.current || authState;
  const firstName   = currentUser?.firstName  || '';
  const lastName    = currentUser?.lastName   || '';
  const roleName    = currentUser?.role?.name || currentUser?.position || '';
  const initials    = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || '?';

  const { appContextAction } = useAppContext();
  const { navMenu } = appContextAction;

  const dropdown = (
    <div style={{
      minWidth: 230, background: '#fff', borderRadius: 8,
      boxShadow: '0 6px 24px rgba(0,0,0,0.14)',
      overflow: 'hidden', border: '1px solid #f0f0f0',
    }}>
      {/* User card */}
      <div
        onClick={() => history.push('/profile')}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', cursor: 'pointer',
          background: 'linear-gradient(135deg,#fefce8 0%,#fff 100%)',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Avatar size={42} style={{ background: GREEN, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </Avatar>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', lineHeight: 1.3 }}>
            {capitalizeFirstLetter(firstName)} {capitalizeFirstLetter(lastName)}
          </div>
          <div style={{
            marginTop: 3, display: 'inline-block',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
            textTransform: 'uppercase', color: '#fff',
            background: GREEN, borderRadius: 3, padding: '1px 7px',
          }}>
            {roleName}
          </div>
        </div>
      </div>

      <Menu style={{ border: 'none', padding: '4px 0' }}>
        <Menu.Item
          key={uniqueId()}
          icon={<SettingOutlined style={{ color: GREEN }} />}
          onClick={() => history.push('/profile')}
          style={{ fontSize: 14 }}
        >
          My Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key={uniqueId()}
          icon={<LogoutOutlined style={{ color: '#ef4444' }} />}
          onClick={() => history.push('/logout')}
          style={{ fontSize: 14, color: '#ef4444' }}
        >
          Sign Out
        </Menu.Item>
      </Menu>
    </div>
  );

  return (
    <div style={{
      height: 56, background: YELLOW,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', paddingRight: 20,
      boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      position: 'relative', zIndex: 1001,
    }}>
      {/* LEFT: hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => navMenu.collapse()}
          style={{
            width: 56, height: 56, border: 'none', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: GREEN, fontSize: 18, flexShrink: 0,
          }}
        >
          <MenuOutlined />
        </button>
        <span style={{
          fontWeight: 800, fontSize: 15, color: GREEN,
          letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
          Project Management System
        </span>
      </div>

      {/* RIGHT: bell + name/role + avatar + chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <BellOutlined style={{ fontSize: 20, color: GREEN, cursor: 'pointer' }} />

        <div style={{ textAlign: 'right', lineHeight: 1.25, userSelect: 'none' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: GREEN, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            {capitalizeFirstLetter(firstName)} {capitalizeFirstLetter(lastName)}
          </div>
          <div style={{ fontSize: 10, color: GREEN, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.75 }}>
            {roleName}
          </div>
        </div>

        <Dropdown overlay={dropdown} trigger={['click']} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Avatar size={36} style={{
              background: GREEN, color: '#fff', fontWeight: 700, fontSize: 14,
              border: '2px solid rgba(255,255,255,0.55)', flexShrink: 0,
            }}>
              {initials || <UserOutlined />}
            </Avatar>
            <DownOutlined style={{ fontSize: 10, color: GREEN, opacity: 0.8 }} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
