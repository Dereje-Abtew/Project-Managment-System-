import { HomeOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import { useEffect } from 'react';
const UnAuthorized = () => {
  document.title = 'UnAuthorized';
  useEffect(() => {}, []);
  return (
    <>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button href="/" type="primary" icon={<HomeOutlined />}>
            Back to Home
          </Button>
        }
      />
    </>
  );
};
export default UnAuthorized;
