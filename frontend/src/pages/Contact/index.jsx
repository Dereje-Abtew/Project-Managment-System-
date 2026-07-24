import AppFooter from '@/pages/Footer';
import AppHeader from '@/pages/Header';
import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, GlobalOutlined } from '@ant-design/icons';

import ProjectDescription from '@/components/ProjectInfo';

const { Title, Text } = Typography;
const ContactPage = () => {
  document.title = 'Contact - PMS';

  const currentPage = 'contact';
  return (
    <div>
      <AppHeader currentPage={currentPage} />

      <Row style={{ paddingTop: '100px' }}>
        <Col span={12} className="p-10">
          <ProjectDescription />
        </Col>
        <Col span={12}>
          <div className="flex justify-center">
            <Card
              className="max-w-md w-full bg-white rounded-lg shadow-lg p-6"
              title={
                <Title level={3} className="text-center text-purple-800">
                  Contact Us
                </Title>
              }
            >
              <div className="mb-6">
                <Title level={5} className="mb-2 ">
                  <EnvironmentOutlined className="mr-2" />
                  Address
                </Title>
                <Text className="text-gray-600">
                  National Tower, Ras Abebe Damtew St, <br /> Addis Ababa, Ethipia
                </Text>
              </div>
              <div className="mb-6">
                <Title level={5} className="mb-2 ">
                  <PhoneOutlined className="mr-2" />
                  Phone
                </Title>
                <Text className="text-gray-600"> 8118</Text>
              </div>
              <div>
                <Title level={5} className="mb-2 ">
                  <GlobalOutlined className="mr-2" />
                  Website
                </Title>
                <Text className="text-gray-600">https://www.globalbankethiopia.com/</Text>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <AppFooter isLoggedIn={false} />
    </div>
  );
};

export default ContactPage;
