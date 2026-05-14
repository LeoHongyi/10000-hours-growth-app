import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'

describe('App shell', () => {
  it('shows onboarding before household setup is finished', () => {
    render(<App ready={false} onInitialize={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '先创建两位大人' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '进入成长记录' })).toBeInTheDocument()
  })

  it('shows the five primary tabs after setup', () => {
    render(<App ready onInitialize={vi.fn()} />)

    ;['首页', '目标', '记录', '计划', '家庭日记'].forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    })
  })
})
