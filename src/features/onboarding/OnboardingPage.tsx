import { FormEvent, useMemo, useState } from 'react'
import { usePreferences } from '../../app/preferences'

type OnboardingPageProps = {
  onSubmit: (names: string[]) => Promise<void> | void
}

export function OnboardingPage({ onSubmit }: OnboardingPageProps) {
  const { t } = usePreferences()
  const [names, setNames] = useState(['', ''])
  const [error, setError] = useState('')
  const cleanedNames = useMemo(() => names.map((name) => name.trim()).filter(Boolean), [names])
  const canSubmit = cleanedNames.length === 2

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) {
      setError(t('请先填写两位大人的称呼'))
      return
    }

    setError('')
    await onSubmit(cleanedNames)
  }

  return (
    <main className="onboarding-page">
      <section className="hero-card">
        <p className="eyebrow">{t('一万小时成长记录')}</p>
        <h1>{t('先创建两位大人')}</h1>
        <p className="muted">{t('第一版先服务你们两位，再把每天的学习和宝宝的成长片段慢慢装进去。')}</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field-label">
            <span>{t('大人 1')}</span>
            <input
              value={names[0]}
              onChange={(event) => setNames([event.target.value, names[1]])}
              placeholder={t('例如：妈妈')}
            />
          </label>

          <label className="field-label">
            <span>{t('大人 2')}</span>
            <input
              value={names[1]}
              onChange={(event) => setNames([names[0], event.target.value])}
              placeholder={t('例如：爸爸')}
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={!canSubmit}>
            {t('进入成长记录')}
          </button>
        </form>
      </section>
    </main>
  )
}
