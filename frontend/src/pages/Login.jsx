import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Form, Typography, Button, Layout, Space, Divider } from 'antd';

import { login } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import LoginForm from '@/forms/LoginForm';
import AuthLayout from '@/layout/AuthLayout';
import SideContent from '@/components/SideContent';

import { LoginOutlined } from '@ant-design/icons';
import { COMPANY_BLUE_COLOR } from '@/constants/companyConstants';
const { Content } = Layout;
const { Title } = Typography;

const LoginPage = () => {
  document.title = 'Login - PMS';

  const { loading: isLoading } = useSelector(selectAuth);

  const dispatch = useDispatch();
  const onFinish = (values) => {
    dispatch(login({ loginData: values }));
  };
  const linksContainer = {
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
  };

  return (
    <>
      <AuthLayout sideContent={<SideContent />}>
        <Content
          style={{
            padding: '60px 30px',
            maxWidth: '500px',
            margin: '0 auto',
            marginTop: '20%',
          }}
        >
          <Title style={{ textAlign: 'center', color: COMPANY_BLUE_COLOR }} level={3}>
            Global Bank S.C. - Shared Success!
          </Title>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900 mb-4 animate-typewriter">Welcome back!</h1>
              <h2 className="text-gray-600 text-lg mt-4  ">Log in to your account</h2>
            </div>
          </div>

          <Divider dashed />
          <div className="site-layout-content">
            <Form
              name="normal_login"
              className="login-form"
              initialValues={{
                remember: true,
                fullload: true,
              }}
              onFinish={onFinish}
            >
              <LoginForm />
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={isLoading}
                  size="large"
                  icon={<LoginOutlined />}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>

            <Space style={linksContainer} wrap>
              <div className="border-l border-gray-400 pl-4 mb-4 md:mt-0 flex items-center">
                <span className="text-sm text-gray-600 mr-2">
                  © {new Date().getFullYear()} Global Bank S.C. | © All Rights Reserved.
                </span>
                <span className="text-sm text-gray-600">PMS - Developed by PMO</span>
              </div>
            </Space>
          </div>
        </Content>
      </AuthLayout>
    </>
  );
};

export default LoginPage;
