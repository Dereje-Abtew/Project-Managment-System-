import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '@/redux/auth/actions';
import PageLoader from '@/components/PageLoader';
import history from '@/utils/history';

const Logout = () => {
  const dispatch = useDispatch();

  function asyncLogout() {
    return dispatch(logoutAction());
  }

  useEffect(() => {
    async function logout() {
      await asyncLogout();
      history.push('/'); // Redirect to the home page
    }

    logout();
  }, [dispatch, history]);

  return <PageLoader />;
};

export default Logout;
