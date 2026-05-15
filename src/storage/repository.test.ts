import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { createAppRepository } from './repository'

describe('app repository', () => {
  afterEach(() => {
    indexedDB.deleteDatabase('growth-app-test')
  })

  it('stores members, goals, tasks, records, and returns derived goal progress', async () => {
    const repo = createAppRepository('growth-app-test')

    const members = await repo.saveHousehold(['妈妈', '爸爸'])
    const goal = await repo.createGoal({
      memberId: members[0].id,
      title: '蒙氏学习',
      targetMinutes: 500 * 60,
    })
    const task = await repo.createTask({
      goalId: goal.id,
      title: '听课',
    })

    await repo.addStudyRecord({
      memberId: members[0].id,
      goalId: goal.id,
      taskId: task.id,
      date: '2026-05-14',
      startTime: '2026-05-14T09:00:00.000Z',
      endTime: '2026-05-14T10:30:00.000Z',
      durationMinutes: 90,
      note: '完成第 3 章听课',
      isManualEntry: false,
    })

    const snapshot = await repo.getSnapshot()

    expect(snapshot.members).toHaveLength(2)
    expect(snapshot.goals[0].completedMinutes).toBe(90)
    expect(snapshot.tasks[0].title).toBe('听课')
    expect(snapshot.records[0].note).toBe('完成第 3 章听课')
  })

  it('removes orphaned study data when the household is re-initialized', async () => {
    const repo = createAppRepository('growth-app-test')

    const members = await repo.saveHousehold(['妈妈', '爸爸'])
    const goal = await repo.createGoal({
      memberId: members[0].id,
      title: '蒙氏学习',
      targetMinutes: 500 * 60,
    })

    await repo.createTask({
      goalId: goal.id,
      title: '听课',
    })

    await repo.addStudyRecord({
      memberId: members[0].id,
      goalId: goal.id,
      date: '2026-05-14',
      durationMinutes: 90,
      note: '完成第 3 章听课',
      isManualEntry: false,
    })

    await repo.saveHousehold(['外婆', '外公'])

    const snapshot = await repo.getSnapshot()

    expect(snapshot.members.map((member) => member.name)).toEqual(['外婆', '外公'])
    expect(snapshot.goals).toEqual([])
    expect(snapshot.tasks).toEqual([])
    expect(snapshot.records).toEqual([])
    expect(snapshot.plans).toEqual([])
    expect(snapshot.milestones).toEqual([])
  })
})
