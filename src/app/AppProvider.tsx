import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import type { ActiveTimer, AppSnapshot } from '../domain/types'
import {
  finishTimer,
  loadActiveTimer,
  pauseTimer,
  resumeTimer,
  saveActiveTimer,
  startTimer,
} from '../features/timer/timerStorage'
import { createAppRepository } from '../storage/repository'

const repository = createAppRepository()
const emptySnapshot: AppSnapshot = {
  members: [],
  goals: [],
  tasks: [],
  records: [],
  plans: [],
  milestones: [],
  diary: [],
}

type ManualRecordInput = {
  memberId: string
  goalId: string
  taskId?: string
  date: string
  durationMinutes: number
  note: string
}

type AppContextValue = AppSnapshot & {
  hydrated: boolean
  ready: boolean
  activeTimer: ActiveTimer | null
  activeTimerGoalTitle: string
  initializeHousehold: (names: string[]) => Promise<void>
  refresh: () => Promise<void>
  addManualRecord: (input: ManualRecordInput) => Promise<void>
  startActiveTimer: (input: { memberId: string; goalId: string; taskId?: string }) => void
  pauseActiveTimer: () => void
  resumeActiveTimer: () => void
  finishActiveTimer: (note: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(emptySnapshot)
  const [hydrated, setHydrated] = useState(false)
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() => loadActiveTimer())

  const refresh = async () => {
    setSnapshot(await repository.getSnapshot())
    setHydrated(true)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const persistTimer = (timer: ActiveTimer | null) => {
    setActiveTimer(timer)
    saveActiveTimer(timer)
  }

  const value = useMemo<AppContextValue>(
    () => ({
      ...snapshot,
      hydrated,
      ready: snapshot.members.length === 2,
      activeTimer,
      activeTimerGoalTitle:
        snapshot.goals.find((goal) => goal.id === activeTimer?.goalId)?.title ?? '进行中的专注',
      initializeHousehold: async (names) => {
        await repository.saveHousehold(names)
        await refresh()
      },
      refresh,
      addManualRecord: async (input) => {
        await repository.addStudyRecord({
          ...input,
          startTime: undefined,
          endTime: undefined,
          isManualEntry: true,
        })
        await refresh()
      },
      startActiveTimer: (input) => {
        persistTimer(startTimer({ ...input, startedAt: new Date().toISOString() }))
      },
      pauseActiveTimer: () => {
        if (!activeTimer) {
          return
        }
        persistTimer(pauseTimer(activeTimer, new Date().toISOString()))
      },
      resumeActiveTimer: () => {
        if (!activeTimer) {
          return
        }
        persistTimer(resumeTimer(activeTimer, new Date().toISOString()))
      },
      finishActiveTimer: async (note) => {
        if (!activeTimer) {
          return
        }

        const result = finishTimer(activeTimer, new Date().toISOString())
        await repository.addStudyRecord({
          memberId: activeTimer.memberId,
          goalId: activeTimer.goalId,
          taskId: activeTimer.taskId,
          date: result.finishedAt.slice(0, 10),
          startTime: result.startedAt,
          endTime: result.finishedAt,
          durationMinutes: result.durationMinutes,
          note: note.trim(),
          isManualEntry: false,
        })
        persistTimer(null)
        await refresh()
      },
    }),
    [activeTimer, hydrated, snapshot],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useOptionalAppContext() {
  return useContext(AppContext)
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}
