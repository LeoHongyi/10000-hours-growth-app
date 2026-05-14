import { FormEvent, useState } from 'react'

type OnboardingPageProps = {
  onSubmit: (names: string[]) => Promise<void> | void
}

export function OnboardingPage({ onSubmit }: OnboardingPageProps) {
  const [names, setNames] = useState(['', ''])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleaned = names.map((name) => name.trim()).filter(Boolean)

    if (cleaned.length !== 2) {
      return
    }

    await onSubmit(cleaned)
  }

  return (
    <main className="onboarding-page">
      <section className="hero-card">
        <p className="eyebrow">一万小时成长记录</p>
        <h1>先创建两位大人</h1>
        <p className="muted">第一版先服务你们两位，再把每天的学习和宝宝的成长片段慢慢装进去。</p>

        <form className="stack-md" onSubmit={handleSubmit}>
          <label className="stack-xs">
            <span>大人 1</span>
            <input
              value={names[0]}
              onChange={(event) => setNames([event.target.value, names[1]])}
              placeholder="例如：妈妈"
            />
          </label>

          <label className="stack-xs">
            <span>大人 2</span>
            <input
              value={names[1]}
              onChange={(event) => setNames([names[0], event.target.value])}
              placeholder="例如：爸爸"
            />
          </label>

          <button className="primary-button" type="submit">进入成长记录</button>
        </form>
      </section>
    </main>
  )
}
