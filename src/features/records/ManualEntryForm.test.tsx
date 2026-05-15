import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ManualEntryForm } from './ManualEntryForm'

const members = [{ id: 'm1', name: '妈妈', avatarColor: '#E8C8A1', sortOrder: 0 }]
const goals = [
  {
    id: 'g1',
    memberId: 'm1',
    title: '蒙氏学习',
    targetMinutes: 30000,
    completedMinutes: 0,
    isActive: true,
    createdAt: '2026-05-14T00:00:00.000Z',
  },
]
const tasks = [{ id: 't1', goalId: 'g1', title: '看书', sortOrder: 0 }]

describe('ManualEntryForm', () => {
  it('blocks zero-minute entries and shows an inline message', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <ManualEntryForm
        members={members}
        goals={goals}
        tasks={tasks}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByLabelText('时长（分钟）'), '0')
    await user.click(screen.getByRole('button', { name: '保存补录' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('时长必须大于 0 分钟')).toBeInTheDocument()
  })

  it('blocks non-numeric duration input', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <ManualEntryForm
        members={members}
        goals={goals}
        tasks={tasks}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByLabelText('时长（分钟）'), 'abc')
    await user.click(screen.getByRole('button', { name: '保存补录' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('请输入有效的分钟数')).toBeInTheDocument()
  })
})
