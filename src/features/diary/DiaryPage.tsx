import { FormEvent, useState } from 'react'
import type { DiaryEntry } from '../../domain/types'

type DiaryPageProps = {
  entries: DiaryEntry[]
  onCreateEntry: (input: { date: string; photo?: File; note: string }) => Promise<void> | void
}

const today = () => new Date().toISOString().slice(0, 10)

export function DiaryPage({ entries, onCreateEntry }: DiaryPageProps) {
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<File | undefined>()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onCreateEntry({ date, note: note.trim(), photo })
    setNote('')
    setPhoto(undefined)
  }

  return (
    <section className="stack-md">
      <form className="page-card stack-md" onSubmit={handleSubmit}>
        <h1>家庭日记</h1>
        <label className="stack-xs">
          <span>日期</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="stack-xs">
          <span>照片</span>
          <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0])} />
        </label>
        <label className="stack-xs">
          <span>一句话</span>
          <textarea
            aria-label="一句话"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：今天第一次自己拍手了。"
          />
        </label>
        <button className="primary-button" type="submit">
          保存成长记录
        </button>
      </form>

      <section className="stack-md">
        {entries.map((entry) => (
          <article key={entry.id} className="page-card stack-xs">
            <strong>{entry.date}</strong>
            {entry.photo ? <img className="diary-image" src={entry.photo} alt={entry.note} /> : null}
            <p>{entry.note}</p>
          </article>
        ))}
      </section>
    </section>
  )
}
