import {
  AUTHORIZED_ROUTES_LOCAL_STORAGE,
  PERMISSION_LOCAL_STORAGE,
  RESOURCE_LOCAL_STORAGE,
} from '@/constants/localStorageKeyConstants';
import { request } from '@/request';

import cryptoHelper from '@/utils/crypto';

export async function AuthorizedRoutes(fullload, currentUser) {
  const authorizedRoutesFromStorage = localStorage.getItem(AUTHORIZED_ROUTES_LOCAL_STORAGE);
  const storedAuthorizedRoutes = authorizedRoutesFromStorage
    ? cryptoHelper.decrypt(authorizedRoutesFromStorage)
    : null;
  const setAuthorizedRoutes = (routes) => {
    localStorage.setItem(
      AUTHORIZED_ROUTES_LOCAL_STORAGE,
      cryptoHelper.encrypt(routes)  // encrypt() already calls JSON.stringify internally
    );
  };

  const setResources = async () => {
    const { result: resourceResult } = await request.get({ entity: 'resources' });
    window.localStorage.setItem(RESOURCE_LOCAL_STORAGE, cryptoHelper.encrypt(resourceResult));
  };
  const getResources = async () => {
    if (fullload) {
      await setResources();
    }
    let resourceData = cryptoHelper.decrypt(window.localStorage.getItem(RESOURCE_LOCAL_STORAGE));
    if (!resourceData) {
      await setResources();
      resourceData = cryptoHelper.decrypt(window.localStorage.getItem(RESOURCE_LOCAL_STORAGE));
    }
    return resourceData;
  };

  const setPermissions = async () => {
    const { result: permissionResult } = await request.get({ entity: 'permissions' });
    window.localStorage.setItem(PERMISSION_LOCAL_STORAGE, cryptoHelper.encrypt(permissionResult));
  };

  const getPermissions = async () => {
    if (fullload) {
      await setPermissions();
    }

    let permissionData = cryptoHelper.decrypt(
      window.localStorage.getItem(PERMISSION_LOCAL_STORAGE)
    );
    if (!permissionData) {
      await setPermissions();
      permissionData = cryptoHelper.decrypt(window.localStorage.getItem(PERMISSION_LOCAL_STORAGE));
    }
    return permissionData;
  };

  const fetchRoutes = async () => {
    if (currentUser?.role) {
      const { role } = currentUser;
      const { result: roleResult } = await request.read({ entity: 'role', id: role._id });

      const resourceData = await getResources();

      // console.log('resourceData: ', resourceData);

      const permissionData = await getPermissions();
      // console.log('permissionData: ', permissionData);
      const authorizedRouteUrls = roleResult.resources
        .filter((resourceItem) =>
          resourceData.some((resource) => resource._id === resourceItem.resource)
        )
        .map((resourceItem) => {
          const matchingResource = resourceData.find(
            (resource) => resource._id === resourceItem.resource
          );
          // Use the resource's stored URL as the canonical base path so that
          // camelCase routes like /generalReport are matched exactly.
          // Fall back to deriving from name for legacy resources.
          const resourceUrl = matchingResource?.url || null;
          const resourceName = (matchingResource?.name || '').toLowerCase().replace(/\s+/g, '');
          // basePath: prefer the actual stored url, strip leading slash for concat
          const basePath = resourceUrl
            ? resourceUrl.replace(/^\//, '')
            : resourceName;

          const { permissions } = resourceItem;
          let hasReadPermission = false;
          const permissionNames = permissions.map((permissionItem) => {
            const permissionDetails = permissionData.find((per) => per._id === permissionItem);
            if (resourceName !== 'dashboard') {
              if (
                permissionDetails.name === 'update' ||
                permissionDetails.name === 'read' ||
                permissionDetails.name === 'report'
              ) {
                if (permissionDetails.name === 'read') {
                  hasReadPermission = true;
                }
                return `/${basePath}/${permissionDetails.name}/:id`;
              } else {
                return permissionDetails ? `/${basePath}/${permissionDetails.name}` : null;
              }
            }
            return null;
          });
          if (resourceName === 'dashboard') {
            permissionNames.push(`/`);
          } else {
            if (hasReadPermission) {
              permissionNames.push(`/${basePath}/:id`);
            }
            const hasAnyPermission = permissions.length > 0;
            if (hasAnyPermission) {
              permissionNames.push(`/${basePath}`);
            }
            if (resourceName === 'sendrequirement' || resourceName === 'send requirement') {
              permissionNames.push('/send-requirement');
            }
            if (resourceName === 'approverequirement' || resourceName === 'approve requirement') {
              permissionNames.push('/approve-requirement');
            }
          }
          permissionNames.push(`/profile`);
          permissionNames.push(`/logout`);

          return permissionNames.filter((item) => item !== null);
        });

      if (authorizedRouteUrls.length > 0) {
        const allRoutes = authorizedRouteUrls.flat();
        // Always ensure profile and logout are accessible regardless of role config
        if (!allRoutes.includes('/profile')) allRoutes.push('/profile');
        if (!allRoutes.includes('/logout')) allRoutes.push('/logout');
        const routes = { [roleResult.name]: allRoutes };
        setAuthorizedRoutes(routes);
      } else {
        // Role has no resources configured — still allow profile and logout
        const routes = { [roleResult.name]: ['/profile', '/logout'] };
        setAuthorizedRoutes(routes);
      }
    }
  };

  if (fullload) {
    await fetchRoutes();
  } else if (!fullload && !storedAuthorizedRoutes) {
    await fetchRoutes();
  }

  if (storedAuthorizedRoutes) {
    return storedAuthorizedRoutes;
  }

  return { profile: ['/profile'] };
}
