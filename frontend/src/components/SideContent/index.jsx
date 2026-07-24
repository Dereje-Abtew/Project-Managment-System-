import { Divider, Layout, Space } from 'antd';

import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  OFFICIAL_WEBSITE_URL,
  TELEGRAM_URL,
  TWITTER_URL,
  YOUTUBE_URL,
} from '@/constants/socialmediaConstants';
import logoText from '@/style/images/logo-text.png';
import history from '@/utils/history';
import {
  FacebookOutlined,
  GlobalOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  SendOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from '@ant-design/icons';
import ProjectDescription from '../ProjectInfo';

const { Content } = Layout;

export default function SideContent() {
  const linksContainer = {
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    padding: '10px',
  };
  const handleLinkClick = (url) => {
    window.open(url, '_blank');
  };

  const redirectToHome = () => {
    history.push('/');
  };
  return (
    <Content
      style={{
        padding: '30px 30px 30px',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>
        <img
          onClick={redirectToHome}
          src={logoText}
          alt="Logo"
          style={{ cursor: 'pointer', margin: '0 auto 40px', display: 'block' }}
        />
        <ProjectDescription />

        <Divider dashed />
        <Space style={linksContainer} size={[20, 20]} wrap>
          <GlobalOutlined
            onClick={() => handleLinkClick(OFFICIAL_WEBSITE_URL)}
            className="text-xl cursor-pointer  text-[#007BFF]"
          />
          <SendOutlined
            onClick={() => handleLinkClick(TELEGRAM_URL)}
            className="text-xl cursor-pointer  text-[#2CA5E0]"
          />
          <TwitterOutlined
            onClick={() => handleLinkClick(TWITTER_URL)}
            className="text-xl cursor-pointer  text-[#1D9BF0]"
          />
          <YoutubeOutlined
            onClick={() => handleLinkClick(YOUTUBE_URL)}
            className="text-xl cursor-pointer  text-[#FF0000]"
          />
          <FacebookOutlined
            onClick={() => handleLinkClick(FACEBOOK_URL)}
            className="text-xl cursor-pointer  text-[#3B5998]"
          />
          <InstagramOutlined
            onClick={() => handleLinkClick(INSTAGRAM_URL)}
            className="text-xl cursor-pointer  text-[#E1306C]"
          />
          <LinkedinOutlined
            onClick={() => handleLinkClick(LINKEDIN_URL)}
            className="text-xl cursor-pointer  text-[#0077B5]"
          />
        </Space>
      </div>
    </Content>
  );
}
