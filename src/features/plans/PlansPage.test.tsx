import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlansPage } from './PlansPage'

const plan = {
  id: 'p1',
  memberId: 'm1',
  goalId: 'g1',
  taskId: 't1',
  date: '2026-05-14',
  title: '妈妈 · 蒙氏学习 · 听课',
  suggestedMinutes: 45,
  status: 'pending' as const,
  source: 'system' as const,
}

describe('PlansPage', () => {
  it('marks items complete and shows a monthly overview card', async () => {
    const user = userEvent.setup()
    const onChangeStatus = vi.fn()

    render(
      <PlansPage
        todayPlans={[plan]}
        weeklyPlans={[{ ...plan, id: 'p2', date: '2026-05-18', suggestedMinutes: 30 }]}
        monthlyMinutes={340}
        onChangeStatus={onChangeStatus}
        onReplacePlan={vi.fn()}
      />,
    )

    expect(screen.getByText('本月已投入 5h 40m')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '完成这条' }))
    expect(onChangeStatus).toHaveBeenCalledWith('p1', 'completed')
  })
})
