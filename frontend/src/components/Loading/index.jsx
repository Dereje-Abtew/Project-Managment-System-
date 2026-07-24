import React from 'react';
import logoIcon from '@/style/images/logo.png';
export default function Loading({ isLoading, children }) {
  return (
    <div>
      {isLoading ? (
        <div className="centerAbsolute">
          <div className="relative flex justify-center items-center">
            <div className="absolute animate-spin rounded-full h-14 w-14 border-b-2 border-r-2 border-green-600"></div>
            <img src={logoIcon} className="rounded-full" />
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}
