import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import type { AppSnapshot, Goal, GoalTask, StudyRecord } from '../domain/types'
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

type AppContextValue = AppSnapshot & {
  hydrated: boolean
  ready: boolean
  initializeHousehold: (names: string[]) => Promise<void>
  refresh: () => Promise<void>
  createGoal: (input: Pick<Goal, 'memberId' | 'title' | 'targetMinutes'>) => Promise<Goal>
  createTask: (input: Pick<GoalTask, 'goalId' | 'title'>) => Promise<GoalTask>
  addStudyRecord: (input: Omit<StudyRecord, 'id' | 'createdAt'>) => Promise<StudyRecord>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(emptySnapshot)
  const [hydrated, setHydrated] = useState(false)

  const refresh = async () => {
    setSnapshot(await repository.getSnapshot())
    setHydrated(true)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      ...snapshot,
      hydrated,
      ready: snapshot.members.length === 2,
      initializeHousehold: async (names) => {
        await repository.saveHousehold(names)
        await refresh()
      },
      refresh,
      createGoal: async (input) => {
        const goal = await repository.createGoal(input)
        await refresh()
        return goal
      },
      createTask: async (input) => {
        const task = await repository.createTask(input)
        await refresh()
        return task
      },
      addStudyRecord: async (input) => {
        const record = await repository.addStudyRecord(input)
        await refresh()
        return record
      },
    }),
    [hydrated, snapshot],
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
