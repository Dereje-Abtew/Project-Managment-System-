import React, { useEffect } from 'react';
import { Spin } from 'antd';
import logoIcon from '@/style/images/logo.png';

const PageLoader = () => {
  return (
    <div className="centerAbsolute">
      <div className="relative flex justify-center items-center">
        <div className="absolute animate-spin rounded-full h-14 w-14   border-b-2 border-r-2 border-green-600"></div>
        <img src={logoIcon} className="rounded-full  " />
      </div>
    </div>
  );
};
export default PageLoader;
