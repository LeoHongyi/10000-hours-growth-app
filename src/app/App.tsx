import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DiaryPage } from '../features/diary/DiaryPage'
import { GoalDetailPage } from '../features/goals/GoalDetailPage'
import { GoalsPage } from '../features/goals/GoalsPage'
import { HomePage } from '../features/home/HomePage'
import { MilestoneModal } from '../features/milestones/MilestoneModal'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { PlansPage } from '../features/plans/PlansPage'
import { RecordsPage } from '../features/records/RecordsPage'
import { AppProvider, AppProviderStub, type AppContextValue, useAppContext } from './AppProvider'
import { AppShell } from './AppShell'

type AppProps = {
  ready?: boolean
  onInitialize?: (names: string[]) => Promise<void> | void
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
          <Route
            path="/plans"
            element={
              <PlansPage
                todayPlans={app.todaySuggestions}
                weeklyPlans={app.weeklyFramework}
                monthlyMinutes={app.monthlyMinutes}
                onChangeStatus={app.changePlanStatus}
                onReplacePlan={app.replacePlan}
              />
            }
          />
          <Route path="/diary" element={<DiaryPage entries={app.diary} onCreateEntry={app.createDiaryEntry} />} />
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
  ensureTodaySuggestions: noopAsync,
  todaySuggestions: [],
  weeklyFramework: [],
  changePlanStatus: noopAsync,
  replacePlan: noopAsync,
  weeklyMinutes: 0,
  monthlyMinutes: 0,
  activeMilestone: null,
  closeMilestone: () => {},
  createDiaryEntry: noopAsync,
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

  return (
    <>
      <AppRoutes />
      <MilestoneModal milestone={app.activeMilestone} onClose={app.closeMilestone} />
    </>
  )
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
