import Router from '@/router';
import { Layout, ConfigProvider } from 'antd';
import Navigation from './Navigation';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import HeaderContent from '@/app/HeaderContent';
import AppFooter from '@/pages/Footer';

function App() {
  const auth = useSelector(selectAuth) || {};
  const { isLoggedIn = false } = auth;

  if (!isLoggedIn) return <Router />;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#064e3b',
          borderRadius: 2,
          colorBgContainer: '#f6f7f9',
          fontSize: 15,
        },
      }}
    >
      {/*
        ┌──────────┬─────────────────────────────────────────┐
        │          │  GOLDEN HEADER (fixed, no scroll)        │
        │ SIDEBAR  ├─────────────────────────────────────────┤
        │ (fixed,  │  SCROLLABLE CONTENT                      │
        │ no       │                                          │
        │ scroll)  ├─────────────────────────────────────────┤
        │          │  FOOTER                                  │
        └──────────┴─────────────────────────────────────────┘

        Key rules:
        • The entire viewport = 100vh, overflow hidden at root
        • Sidebar: fixed height 100vh, its own overflow-y (menu scrolls if needed)
        • Right column: flex column, height 100vh
        • Header: fixed height, never scrolls
        • Content: flex: 1, overflow-y: auto  ← ONLY THIS SCROLLS
      */}
      <Layout
        style={{
          height: '100vh',          // exact viewport height — no overflow at root
          overflow: 'hidden',       // prevent the whole page from scrolling
          flexDirection: 'row',
        }}
      >
        {/* ── Sidebar — fixed left, full viewport height ── */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            flexShrink: 0,
            zIndex: 200,
          }}
        >
          <Navigation />
        </div>

        {/* ── Right column: header (fixed) + scrollable content + footer ── */}
        <Layout
          style={{
            flex: 1,
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',     // clip here so only .content scrolls
            minWidth: 0,
          }}
        >
          {/* Golden header — never scrolls */}
          <Layout.Header
            style={{
              padding: 0,
              height: 56,
              minHeight: 56,
              maxHeight: 56,
              lineHeight: '56px',
              flexShrink: 0,        // do not shrink when content grows
              background: '#D4A917',
              zIndex: 100,
            }}
          >
            <HeaderContent />
          </Layout.Header>

          {/* Scrollable content area — ONLY this element scrolls */}
          <Layout.Content
            style={{
              flex: 1,
              overflowY: 'auto',    // vertical scroll lives here only
              overflowX: 'hidden',
              padding: '28px 24px',
              background: '#f6f7f9',
            }}
          >
            <Router isLoggedIn={true} />
          </Layout.Content>

          {/* Footer — sits below content, never scrolls away */}
          <AppFooter isLoggedIn={true} />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
