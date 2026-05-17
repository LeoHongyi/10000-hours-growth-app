import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

function resetGrowthAppDb() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('growth-app')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

beforeEach(async () => {
  window.localStorage.clear()
  await resetGrowthAppDb()
})

describe('App integration', () => {
  it('sets up two adults and lands on the home dashboard', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(await screen.findByPlaceholderText('例如：妈妈'), '妈妈')
    await user.type(screen.getByPlaceholderText('例如：爸爸'), '爸爸')
    await user.click(screen.getByRole('button', { name: '进入成长记录' }))

    expect(await screen.findByText('今天先开始一点点')).toBeInTheDocument()
    expect(screen.getByText('宝宝成长记录')).toBeInTheDocument()
  })
})
