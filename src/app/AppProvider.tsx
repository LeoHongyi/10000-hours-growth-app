import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AppSnapshot, MilestoneRecord, PlanItem, PlanStatus } from '../domain/types'
import { getNewMilestone } from '../domain/milestones'
import { buildDailySuggestions, buildWeeklyFrameworkSuggestions } from '../domain/suggestions'
import { compressImage } from '../features/diary/image'
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

type BackupFile = {
  app: '10000-hours-growth-app'
  version: 1
  exportedAt: string
  data: AppSnapshot
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
  ensureTodaySuggestions: () => Promise<void>
  todaySuggestions: PlanItem[]
  weeklyFramework: PlanItem[]
  changePlanStatus: (planId: string, status: PlanStatus) => Promise<void>
  replacePlan: (planId: string) => Promise<void>
  weeklyMinutes: number
  monthlyMinutes: number
  activeMilestone: MilestoneRecord | null
  closeMilestone: () => void
  createDiaryEntry: (input: { date: string; note: string; photo?: File }) => Promise<void>
  exportBackup: () => Promise<BackupFile>
  importBackup: (file: File) => Promise<void>
  clearAllData: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== 'object') {
    return false
  }

  const backup = value as BackupFile
  return (
    backup.app === '10000-hours-growth-app' &&
    backup.version === 1 &&
    typeof backup.exportedAt === 'string' &&
    !!backup.data &&
    Array.isArray(backup.data.members) &&
    Array.isArray(backup.data.goals) &&
    Array.isArray(backup.data.tasks) &&
    Array.isArray(backup.data.records) &&
    Array.isArray(backup.data.plans) &&
    Array.isArray(backup.data.milestones) &&
    Array.isArray(backup.data.diary)
  )
}

function startOfWeekKey(nowDate = new Date()) {
  const date = new Date(nowDate)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - date.getDay())
  return date.toISOString().slice(0, 10)
}

function addDaysKey(baseDate: string, days: number) {
  const date = new Date(baseDate)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function AppProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(emptySnapshot)
  const [hydrated, setHydrated] = useState(false)
  const [activeTimer, setActiveTimer] = useState<StoredActiveTimer | null>(() => loadActiveTimer())
  const [activeMilestone, setActiveMilestone] = useState<MilestoneRecord | null>(null)

  const refresh = useCallback(async () => {
    setSnapshot(await repository.getSnapshot())
    setHydrated(true)
  }, [])

  const ensureTodaySuggestions = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10)
    const weekEnd = addDaysKey(today, 7)
    const hasTodayPlans = snapshot.plans.some((plan) => plan.date === today)
    const hasWeeklyFramework = snapshot.plans.some((plan) => plan.date > today && plan.date <= weekEnd)

    if (snapshot.goals.length === 0) {
      return
    }

    const generatedToday = hasTodayPlans
      ? []
      : buildDailySuggestions({
          date: today,
          members: snapshot.members,
          goals: snapshot.goals,
          tasks: snapshot.tasks,
          records: snapshot.records,
        })

    const generatedWeekly = hasWeeklyFramework
      ? []
      : buildWeeklyFrameworkSuggestions({
          date: today,
          members: snapshot.members,
          goals: snapshot.goals,
          tasks: snapshot.tasks,
          records: snapshot.records,
        })

    if (generatedToday.length === 0 && generatedWeekly.length === 0) {
      return
    }

    await repository.savePlans([...generatedToday, ...generatedWeekly])
    await refresh()
  }, [refresh, snapshot])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!hydrated || snapshot.members.length !== 2) {
      return
    }

    void ensureTodaySuggestions()
  }, [ensureTodaySuggestions, hydrated, snapshot])

  const persistTimer = (timer: StoredActiveTimer | null) => {
    setActiveTimer(timer)
    saveActiveTimer(timer)
  }

  const maybeCelebrate = useCallback(async (goalId: string, previousMinutes: number, nextMinutes: number) => {
    const reachedHours = snapshot.milestones
      .filter((item) => item.goalId === goalId)
      .map((item) => item.milestoneHours)
    const milestone = getNewMilestone({ goalId, previousMinutes, nextMinutes, reachedHours })

    if (!milestone) {
      return
    }

    await repository.saveMilestone(milestone)
    setActiveMilestone(milestone)
  }, [snapshot.milestones])

  const value = useMemo<AppContextValue>(() => {
    const today = new Date().toISOString().slice(0, 10)
    const weekEnd = addDaysKey(today, 7)
    const currentMonth = today.slice(0, 7)
    const weeklyMinutes = snapshot.records
      .filter((record) => record.date >= startOfWeekKey())
      .reduce((sum, record) => sum + record.durationMinutes, 0)
    const monthlyMinutes = snapshot.records
      .filter((record) => record.date.slice(0, 7) === currentMonth)
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
        const previousMinutes = snapshot.goals.find((goal) => goal.id === input.goalId)?.completedMinutes ?? 0
        await repository.addStudyRecord({
          ...input,
          startTime: undefined,
          endTime: undefined,
          isManualEntry: true,
        })
        await maybeCelebrate(input.goalId, previousMinutes, previousMinutes + input.durationMinutes)
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

        const previousMinutes = snapshot.goals.find((goal) => goal.id === activeTimer.goalId)?.completedMinutes ?? 0
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
        await maybeCelebrate(activeTimer.goalId, previousMinutes, previousMinutes + result.durationMinutes)
        persistTimer(null)
        await refresh()
      },
      ensureTodaySuggestions,
      todaySuggestions: snapshot.plans.filter((plan) => plan.date === today && plan.status === 'pending'),
      weeklyFramework: snapshot.plans
        .filter((plan) => plan.date > today && plan.date <= weekEnd)
        .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)),
      changePlanStatus: async (planId, status) => {
        const plan = snapshot.plans.find((item) => item.id === planId)
        if (!plan) {
          return
        }

        await repository.savePlans([{ ...plan, status }])
        await refresh()
      },
      replacePlan: async (planId) => {
        const target = snapshot.plans.find((plan) => plan.id === planId)
        if (!target) {
          return
        }

        const replacement = buildDailySuggestions({
          date: target.date,
          members: snapshot.members,
          goals: snapshot.goals.filter((goal) => goal.id !== target.goalId),
          tasks: snapshot.tasks,
          records: snapshot.records,
        })[0]

        if (!replacement) {
          return
        }

        await repository.savePlans([
          { ...target, status: 'replaced' },
          { ...replacement, date: target.date },
        ])
        await refresh()
      },
      weeklyMinutes,
      monthlyMinutes,
      activeMilestone,
      closeMilestone: () => setActiveMilestone(null),
      createDiaryEntry: async ({ date, note, photo }) => {
        let photoData: string | undefined

        if (photo) {
          photoData = await compressImage(photo)
        }

        await repository.saveDiaryEntry({
          id: crypto.randomUUID(),
          date,
          note: note.trim(),
          photo: photoData,
          createdAt: new Date().toISOString(),
        })
        await refresh()
      },
      exportBackup: async () => ({
        app: '10000-hours-growth-app',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: await repository.getSnapshot(),
      }),
      importBackup: async (file) => {
        const parsed = JSON.parse(await file.text()) as unknown

        if (!isBackupFile(parsed)) {
          throw new Error('Invalid backup file')
        }

        await repository.replaceSnapshot(parsed.data)
        persistTimer(null)
        setActiveMilestone(null)
        await refresh()
      },
      clearAllData: async () => {
        await repository.clearAll()
        persistTimer(null)
        setActiveMilestone(null)
        await refresh()
      },
    }
  }, [activeMilestone, activeTimer, ensureTodaySuggestions, hydrated, maybeCelebrate, refresh, snapshot])

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
