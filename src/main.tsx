import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { ErrorBoundary } from './app/ErrorBoundary'
import { PreferencesProvider } from './app/preferences'
import { registerServiceWorker } from './app/registerServiceWorker'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PreferencesProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </PreferencesProvider>
  </React.StrictMode>,
)

registerServiceWorker()
