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

  it('keeps completedMinutes equal to the total stored study minutes for a goal', async () => {
    const repo = createAppRepository('growth-app-test')

    const members = await repo.saveHousehold(['妈妈', '爸爸'])
    const goal = await repo.createGoal({
      memberId: members[0].id,
      title: '蒙氏学习',
      targetMinutes: 500 * 60,
    })

    await repo.addStudyRecord({
      memberId: members[0].id,
      goalId: goal.id,
      date: '2026-05-14',
      durationMinutes: 30,
      note: '晨间阅读',
      isManualEntry: false,
    })

    await repo.addStudyRecord({
      memberId: members[0].id,
      goalId: goal.id,
      date: '2026-05-14',
      durationMinutes: 45,
      note: '晚间听课',
      isManualEntry: false,
    })

    const snapshot = await repo.getSnapshot()

    expect(snapshot.goals[0].completedMinutes).toBe(75)
    expect(snapshot.records.reduce((sum, record) => sum + record.durationMinutes, 0)).toBe(75)
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

    await repo.savePlans([
      {
        id: 'plan-1',
        memberId: members[0].id,
        goalId: goal.id,
        date: '2026-05-15',
        title: '妈妈 · 蒙氏学习',
        suggestedMinutes: 45,
        status: 'pending',
        source: 'system',
      },
    ])

    await repo.saveMilestone({
      id: 'milestone-1',
      goalId: goal.id,
      milestoneHours: 10,
      reachedAt: '2026-05-15T00:00:00.000Z',
      message: '小花送给你',
    })

    await repo.saveDiaryEntry({
      id: 'diary-1',
      date: '2026-05-15',
      note: '今天会自己拍手了',
      createdAt: '2026-05-15T00:00:00.000Z',
    })

    await repo.saveHousehold(['外婆', '外公'])

    const snapshot = await repo.getSnapshot()

    expect(snapshot.members.map((member) => member.name)).toEqual(['外婆', '外公'])
    expect(snapshot.goals).toEqual([])
    expect(snapshot.tasks).toEqual([])
    expect(snapshot.records).toEqual([])
    expect(snapshot.plans).toEqual([])
    expect(snapshot.milestones).toEqual([])
    expect(snapshot.diary).toEqual([])
  })

  it('replaces all local data from a backup snapshot', async () => {
    const repo = createAppRepository('growth-app-test')

    const firstMembers = await repo.saveHousehold(['妈妈', '爸爸'])
    const firstGoal = await repo.createGoal({
      memberId: firstMembers[0].id,
      title: '旧目标',
      targetMinutes: 100,
    })

    await repo.addStudyRecord({
      memberId: firstMembers[0].id,
      goalId: firstGoal.id,
      date: '2026-05-14',
      durationMinutes: 30,
      note: '旧记录',
      isManualEntry: true,
    })

    await repo.replaceSnapshot({
      members: [
        {
          id: 'member-1',
          name: '外婆',
          avatarColor: '#ffffff',
          sortOrder: 0,
        },
      ],
      goals: [
        {
          id: 'goal-1',
          memberId: 'member-1',
          title: '新目标',
          targetMinutes: 600,
          completedMinutes: 45,
          isActive: true,
          createdAt: '2026-05-15T00:00:00.000Z',
        },
      ],
      tasks: [],
      records: [
        {
          id: 'record-1',
          memberId: 'member-1',
          goalId: 'goal-1',
          date: '2026-05-15',
          durationMinutes: 45,
          note: '新记录',
          isManualEntry: true,
          createdAt: '2026-05-15T00:00:00.000Z',
        },
      ],
      plans: [],
      milestones: [],
      diary: [],
    })

    const snapshot = await repo.getSnapshot()

    expect(snapshot.members.map((member) => member.name)).toEqual(['外婆'])
    expect(snapshot.goals.map((goal) => goal.title)).toEqual(['新目标'])
    expect(snapshot.records.map((record) => record.note)).toEqual(['新记录'])
  })

  it('clears all local app data', async () => {
    const repo = createAppRepository('growth-app-test')

    const members = await repo.saveHousehold(['妈妈', '爸爸'])
    await repo.createGoal({
      memberId: members[0].id,
      title: '蒙氏学习',
      targetMinutes: 500 * 60,
    })

    await repo.clearAll()

    const snapshot = await repo.getSnapshot()

    expect(snapshot).toEqual({
      members: [],
      goals: [],
      tasks: [],
      records: [],
      plans: [],
      milestones: [],
      diary: [],
    })
  })
})
