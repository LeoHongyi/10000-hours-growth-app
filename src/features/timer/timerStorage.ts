import type { ActiveTimer } from '../../domain/types'

const STORAGE_KEY = 'growth-app-active-timer'

type StoredActiveTimer = ActiveTimer & {
  currentStartedAt: string
}

export function startTimer(input: Pick<ActiveTimer, 'memberId' | 'goalId' | 'taskId' | 'startedAt'>): StoredActiveTimer {
  return {
    ...input,
    currentStartedAt: input.startedAt,
    accumulatedSeconds: 0,
    isPaused: false,
  }
}

export function pauseTimer(timer: StoredActiveTimer, pausedAt: string): StoredActiveTimer {
  if (timer.isPaused) {
    return timer
  }

  const diffSeconds = Math.max(0, (Date.parse(pausedAt) - Date.parse(timer.currentStartedAt)) / 1000)

  return {
    ...timer,
    currentStartedAt: pausedAt,
    accumulatedSeconds: timer.accumulatedSeconds + diffSeconds,
    isPaused: true,
  }
}

export function resumeTimer(timer: StoredActiveTimer, resumedAt: string): StoredActiveTimer {
  if (!timer.isPaused) {
    return timer
  }

  return {
    ...timer,
    currentStartedAt: resumedAt,
    isPaused: false,
  }
}

export function finishTimer(timer: StoredActiveTimer, finishedAt: string) {
  const liveSeconds = timer.isPaused
    ? 0
    : Math.max(0, (Date.parse(finishedAt) - Date.parse(timer.currentStartedAt)) / 1000)

  return {
    durationMinutes: Math.max(1, Math.round((timer.accumulatedSeconds + liveSeconds) / 60)),
    startedAt: timer.startedAt,
    finishedAt,
  }
}

export function saveActiveTimer(timer: StoredActiveTimer | null) {
  if (!timer) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timer))
}

export function loadActiveTimer(): StoredActiveTimer | null {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  return JSON.parse(raw) as StoredActiveTimer
}

export type { StoredActiveTimer }
