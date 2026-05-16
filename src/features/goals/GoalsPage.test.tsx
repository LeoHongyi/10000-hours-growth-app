import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { GoalsPage } from './GoalsPage'

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
    createdAt: '2026-05-14T00:00:00.000Z',
  },
]

describe('GoalsPage', () => {
  it('creates a goal and shows remaining hours', async () => {
    const user = userEvent.setup()
    const onCreateGoal = vi.fn()

    render(
      <MemoryRouter>
        <GoalsPage
          members={members}
          goals={goals}
          onCreateGoal={onCreateGoal}
          onToggleGoal={vi.fn()}
          onStartTimer={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('已学习 3h，剩余 497h')).toBeInTheDocument()

    await user.type(screen.getByLabelText('目标名称'), '雅思备考')
    await user.type(screen.getByLabelText('年度目标（小时）'), '300')
    await user.type(screen.getByLabelText('小任务（逗号分隔）'), '阅读, 听力')
    await user.click(screen.getByRole('button', { name: '新增目标' }))

    expect(onCreateGoal).toHaveBeenCalledWith({
      memberId: 'm1',
      title: '雅思备考',
      targetHours: 300,
      taskTitles: ['阅读', '听力'],
    })
  })

  it('blocks empty title and invalid target hours', async () => {
    const user = userEvent.setup()
    const onCreateGoal = vi.fn()

    render(
      <MemoryRouter>
        <GoalsPage
          members={members}
          goals={goals}
          onCreateGoal={onCreateGoal}
          onToggleGoal={vi.fn()}
          onStartTimer={vi.fn()}
        />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('目标名称'), '   ')
    await user.type(screen.getByLabelText('年度目标（小时）'), '0')
    await user.click(screen.getByRole('button', { name: '新增目标' }))

    expect(onCreateGoal).not.toHaveBeenCalled()
    expect(screen.getByText('请输入目标名称')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('目标名称'))
    await user.type(screen.getByLabelText('目标名称'), '雅思备考')
    await user.clear(screen.getByLabelText('年度目标（小时）'))
    await user.type(screen.getByLabelText('年度目标（小时）'), 'abc')
    await user.click(screen.getByRole('button', { name: '新增目标' }))

    expect(onCreateGoal).not.toHaveBeenCalled()
    expect(screen.getByText('请输入有效的目标小时数')).toBeInTheDocument()
  })
})
