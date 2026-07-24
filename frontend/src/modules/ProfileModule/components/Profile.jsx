import React, { useEffect } from 'react';

import { useProfileContext } from '@/context/profileContext';
import UserInfo from './UserInfo';
import UpdateUser from './UpdateUser';
import PasswordModal from './PasswordModal';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { crud } from '@/redux/crud/actions';

const Visibility = ({ isVisible, children }) => {
  const show = isVisible ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };
  return <div style={show}>{children}</div>;
};

export default function Profile({ config }) {
  const { state } = useProfileContext();
  const { update, read, passwordModal } = state;
  const authState = useSelector(selectAuth) || {};
  const currentUser = authState.current || authState;
  const id = currentUser?.id || currentUser?._id;

  const entity = 'user';
  const dispatch = useDispatch();

  useEffect(() => {
    if (id) {
      dispatch(crud.read({ entity, id }));
    }
  }, [dispatch, entity, id]);

  config = { ...config, id };

  return (
    <>
      <Visibility isVisible={read.isOpen}>
        <UserInfo config={config} />
      </Visibility>
      <Visibility isVisible={update.isOpen}>
        <UpdateUser config={config} />
      </Visibility>
      <PasswordModal config={config} isVisible={passwordModal.isOpen} />
    </>
  );
}
