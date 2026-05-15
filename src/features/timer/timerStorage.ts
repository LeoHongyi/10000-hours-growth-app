import type { ActiveTimer } from '../../domain/types'

const STORAGE_KEY = 'growth-app-active-timer'

export function startTimer(input: Pick<ActiveTimer, 'memberId' | 'goalId' | 'taskId' | 'startedAt'>): ActiveTimer {
  return {
    ...input,
    currentStartedAt: input.startedAt,
    accumulatedSeconds: 0,
    isPaused: false,
  }
}

export function pauseTimer(timer: ActiveTimer, pausedAt: string): ActiveTimer {
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

export function resumeTimer(timer: ActiveTimer, resumedAt: string): ActiveTimer {
  return {
    ...timer,
    currentStartedAt: resumedAt,
    isPaused: false,
  }
}

export function finishTimer(timer: ActiveTimer, finishedAt: string) {
  const liveSeconds = timer.isPaused
    ? 0
    : Math.max(0, (Date.parse(finishedAt) - Date.parse(timer.currentStartedAt)) / 1000)

  return {
    durationMinutes: Math.max(1, Math.round((timer.accumulatedSeconds + liveSeconds) / 60)),
    startedAt: timer.startedAt,
    finishedAt,
  }
}

export function saveActiveTimer(timer: ActiveTimer | null) {
  if (!timer) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timer))
}

export function loadActiveTimer(): ActiveTimer | null {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  return JSON.parse(raw) as ActiveTimer
}
