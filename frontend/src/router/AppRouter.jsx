import PageLoader from '@/components/PageLoader';
import {
  AUTH_LOCAL_STORAGE,
  AUTHORIZED_ROUTES_LOCAL_STORAGE,
  PERMISSION_LOCAL_STORAGE,
  RESOURCE_LOCAL_STORAGE,
  TOKEN_COOKIE_STORAGE,
} from '@/constants/localStorageKeyConstants';
import { selectAuth } from '@/redux/auth/selectors';
import cryptoHelper from '@/utils/crypto';
import CookieManager from '@/utils/helpers/cookieUtils';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import { routesConfig } from './RoutesConfig';

const Logout = lazy(() => import('@/pages/Logout'));
const UnAuthorized = lazy(() => import('@/pages/UnAuthorized'));

function isRouteAuthorized(userRole, routePath, storedAuthorizedRoutes) {
  try {
    if (!storedAuthorizedRoutes) return false;

    // Normalize: handle both JSON string and plain object
    let routes = storedAuthorizedRoutes;
    if (typeof routes === 'string') {
      routes = JSON.parse(routes);
    }
    if (!routes || typeof routes !== 'object') return false;

    // Check specific role first, then fall back to checking all role arrays
    if (userRole && userRole in routes) {
      const allowedRoutes = routes[userRole];
      return Array.isArray(allowedRoutes) && allowedRoutes.includes(routePath);
    }

    // If role not matched by name, check all keys (handles role mismatch edge case)
    for (const key of Object.keys(routes)) {
      const allowedRoutes = routes[key];
      if (Array.isArray(allowedRoutes) && allowedRoutes.includes(routePath)) {
        return true;
      }
    }
  } catch (e) {
    return false;
  }
  return false;
}

function clearAuthAndRedirect() {
  window.localStorage.removeItem(AUTH_LOCAL_STORAGE);
  window.localStorage.removeItem(PERMISSION_LOCAL_STORAGE);
  window.localStorage.removeItem(RESOURCE_LOCAL_STORAGE);
  window.localStorage.removeItem(AUTHORIZED_ROUTES_LOCAL_STORAGE);
  CookieManager.clearCookie(TOKEN_COOKIE_STORAGE);
}

export default function AppRouter() {
  const location = useLocation();
  const currentUser = useSelector(selectAuth);
  const { role } = currentUser.current || {};
  const currentUserRole = role?.name;
  const authorizedRoutesFromStorage = localStorage.getItem(AUTHORIZED_ROUTES_LOCAL_STORAGE);
  const PERMISSIONS = localStorage.getItem(PERMISSION_LOCAL_STORAGE);
  const RESOURCES = localStorage.getItem(RESOURCE_LOCAL_STORAGE);
  const AUTH = localStorage.getItem(AUTH_LOCAL_STORAGE);

  const storedAuthorizedRoutes = authorizedRoutesFromStorage
    ? (() => {
        try {
          const decrypted = cryptoHelper.decrypt(authorizedRoutesFromStorage);
          if (!decrypted) return null;
          return typeof decrypted === 'string' ? JSON.parse(decrypted) : decrypted;
        } catch (e) {
          return null;
        }
      })()
    : null;

  // If required auth data is missing, clear storage and redirect via React Router
  // (use <Redirect> instead of window.location.href to avoid full-page reload loops)
  if (!storedAuthorizedRoutes || !AUTH) {
    clearAuthAndRedirect();
    return <Redirect to="/login" />;
  }

  // Build the list of authorized route elements
  const authorizedRouteElements = routesConfig
    .filter((routeItem) => isRouteAuthorized(currentUserRole, routeItem.path, storedAuthorizedRoutes))
    .map((routeItem) => (
      <PrivateRoute
        key={routeItem.path}
        path={routeItem.path}
        exact={routeItem.exact !== false}
        component={lazy(() => import(`@/pages/${routeItem.component}`))}
      />
    ));

  // Always allow profile and logout for any logged-in user
  const alwaysAllowedRouteElements = routesConfig
    .filter((routeItem) => ['/profile', '/logout'].includes(routeItem.path))
    .filter((routeItem) => !authorizedRouteElements.some((el) => el.key === routeItem.path))
    .map((routeItem) => (
      <PrivateRoute
        key={routeItem.path + '-fallback'}
        path={routeItem.path}
        exact={routeItem.exact !== false}
        component={lazy(() => import(`@/pages/${routeItem.component}`))}
      />
    ));

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence exitBeforeEnter initial={false}>
        <Switch location={location} key={location.pathname}>
          {authorizedRouteElements}
          {alwaysAllowedRouteElements}
          <PublicRoute path="/login" render={() => <Redirect to="/" />} exact />
          <Route component={Logout} path="/logout" exact />
          <Route path="*" component={UnAuthorized} />
        </Switch>
      </AnimatePresence>
    </Suspense>
  );
}
