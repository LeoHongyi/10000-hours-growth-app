import { FormEvent, useState } from 'react'
import { usePreferences } from '../../app/preferences'
import type { DiaryEntry } from '../../domain/types'

type DiaryPageProps = {
  entries: DiaryEntry[]
  onCreateEntry: (input: { date: string; photo?: File; note: string }) => Promise<void> | void
}

const today = () => new Date().toISOString().slice(0, 10)

export function DiaryPage({ entries, onCreateEntry }: DiaryPageProps) {
  const { t } = usePreferences()
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<File | undefined>()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onCreateEntry({ date, note: note.trim(), photo })
    setNote('')
    setPhoto(undefined)
  }

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  return (
    <section className="page-stack scrapbook-texture">
      <section className="dashboard-hero">
        <p className="eyebrow">{t('家庭成长日记')}</p>
        <h1>{t('家庭日记')}</h1>
        <p className="muted">{t('把学习进步、宝宝瞬间和家里的温馨片段连成一条时间线。')}</p>
      </section>

      <form className="page-card form-grid" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">{t('添加回忆')}</p>
          <h2>{t('温馨时光轮廓')}</h2>
        </div>
        <label className="field-label">
          <span>
            <span className="material-symbols-outlined" aria-hidden="true">
              calendar_month
            </span>
            {t('日期')}
          </span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="field-label">
          <span>
            <span className="material-symbols-outlined" aria-hidden="true">
              add_a_photo
            </span>
            {t('照片')}
          </span>
          <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0])} />
        </label>
        <label className="field-label">
          <span>
            <span className="material-symbols-outlined" aria-hidden="true">
              auto_stories
            </span>
            {t('一句话')}
          </span>
          <textarea
            aria-label={t('一句话')}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('例如：今天第一次自己拍手了。')}
          />
        </label>
        <button className="primary-button" type="submit">
          {t('保存成长记录')}
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
        </button>
      </form>

      <section className="diary-timeline" aria-label="成长日记时间线">
        {sortedEntries.length === 0 ? (
          <article className="diary-entry page-card stack-xs">
            <span className="badge peach">{t('今天')}</span>
            <h3>{t('还没有日记')}</h3>
            <p className="muted">{t('保存第一条成长记录后，它会出现在这里。')}</p>
          </article>
        ) : (
          sortedEntries.map((entry, index) => (
            <article key={entry.id} className="diary-entry page-card stack-xs">
              <span className={index % 2 === 0 ? 'badge peach' : 'badge sage'}>{entry.date}</span>
              {entry.photo ? <img className="diary-image" src={entry.photo} alt={entry.note} /> : null}
              <div className="inline-row">
                <h3>{entry.note || t('今天的小变化')}</h3>
                {index === 0 ? (
                  <span className="milestone-sticker" aria-hidden="true">
                    <span className="material-symbols-outlined">star</span>
                  </span>
                ) : null}
              </div>
              <p className="muted">{t('这段温馨时光已保存在家庭成长花园里。')}</p>
            </article>
          ))
        )}
      </section>
    </section>
  )
}
