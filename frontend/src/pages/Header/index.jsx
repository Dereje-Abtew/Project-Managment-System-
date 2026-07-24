import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { HomeOutlined, LoginOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { HOME_PATH, LOGIN_PATH, CONTACT_PATH } from '@/constants/routesConstants';
import history from '@/utils/history';
import logoText from '@/style/images/logo-text.png';

const { Header } = Layout;

const AppHeader = ({ currentPage }) => {
  const redirectToLogin = () => {
    history.push(LOGIN_PATH);
  };

  const redirectToHome = () => {
    history.push(HOME_PATH);
  };

  return (
    <Header
      style={{
        background: 'linear-gradient(135deg, #1a2e1a 0%, #2E8B3A 100%)',
        padding: '0 48px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 16px rgba(46,139,58,0.25)',
      }}
    >
      {/* Logo */}
      <div
        onClick={redirectToHome}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <img
          src={logoText}
          alt="Global Bank Logo"
          style={{ height: 38, filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Nav links */}
      <Menu
        mode="horizontal"
        defaultSelectedKeys={[currentPage]}
        style={{
          background: 'transparent',
          border: 'none',
          flex: 1,
          justifyContent: 'center',
          lineHeight: '64px',
        }}
        theme="dark"
      >
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to={HOME_PATH} style={{ color: 'rgba(255,255,255,0.9)' }}>
            Home
          </Link>
        </Menu.Item>
        <Menu.Item key="contact" icon={<PhoneOutlined />}>
          <Link to={CONTACT_PATH} style={{ color: 'rgba(255,255,255,0.9)' }}>
            Contact
          </Link>
        </Menu.Item>
      </Menu>

      {/* Login button */}
      <Button
        icon={<LoginOutlined />}
        onClick={redirectToLogin}
        size="large"
        style={{
          background: '#D4A917',
          borderColor: '#D4A917',
          color: '#fff',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(212,169,23,0.4)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b8910f';
          e.currentTarget.style.borderColor = '#b8910f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#D4A917';
          e.currentTarget.style.borderColor = '#D4A917';
        }}
      >
        Login
      </Button>
    </Header>
  );
};

export default AppHeader;
