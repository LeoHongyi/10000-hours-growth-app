import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
  diaryEntries: [
    {
      id: 'd1',
      date: '2026-05-18',
      note: '今天第一次自己拍手了',
      createdAt: '2026-05-18T10:00:00.000Z',
    },
  ],
  onStartSuggestion: vi.fn(),
}

describe('HomePage', () => {
  it('shows weekly family time and a quick start button', () => {
    render(
      <MemoryRouter>
        <HomePage {...props} />
      </MemoryRouter>,
    )

    expect(screen.getByText('本周家庭投入 2小时 40分钟')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开始这条建议' })).toBeInTheDocument()
    expect(screen.getByText('今天第一次自己拍手了')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '去家庭日记' })).toHaveAttribute('href', '/diary')
  })
})
