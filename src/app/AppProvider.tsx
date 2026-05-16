import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import type { AppSnapshot, PlanItem } from '../domain/types'
import { buildDailySuggestions } from '../domain/suggestions'
import {
  finishTimer,
  loadActiveTimer,
  pauseTimer,
  resumeTimer,
  saveActiveTimer,
  startTimer,
  type StoredActiveTimer,
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

export type AppContextValue = AppSnapshot & {
  hydrated: boolean
  ready: boolean
  activeTimer: StoredActiveTimer | null
  activeTimerGoalTitle: string
  initializeHousehold: (names: string[]) => Promise<void>
  refresh: () => Promise<void>
  createGoal: (input: {
    memberId: string
    title: string
    targetHours: number
    taskTitles: string[]
  }) => Promise<void>
  toggleGoal: (goalId: string) => Promise<void>
  addManualRecord: (input: ManualRecordInput) => Promise<void>
  startActiveTimer: (input: { memberId: string; goalId: string; taskId?: string }) => void
  pauseActiveTimer: () => void
  resumeActiveTimer: () => void
  finishActiveTimer: (note: string) => Promise<void>
  todaySuggestions: PlanItem[]
  weeklyMinutes: number
}

const AppContext = createContext<AppContextValue | null>(null)

function startOfWeekKey(nowDate = new Date()) {
  const date = new Date(nowDate)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - date.getDay())
  return date.toISOString().slice(0, 10)
}

export function AppProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(emptySnapshot)
  const [hydrated, setHydrated] = useState(false)
  const [activeTimer, setActiveTimer] = useState<StoredActiveTimer | null>(() => loadActiveTimer())

  const refresh = async () => {
    setSnapshot(await repository.getSnapshot())
    setHydrated(true)
  }

  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    if (!hydrated || snapshot.members.length !== 2) {
      return
    }

    const ensureTodaySuggestions = async () => {
      const today = new Date().toISOString().slice(0, 10)
      const hasTodayPlans = snapshot.plans.some((plan) => plan.date === today)

      if (hasTodayPlans || snapshot.goals.length === 0) {
        return
      }

      const generated = buildDailySuggestions({
        date: today,
        members: snapshot.members,
        goals: snapshot.goals,
        tasks: snapshot.tasks,
        records: snapshot.records,
      })

      if (generated.length === 0) {
        return
      }

      await repository.savePlans(generated)
      await refresh()
    }

    void ensureTodaySuggestions()
  }, [hydrated, snapshot])

  const persistTimer = (timer: StoredActiveTimer | null) => {
    setActiveTimer(timer)
    saveActiveTimer(timer)
  }

  const value = useMemo<AppContextValue>(() => {
    const today = new Date().toISOString().slice(0, 10)
    const weeklyMinutes = snapshot.records
      .filter((record) => record.date >= startOfWeekKey())
      .reduce((sum, record) => sum + record.durationMinutes, 0)

    return {
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
      createGoal: async ({ memberId, title, targetHours, taskTitles }) => {
        const goal = await repository.createGoal({
          memberId,
          title,
          targetMinutes: targetHours * 60,
        })

        for (const taskTitle of taskTitles) {
          await repository.createTask({ goalId: goal.id, title: taskTitle })
        }

        await refresh()
      },
      toggleGoal: async (goalId) => {
        const goal = snapshot.goals.find((item) => item.id === goalId)
        if (!goal) {
          return
        }

        await repository.updateGoal({ ...goal, isActive: !goal.isActive })
        await refresh()
      },
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
      todaySuggestions: snapshot.plans.filter((plan) => plan.date === today),
      weeklyMinutes,
    }
  }, [activeTimer, hydrated, snapshot])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function AppProviderStub({ children, value }: PropsWithChildren<{ value: AppContextValue }>) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}
