import React from 'react';
import { motion } from 'framer-motion';
import { Route, Redirect } from 'react-router-dom';
import { AUTH_LOCAL_STORAGE } from '@/constants/localStorageKeyConstants';
import cryptoHelper from '@/utils/crypto';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const config = {
    type: 'spring',
    damping: 20,
    stiffness: 100,
  };
  const auth = cryptoHelper.decrypt(window.localStorage.getItem(AUTH_LOCAL_STORAGE));
  const isLoggedIn = auth ? auth.isLoggedIn : false;
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? (
          <motion.div
            transition={config}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <Component {...props} />
          </motion.div>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
