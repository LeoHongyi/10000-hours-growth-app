import type { Goal, GoalTask, Member, PlanItem, StudyRecord } from './types'

const createId = () => crypto.randomUUID()

function daysSince(lastDate: string | undefined, today: string) {
  if (!lastDate) {
    return 999
  }

  return Math.max(0, Math.round((Date.parse(today) - Date.parse(lastDate)) / 86400000))
}

export function buildDailySuggestions(input: {
  date: string
  members: Member[]
  goals: Goal[]
  tasks: GoalTask[]
  records: StudyRecord[]
}): PlanItem[] {
  const { date, members, goals, tasks, records } = input

  return goals
    .filter((goal) => goal.isActive)
    .map((goal) => {
      const goalRecords = records
        .filter((record) => record.goalId === goal.id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      const lastRecord = goalRecords[0]
      const remaining = goal.targetMinutes - goal.completedMinutes
      const inactivityWeight = daysSince(lastRecord?.date, date) * 2000
      const score = inactivityWeight + Math.round(remaining * 0.1)
      const task = tasks.find((item) => item.goalId === goal.id)
      const member = members.find((item) => item.id === goal.memberId)

      return {
        id: createId(),
        memberId: goal.memberId,
        goalId: goal.id,
        taskId: task?.id,
        date,
        title: `${member?.name ?? '成员'} · ${goal.title}${task ? ` · ${task.title}` : ''}`,
        suggestedMinutes: Math.min(60, Math.max(20, Math.round(remaining / 700))),
        status: 'pending' as const,
        source: 'system' as const,
        score,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...plan }) => plan)
}
