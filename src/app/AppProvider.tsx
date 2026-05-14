import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import type { AppSnapshot } from '../domain/types'
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
  ready: boolean
  initializeHousehold: (names: string[]) => Promise<void>
  refresh: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(emptySnapshot)

  const refresh = async () => {
    setSnapshot(await repository.getSnapshot())
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      ...snapshot,
      ready: snapshot.members.length === 2,
      initializeHousehold: async (names) => {
        await repository.saveHousehold(names)
        await refresh()
      },
      refresh,
    }),
    [snapshot],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}
