import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  OFFICIAL_WEBSITE_URL,
  TELEGRAM_URL,
  TWITTER_URL,
  YOUTUBE_URL,
} from '@/constants/socialmediaConstants';
import {
  FacebookOutlined,
  GlobalOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  SendOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from '@ant-design/icons';
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = ({ isLoggedIn }) => {
  const handleLinkClick = (url) => {
    window.open(url, '_blank');
  };

  const socialLinks = [
    { icon: <GlobalOutlined />, url: OFFICIAL_WEBSITE_URL, color: '#2E8B3A', label: 'Website' },
    { icon: <SendOutlined />, url: TELEGRAM_URL, color: '#2CA5E0', label: 'Telegram' },
    { icon: <TwitterOutlined />, url: TWITTER_URL, color: '#1D9BF0', label: 'Twitter' },
    { icon: <YoutubeOutlined />, url: YOUTUBE_URL, color: '#FF0000', label: 'YouTube' },
    { icon: <FacebookOutlined />, url: FACEBOOK_URL, color: '#3B5998', label: 'Facebook' },
    { icon: <InstagramOutlined />, url: INSTAGRAM_URL, color: '#E1306C', label: 'Instagram' },
    { icon: <LinkedinOutlined />, url: LINKEDIN_URL, color: '#0077B5', label: 'LinkedIn' },
  ];

  return (
    <Footer
      style={{
        background: isLoggedIn ? '#fff' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderTop: isLoggedIn ? '1px solid #e8f5e9' : 'none',
        padding: isLoggedIn ? '10px 24px' : '20px 48px',
        position: isLoggedIn ? 'sticky' : 'relative',
        bottom: 0,
        width: '100%',
        zIndex: 100,
        boxShadow: isLoggedIn ? '0 -1px 8px rgba(46,139,58,0.06)' : '0 -4px 20px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isLoggedIn ? 'space-between' : 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {/* Social links */}
        {!isLoggedIn && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {socialLinks.map((s, i) => (
              <span
                key={i}
                onClick={() => handleLinkClick(s.url)}
                title={s.label}
                style={{
                  fontSize: 20,
                  color: s.color,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, opacity 0.2s',
                  opacity: 0.85,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.85'; }}
              >
                {s.icon}
              </span>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: isLoggedIn ? '#6b7280' : 'rgba(255,255,255,0.7)',
            fontSize: 13,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#2E8B3A',
              marginRight: 4,
            }}
          />
          <span>© {new Date().getFullYear()} Global Bank S.C.</span>
          <span style={{ color: isLoggedIn ? '#d1d5db' : 'rgba(255,255,255,0.3)' }}>|</span>
          <span>All Rights Reserved</span>
          <span style={{ color: isLoggedIn ? '#d1d5db' : 'rgba(255,255,255,0.3)' }}>|</span>
          <span>PMS — Developed by Program Management Office</span>
        </div>

        {/* Social links (logged-in minimal row) */}
        {isLoggedIn && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {socialLinks.slice(0, 4).map((s, i) => (
              <span
                key={i}
                onClick={() => handleLinkClick(s.url)}
                title={s.label}
                style={{
                  fontSize: 16,
                  color: s.color,
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {s.icon}
              </span>
            ))}
          </div>
        )}
      </div>
    </Footer>
  );
};

export default AppFooter;
