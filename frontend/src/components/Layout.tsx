import React from 'react';
import { useLocation } from 'react-router-dom';
import AppBar from './AppBar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showAppBar = location.pathname !== '/demo';

  return (
    <>
      {showAppBar && <AppBar />}
      {children}
    </>
  );
};

export default Layout; 