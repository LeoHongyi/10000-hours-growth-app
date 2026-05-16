import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'

const props = {
  weeklyMinutes: 160,
  suggestions: [
    {
      id: 'p1',
      memberId: 'm1',
      goalId: 'g1',
      taskId: 't1',
      date: '2026-05-14',
      title: '妈妈 · 蒙氏学习 · 听课',
      suggestedMinutes: 45,
      status: 'pending' as const,
      source: 'system' as const,
    },
  ],
  goalPreview: [{ id: 'g1', title: '蒙氏学习', completedMinutes: 180, targetMinutes: 30000 }],
  onStartSuggestion: vi.fn(),
}

describe('HomePage', () => {
  it('shows weekly family time and a quick start button', () => {
    render(<HomePage {...props} />)

    expect(screen.getByText('本周家庭投入 2h 40m')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开始这条建议' })).toBeInTheDocument()
  })
})
