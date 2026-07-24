import { Drawer, Layout, Menu } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAppContext } from '@/context/appContext';
import logoText from '@/style/images/logo-text.png';
import logoIcon from '@/style/images/logo.png';
import history from '@/utils/history';

import { RESOURCE_LOCAL_STORAGE, AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';
import cryptoHelper from '@/utils/crypto';
import { getIconComponent } from '@/utils/iconUtils';
import { SettingOutlined, ApartmentOutlined, FileTextOutlined } from '@ant-design/icons';

const { Sider } = Layout;
const { SubMenu } = Menu;

const SIDEBAR_BG   = '#1a3a2a';   // dark green body
const SIDEBAR_LOGO = '#ffffff';   // white logo area — matches image exactly

export default function Navigation() {
  return (
    <>
      <div className="sidebar-wraper">
        <Sidebar />
      </div>
      <MobileSidebar />
    </>
  );
}

function Sidebar({ forceExpanded = false }) {
  const location = useLocation();
  const { state: stateApp } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const collapsed = forceExpanded ? false : isNavMenuClose;
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  useEffect(() => {
    if (currentPath !== location.pathname) setCurrentPath(location.pathname);
    if (!selectedKey.startsWith(location.pathname)) {
      setSelectedKey(location.pathname);
    }
  }, [location]);

  // ── Read resources from encrypted localStorage ──────────────────────────
  const resourceRaw = window.localStorage.getItem(RESOURCE_LOCAL_STORAGE);
  let resourceResult = null;
  if (resourceRaw) {
    resourceResult = cryptoHelper.decrypt(resourceRaw);
    if (!resourceResult) {
      try { resourceResult = JSON.parse(resourceRaw); } catch (_) {}
    }
  }

  // ── Read currentUser from AUTH_LOCAL_STORAGE (has full role.resources) ──
  // Redux auth uses autopopulate which strips role.resources — use localStorage instead
  const authRaw = window.localStorage.getItem(AUTH_LOCAL_STORAGE);
  let authUser = null;
  if (authRaw) {
    authUser = cryptoHelper.decrypt(authRaw);
    if (!authUser) {
      try { authUser = JSON.parse(authRaw); } catch (_) {}
    }
  }
  const currentUserResources = Array.isArray(authUser?.role?.resources)
    ? authUser.role.resources : [];

  const normalizeResourceName = (name) => {
    if (name === 'User') return 'Team Member';
    if (name === 'Users') return 'Team Members';
    return name;
  };

  const MY_SIDEBAR_MENU    = [];
  const MY_SETTINGS_SUBMENU  = [];
  const MY_STRUCTURE_SUBMENU = [];
  let dashboardResource = null;

      if (resourceResult && currentUserResources.length > 0) {
    for (const resourceItem of currentUserResources) {
      // resource field may be a plain ObjectId string or a populated object
      const resourceId = resourceItem.resource?._id
        ? String(resourceItem.resource._id)
        : String(resourceItem.resource);

      const rd = resourceResult.find((r) => String(r._id) === resourceId);
      if (!rd) continue;
      if (rd.isSubMenu) {
        if (rd.parentMenu === 'Settings')  MY_SETTINGS_SUBMENU.push({ url: rd.url, name: normalizeResourceName(rd.name) });
        if (rd.parentMenu === 'Structure') MY_STRUCTURE_SUBMENU.push({ url: rd.url, name: normalizeResourceName(rd.name) });
      } else {
        // Hide the generic 'Report' parent menu; keep its child entries like 'General Report'
        if (rd.name === 'Dashboard') dashboardResource = { url: rd.url, name: normalizeResourceName(rd.name) };
        else if (rd.name === 'Report') {
          // skip adding the top-level 'Report' menu
        } else MY_SIDEBAR_MENU.push({ url: rd.url, name: normalizeResourceName(rd.name) });
      }
    }
  }
  if (dashboardResource) MY_SIDEBAR_MENU.unshift(dashboardResource);
  if (MY_SIDEBAR_MENU.length === 0) {
    MY_SIDEBAR_MENU.push({ url: '/', name: 'Dashboard' });
    if (!resourceResult) MY_SIDEBAR_MENU.push({ url: '/profile', name: 'Profile' });
  }

  const hasTaskShortcutAccess = !resourceResult || (Array.isArray(resourceResult) && resourceResult.some((resource) => ['Project', 'Projects'].includes(resource.name)));
  if (hasTaskShortcutAccess) {
    const projectIndex = MY_SIDEBAR_MENU.findIndex((item) => item.name === 'Project');
    const dashboardIndex = MY_SIDEBAR_MENU.findIndex((item) => item.name === 'Dashboard');
    const taskShortcut = { url: '/project', key: '/project-task', name: 'Task' };
    if (projectIndex >= 0) {
      MY_SIDEBAR_MENU.splice(projectIndex + 1, 0, taskShortcut);
    } else if (dashboardIndex >= 0) {
      MY_SIDEBAR_MENU.splice(dashboardIndex + 1, 0, taskShortcut);
    } else {
      MY_SIDEBAR_MENU.unshift(taskShortcut);
    }
  }

  // ── Sidebar widths ───────────────────────────────────────────────────────
  const EXPANDED_W  = 200;
  const COLLAPSED_W = 56;   // icon-only width — same as header hamburger button

  return (
    <Sider
      collapsed={collapsed}
      width={EXPANDED_W}
      collapsedWidth={COLLAPSED_W}
      trigger={null}
      className="navigation"
      style={{ background: SIDEBAR_BG, minHeight: '100%' }}
    >
      {/* ── WHITE LOGO AREA (top of sidebar) ─────────────────────────────
          Collapsed : logo icon centred on white 56×56
          Expanded  : logo icon + logo text (no hamburger here — toggle is in header)
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 56,
          background: SIDEBAR_LOGO,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: collapsed ? 0 : '0 14px',
          overflow: 'hidden',
          flexShrink: 0,
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        {/* Logo — click goes to dashboard */}
        <div
          onClick={() => history.push('/')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {collapsed ? (
            /* Collapsed: show only the icon */
            <img
              src={logoIcon}
              alt="logo"
              style={{ height: 34, width: 34, borderRadius: '50%' }}
            />
          ) : (
            /* Expanded: show only the text logo — no icon */
            <img
              src={logoText}
              alt="logo text"
              style={{ height: 28, maxWidth: 160, objectFit: 'contain' }}
            />
          )}
        </div>
      </div>

      {/* ── DARK GREEN MENU ─────────────────────────────────────────────── */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => setSelectedKey(key)}
        theme="dark"
        style={{ background: SIDEBAR_BG, border: 'none', paddingTop: 6 }}
      >
        {MY_SIDEBAR_MENU.map((item) => (
          <Menu.Item key={item.key || item.url} icon={getIconComponent(item.name)}>
            <Link to={item.url}>{item.name}</Link>
          </Menu.Item>
        ))}

        {MY_STRUCTURE_SUBMENU.length > 0 && (
          <SubMenu key="Structure" icon={<ApartmentOutlined />} title="Org Structures">
            {MY_STRUCTURE_SUBMENU.map((item) => (
              <Menu.Item key={item.url} icon={getIconComponent(item.name)}>
                <Link to={item.url}>{item.name}</Link>
              </Menu.Item>
            ))}
          </SubMenu>
        )}

        {MY_SETTINGS_SUBMENU.length > 0 && (
          <SubMenu key="Settings" icon={<SettingOutlined />} title="Settings">
            {MY_SETTINGS_SUBMENU.map((item) => (
              <Menu.Item key={item.url} icon={getIconComponent(item.name)}>
                <Link to={item.url}>{item.name}</Link>
              </Menu.Item>
            ))}
          </SubMenu>
        )}
      </Menu>
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <button
        className="mobile-sidebar-btn"
        onClick={() => setVisible(true)}
        style={{
          display: 'none',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 20,
          color: '#fff',
          padding: '0 16px',
        }}
      >
        ☰
      </button>
      <Drawer
        width={220}
        placement="left"
        closable={false}
        onClose={() => setVisible(false)}
        visible={visible}
        className="mobile-sidebar-wraper"
        bodyStyle={{ padding: 0, background: SIDEBAR_BG }}
      >
        <Sidebar forceExpanded />
      </Drawer>
    </>
  );
}
