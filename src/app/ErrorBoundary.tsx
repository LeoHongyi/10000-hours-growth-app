import { Component, ErrorInfo, ReactNode } from 'react'
import { usePreferences } from './preferences'

type ErrorBoundaryState = {
  hasError: boolean
}

type ErrorBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = usePreferences()

  return (
    <ErrorBoundaryBase
      fallback={
        <main className="app-content">
          <section className="page-card content-card">
            <p className="eyebrow">{t('出现问题')}</p>
            <h1>{t('成长记录暂时无法打开')}</h1>
            <p className="muted">{t('请刷新页面重试。如果问题持续，请先导出浏览器数据备份再排查。')}</p>
            <button className="primary-button" type="button" onClick={() => window.location.reload()}>
              <span className="material-symbols-outlined" aria-hidden="true">
                refresh
              </span>
              {t('刷新页面')}
            </button>
          </section>
        </main>
      }
    >
      {children}
    </ErrorBoundaryBase>
  )
}
