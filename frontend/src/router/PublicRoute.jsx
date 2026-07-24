import React from 'react';
import { motion } from 'framer-motion';
import { Route, Redirect } from 'react-router-dom';
import { AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';
import cryptoHelper from '@/utils/crypto';

const PublicRoute = ({ component: Component, ...rest }) => {
  const auth = cryptoHelper.decrypt(window.localStorage.getItem(AUTH_LOCAL_STORAGE));
  const isLoggedIn = auth ? auth.isLoggedIn : false;
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? (
          <Redirect to="/" />
        ) : (
          <motion.div initial={{ x: 200 }} animate={{ x: 0 }} exit={{ scale: 0 }}>
            <Component {...props} />
          </motion.div>
        )
      }
    />
  );
};

export default PublicRoute;
