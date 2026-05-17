import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DiaryPage } from './DiaryPage'

describe('DiaryPage', () => {
  it('submits a note and lists entries in reverse date order', async () => {
    const user = userEvent.setup()
    const onCreateEntry = vi.fn()

    render(
      <DiaryPage
        entries={[
          { id: 'd1', date: '2026-05-13', note: '今天会自己翻书了', createdAt: '2026-05-13T08:00:00.000Z' },
        ]}
        onCreateEntry={onCreateEntry}
      />,
    )

    await user.type(screen.getByLabelText('一句话'), '今天第一次会拍手了')
    await user.click(screen.getByRole('button', { name: '保存成长记录' }))

    expect(onCreateEntry).toHaveBeenCalled()
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('今天会自己翻书了')
  })
})
