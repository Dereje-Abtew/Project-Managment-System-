import React, { lazy, Suspense } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PublicRoute from './PublicRoute';
import PageLoader from '@/components/PageLoader';

const Login = lazy(() => import('@/pages/Login'));
const Logout = lazy(() => import('@/pages/Logout'));
const Guest = lazy(() => import('@/pages/Guest'));
const Contact = lazy(() => import('@/pages/Contact'));

const UnAuthorized = lazy(() => import('@/pages/UnAuthorized'));

export default function AuthRouter() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence exitBeforeEnter initial={false}>
        <Switch location={location} key={location.pathname}>
          <PublicRoute path="/" component={Guest} render={() => <Redirect to="/guest" />} exact />
          <PublicRoute
            path="/contact"
            component={Contact}
            render={() => <Redirect to="/contact" />}
            exact
          />
          <PublicRoute component={Login} path="/login" exact />
          <PublicRoute component={Logout} path="/logout" exact />
          <Route path="*" component={UnAuthorized} render={() => <Redirect to="/unauthorized" />} />
        </Switch>
      </AnimatePresence>
    </Suspense>
  );
}
