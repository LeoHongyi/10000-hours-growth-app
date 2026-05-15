import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { RecordsPage } from '../features/records/RecordsPage'
import { AppProvider, useOptionalAppContext } from './AppProvider'
import { AppShell } from './AppShell'

type AppProps = {
  ready?: boolean
  onInitialize?: (names: string[]) => Promise<void> | void
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page-card">
      <h1>{title}</h1>
      <p>页面骨架已就位。</p>
    </section>
  )
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<PlaceholderPage title="首页" />} />
          <Route path="/goals" element={<PlaceholderPage title="目标" />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/plans" element={<PlaceholderPage title="计划" />} />
          <Route path="/diary" element={<PlaceholderPage title="家庭日记" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

const noopInitialize = async () => {}

function AppInner({ ready, onInitialize }: AppProps) {
  const app = useOptionalAppContext()
  const resolvedReady = ready ?? app?.ready ?? false
  const resolvedInitialize = onInitialize ?? app?.initializeHousehold ?? noopInitialize
  const hydrated = app?.hydrated ?? true

  if (!hydrated) {
    return (
      <section className="page-card">
        <p>正在准备成长记录…</p>
      </section>
    )
  }

  if (!resolvedReady) {
    return <OnboardingPage onSubmit={resolvedInitialize} />
  }

  return <AppRoutes />
}

export function App(props: AppProps) {
  if (props.ready !== undefined || props.onInitialize !== undefined) {
    return <AppInner {...props} />
  }

  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
