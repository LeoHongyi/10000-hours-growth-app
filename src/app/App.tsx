import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GoalDetailPage } from '../features/goals/GoalDetailPage'
import { GoalsPage } from '../features/goals/GoalsPage'
import { HomePage } from '../features/home/HomePage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { RecordsPage } from '../features/records/RecordsPage'
import { AppProvider, AppProviderStub, type AppContextValue, useAppContext } from './AppProvider'
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
          <Route
            index
            element={
              <HomePage
                weeklyMinutes={app.weeklyMinutes}
                suggestions={app.todaySuggestions}
                goalPreview={app.goals.slice(0, 2)}
                onStartSuggestion={(plan) =>
                  app.startActiveTimer({
                    memberId: plan.memberId,
                    goalId: plan.goalId,
                    taskId: plan.taskId,
                  })
                }
              />
            }
          />
          <Route
            path="/goals"
            element={
              <GoalsPage
                members={app.members}
                goals={app.goals}
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
const stubAppContext: AppContextValue = {
  members: [],
  goals: [],
  tasks: [],
  records: [],
  plans: [],
  milestones: [],
  diary: [],
  hydrated: true,
  ready: false,
  activeTimer: null,
  activeTimerGoalTitle: '进行中的专注',
  initializeHousehold: noopAsync,
  refresh: noopAsync,
  createGoal: noopAsync,
  toggleGoal: noopAsync,
  addManualRecord: noopAsync,
  startActiveTimer: () => {},
  pauseActiveTimer: () => {},
  resumeActiveTimer: () => {},
  finishActiveTimer: noopAsync,
  todaySuggestions: [],
  weeklyMinutes: 0,
}

function AppInner({ ready, onInitialize }: AppProps) {
  const app = useAppContext()
  const resolvedReady = ready ?? app.ready
  const resolvedInitialize = onInitialize ?? app.initializeHousehold
  const hydrated = app.hydrated

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
    return (
      <AppProviderStub value={stubAppContext}>
        <AppInner {...props} />
      </AppProviderStub>
    )
  }

  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
