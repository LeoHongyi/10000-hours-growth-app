import { describe, expect, it } from 'vitest'
import { finishTimer, pauseTimer, resumeTimer, startTimer } from './timerStorage'

describe('timer storage helpers', () => {
  it('pauses, resumes, and finishes with accumulated minutes', () => {
    const running = startTimer({
      memberId: 'member-1',
      goalId: 'goal-1',
      taskId: 'task-1',
      startedAt: '2026-05-14T09:00:00.000Z',
    })

    const paused = pauseTimer(running, '2026-05-14T09:30:00.000Z')
    const resumed = resumeTimer(paused, '2026-05-14T09:40:00.000Z')
    const result = finishTimer(resumed, '2026-05-14T10:10:00.000Z')

    expect(result.durationMinutes).toBe(60)
  })

  it('keeps the original session start time after pause and resume', () => {
    const running = startTimer({
      memberId: 'member-1',
      goalId: 'goal-1',
      taskId: 'task-1',
      startedAt: '2026-05-14T09:00:00.000Z',
    })

    const paused = pauseTimer(running, '2026-05-14T09:30:00.000Z')
    const resumed = resumeTimer(paused, '2026-05-14T09:40:00.000Z')
    const result = finishTimer(resumed, '2026-05-14T10:10:00.000Z')

    expect(result.startedAt).toBe('2026-05-14T09:00:00.000Z')
    expect(result.finishedAt).toBe('2026-05-14T10:10:00.000Z')
  })
})
