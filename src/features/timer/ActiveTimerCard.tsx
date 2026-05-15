import { useState } from 'react'
import { useAppContext } from '../../app/AppProvider'

export function ActiveTimerCard() {
  const app = useAppContext()
  const [note, setNote] = useState('')

  if (!app.activeTimer) {
    return null
  }

  const handleFinish = async () => {
    await app.finishActiveTimer(note)
    setNote('')
  }

  return (
    <section className="page-card stack-md">
      <h2>当前专注中</h2>
      <p>{app.activeTimerGoalTitle}</p>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="结束时顺手记一句今天学了什么"
      />
      <div className="button-row">
        <button className="secondary-button" onClick={app.pauseActiveTimer}>
          {app.activeTimer.isPaused ? '已暂停' : '暂停'}
        </button>
        <button
          className="secondary-button"
          disabled={!app.activeTimer.isPaused}
          onClick={app.resumeActiveTimer}
        >
          继续
        </button>
        <button className="primary-button" onClick={() => void handleFinish()}>
          结束并保存
        </button>
      </div>
    </section>
  )
}
