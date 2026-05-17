import type { MilestoneRecord } from './types'

const checkpoints = [10, 50, 100, 200, 300, 500]

export function getNewMilestone(input: {
  goalId: string
  previousMinutes: number
  nextMinutes: number
  reachedHours: number[]
}): MilestoneRecord | null {
  const previousHours = input.previousMinutes / 60
  const nextHours = input.nextMinutes / 60
  const matched = checkpoints.find(
    (checkpoint) =>
      previousHours < checkpoint && nextHours >= checkpoint && !input.reachedHours.includes(checkpoint),
  )

  if (!matched) {
    return null
  }

  return {
    id: crypto.randomUUID(),
    goalId: input.goalId,
    milestoneHours: matched,
    reachedAt: new Date().toISOString(),
    message: `小花送给你，已经走到 ${matched} 小时了。`,
  }
}
