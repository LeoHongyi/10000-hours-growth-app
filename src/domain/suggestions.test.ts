import { describe, expect, it } from 'vitest'
import { buildDailySuggestions } from './suggestions'

const members = [
  { id: 'm1', name: '妈妈', avatarColor: '#E8C8A1', sortOrder: 0 },
  { id: 'm2', name: '爸爸', avatarColor: '#DDB892', sortOrder: 1 },
]

const goals = [
  {
    id: 'g1',
    memberId: 'm1',
    title: '蒙氏学习',
    targetMinutes: 30000,
    completedMinutes: 180,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'g2',
    memberId: 'm2',
    title: '雅思备考',
    targetMinutes: 18000,
    completedMinutes: 120,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

const tasks = [
  { id: 't1', goalId: 'g1', title: '听课', sortOrder: 0 },
  { id: 't2', goalId: 'g2', title: '阅读', sortOrder: 0 },
]

const records = [
  {
    id: 'r1',
    memberId: 'm1',
    goalId: 'g1',
    taskId: 't1',
    date: '2026-05-10',
    durationMinutes: 180,
    note: '',
    isManualEntry: false,
    createdAt: '2026-05-10T09:00:00.000Z',
  },
  {
    id: 'r2',
    memberId: 'm2',
    goalId: 'g2',
    taskId: 't2',
    date: '2026-05-01',
    durationMinutes: 120,
    note: '',
    isManualEntry: false,
    createdAt: '2026-05-01T09:00:00.000Z',
  },
]

describe('buildDailySuggestions', () => {
  it('prefers the goal that is further behind and less recently touched', () => {
    const suggestions = buildDailySuggestions({
      date: '2026-05-14',
      members,
      goals,
      tasks,
      records,
    })

    expect(suggestions[0].goalId).toBe('g2')
    expect(suggestions[0].suggestedMinutes).toBeGreaterThan(0)
  })
})
