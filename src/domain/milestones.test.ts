import { describe, expect, it } from 'vitest'
import { getNewMilestone } from './milestones'

describe('getNewMilestone', () => {
  it('returns the next unreached milestone when progress crosses a threshold', () => {
    const milestone = getNewMilestone({
      goalId: 'g1',
      previousMinutes: 9 * 60,
      nextMinutes: 10 * 60,
      reachedHours: [],
    })

    expect(milestone?.milestoneHours).toBe(10)
  })
})
