import { selectAuth } from '@/redux/auth/selectors';
import history from '@/utils/history';
import { useSelector } from 'react-redux';
import {
  PERMISSION_LOCAL_STORAGE,
  RESOURCE_LOCAL_STORAGE,
} from '@/constants/localStorageKeyConstants';
import cryptoHelper from './crypto';

function parseStoredData(value) {
  if (!value) return null;
  try {
    const decrypted = cryptoHelper.decrypt(value);
    if (decrypted && typeof decrypted === 'object') return decrypted;
    if (typeof decrypted === 'string') return JSON.parse(decrypted);
  } catch (e) {
    // ignore and try raw parse
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

export function GetPermissions(entity) {
  const resourceResult = parseStoredData(window.localStorage.getItem(RESOURCE_LOCAL_STORAGE));
  const permissionResult = parseStoredData(window.localStorage.getItem(PERMISSION_LOCAL_STORAGE));

  const authState = useSelector(selectAuth);
  const currentUser = authState?.current || authState;
  const MY_PERMISSIONS = [];

  if (!resourceResult || !permissionResult) {
    history.push('/logout');
    return MY_PERMISSIONS;
  }

  if (currentUser?.role && permissionResult && resourceResult) {
    const { role } = currentUser;
    const { resources } = role;

    if (Array.isArray(resources)) {
      for (const resourceItem of resources) {
        const res = resourceResult.find((resource) => resource._id === resourceItem.resource);
        if (res?.name?.toLowerCase().replace(/\\s+/g, '') === entity.toLowerCase().replace(/\\s+/g, '')) {
          const { permissions } = resourceItem;

          if (Array.isArray(permissions)) {
            for (const permissionItem of permissions) {
              const permissionDetails = permissionResult.find((per) => per._id === permissionItem);
              if (permissionDetails) {
                MY_PERMISSIONS.push(permissionDetails.name);
              }
            }
          }
        }
      }
    }
  }

  return MY_PERMISSIONS;
}
