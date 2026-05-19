import { useState } from 'react'
import { useAppContext } from '../../app/AppProvider'
import { usePreferences } from '../../app/preferences'

export function ActiveTimerCard() {
  const app = useAppContext()
  const { t } = usePreferences()
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
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t('专注计时')}</p>
          <h2>{t('当前专注中')}</h2>
        </div>
        <span className="badge sage">{app.activeTimer.isPaused ? t('已暂停') : t('进行中')}</span>
      </div>
      <p>{app.activeTimerGoalTitle}</p>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={t('结束时顺手记一句今天学了什么')}
      />
      <div className="button-row">
        <button className="secondary-button" disabled={app.activeTimer.isPaused} onClick={app.pauseActiveTimer}>
          <span className="material-symbols-outlined" aria-hidden="true">
            pause
          </span>
          {app.activeTimer.isPaused ? t('已暂停') : t('暂停')}
        </button>
        <button
          className="secondary-button"
          disabled={!app.activeTimer.isPaused}
          onClick={app.resumeActiveTimer}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            play_arrow
          </span>
          {t('继续')}
        </button>
        <button className="primary-button" onClick={() => void handleFinish()}>
          {t('结束并保存')}
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
        </button>
      </div>
    </section>
  )
}
