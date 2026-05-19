import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { PreferencesProvider } from './preferences'

const renderApp = (ready: boolean, onInitialize = vi.fn()) =>
  render(
    <PreferencesProvider>
      <App ready={ready} onInitialize={onInitialize} />
    </PreferencesProvider>,
  )

describe('App shell', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-language')
    document.documentElement.lang = ''
  })

  it('shows onboarding before household setup is finished', () => {
    renderApp(false)

    expect(screen.getByRole('heading', { name: '先创建两位大人' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '进入成长记录' })).toBeInTheDocument()
  })

  it('shows the primary tabs after setup', () => {
    renderApp(true)

    ;['首页', '目标', '记录', '日记'].forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    })
  })

  it('opens settings and applies theme and language preferences', async () => {
    const user = userEvent.setup()
    renderApp(true)

    await user.click(screen.getByRole('button', { name: '设置' }))
    expect(screen.getByRole('dialog', { name: '偏好设置' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '暗色模式' }))
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'))

    await user.click(screen.getByRole('button', { name: '英文' }))
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('shows backup, restore, clear, and privacy controls in settings', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderApp(true)

    await user.click(screen.getByRole('button', { name: '设置' }))

    expect(screen.getByRole('button', { name: '导出备份' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '导入恢复' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清空本地数据' })).toBeInTheDocument()
    expect(screen.getByText('当前版本的数据只保存在这台设备的浏览器里，不会上传到服务器。')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '清空本地数据' }))
    expect(confirmSpy).toHaveBeenCalledWith('清空后无法恢复。请先导出备份，确定继续吗？')
  })

  it('submits trimmed household names and blocks incomplete input', async () => {
    const onInitialize = vi.fn()
    const user = userEvent.setup()

    renderApp(false, onInitialize)

    const submitButton = screen.getByRole('button', { name: '进入成长记录' })

    await user.type(screen.getByPlaceholderText('例如：妈妈'), '  妈妈  ')

    expect(submitButton).toBeDisabled()
    await user.click(submitButton)
    expect(onInitialize).not.toHaveBeenCalled()

    await user.type(screen.getByPlaceholderText('例如：爸爸'), '  爸爸  ')

    expect(submitButton).toBeEnabled()
    await user.click(submitButton)

    expect(onInitialize).toHaveBeenCalledWith(['妈妈', '爸爸'])
  })
})
