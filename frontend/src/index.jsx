import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';
import './style/app.less';
import './style/table-enhanced.css';
import './style/table-override.css';
import * as serviceWorker from './serviceWorker';

import { Router as RouterHistory } from 'react-router-dom';
import { Provider } from 'react-redux';
import history from '@/utils/history';
import store from '@/redux/store';

import { AppContextProvider } from '@/context/appContext';
import './index.css';

// Suppress harmless "state update on an unmounted component" warning from Ant Design
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes("Can't perform a React state update on an unmounted component")) {
    return;
  }
  originalConsoleError(...args);
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace' }}>
          <h2 style={{ color: 'red' }}>Application Error</h2>
          <pre style={{ background: '#f5f5f5', padding: 20, borderRadius: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
            Clear Storage &amp; Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.render(
  <ErrorBoundary>
    <RouterHistory history={history}>
      <Provider store={store}>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </Provider>
    </RouterHistory>
  </ErrorBoundary>,
  document.getElementById('root')
);

// Unregister any cached service workers — prevents stale cache from serving old broken builds
serviceWorker.unregister();
