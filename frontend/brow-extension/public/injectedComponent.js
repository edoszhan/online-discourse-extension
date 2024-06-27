import React from 'react';
import { createRoot } from 'react-dom/client';
import InjectedComponent from '../src/components/InjectedComponent';

function init() {
  const reactRoot = document.getElementById('react-root');

  if (reactRoot) {
    const root = createRoot(reactRoot);
    root.render(<InjectedComponent />);
  } else {
    console.error('React root element not found');
  }
}

export default init;