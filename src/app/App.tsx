import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GoalDetailPage } from '../features/goals/GoalDetailPage'
import { GoalsPage } from '../features/goals/GoalsPage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { RecordsPage } from '../features/records/RecordsPage'
import { AppProvider, useAppContext } from './AppProvider'
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
  const app = useAppContext()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<PlaceholderPage title="首页" />} />
          <Route
            path="/goals"
            element={
              <GoalsPage
                members={app.members}
                goals={app.goals}
                tasks={app.tasks}
                records={app.records}
                onCreateGoal={app.createGoal}
                onToggleGoal={app.toggleGoal}
                onStartTimer={app.startActiveTimer}
              />
            }
          />
          <Route path="/goals/:goalId" element={<GoalDetailPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/plans" element={<PlaceholderPage title="计划" />} />
          <Route path="/diary" element={<PlaceholderPage title="家庭日记" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

const noopAsync = async () => {}

function AppInner({ ready, onInitialize }: AppProps) {
  const app = useAppContext()
  const resolvedReady = ready ?? app.ready
  const resolvedInitialize = onInitialize ?? app.initializeHousehold

  if (!resolvedReady) {
    return <OnboardingPage onSubmit={resolvedInitialize} />
  }

  return <AppRoutes />
}

function AppWithoutProvider({ ready = false, onInitialize = noopAsync }: AppProps) {
  if (!ready) {
    return <OnboardingPage onSubmit={onInitialize} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<PlaceholderPage title="首页" />} />
          <Route path="/goals" element={<PlaceholderPage title="目标" />} />
          <Route path="/records" element={<PlaceholderPage title="记录" />} />
          <Route path="/plans" element={<PlaceholderPage title="计划" />} />
          <Route path="/diary" element={<PlaceholderPage title="家庭日记" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export function App(props: AppProps) {
  if (props.ready !== undefined || props.onInitialize !== undefined) {
    return <AppWithoutProvider {...props} />
  }

  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
