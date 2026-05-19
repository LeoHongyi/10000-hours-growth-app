import { ChangeEvent, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppContext } from './AppProvider'
import { usePreferences } from './preferences'

const tabs = [
  { to: '/', label: '首页', icon: 'home', end: true },
  { to: '/goals', label: '目标', icon: 'analytics' },
  { to: '/records', label: '记录', icon: 'edit_note' },
  { to: '/diary', label: '日记', icon: 'auto_stories' },
]

export function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const app = useAppContext()
  const { language, setLanguage, setTheme, t, theme } = usePreferences()

  const runSettingsAction = async (action: () => Promise<void>, successMessage: string, errorMessage: string) => {
    setSettingsMessage(null)

    try {
      await action()
      setSettingsMessage({ tone: 'success', text: successMessage })
    } catch {
      setSettingsMessage({ tone: 'error', text: errorMessage })
    }
  }

  const handleExport = () => {
    void runSettingsAction(
      async () => {
        const backup = await app.exportBackup()
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `warm-growth-backup-${backup.exportedAt.slice(0, 10)}.json`
        document.body.append(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      },
      t('备份已下载。'),
      t('备份失败，请稍后再试。'),
    )
  }

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    void runSettingsAction(
      () => app.importBackup(file),
      t('备份已恢复。'),
      t('恢复失败，请选择有效的备份文件。'),
    )
  }

  const handleClearData = () => {
    if (!window.confirm(t('清空后无法恢复。请先导出备份，确定继续吗？'))) {
      return
    }

    void runSettingsAction(
      app.clearAllData,
      t('本地数据已清空。'),
      t('清空失败，请稍后再试。'),
    )
  }

  return (
    <div className="app-shell">
      <header className="top-app-bar">
        <div className="top-app-bar-inner">
          <div className="brand-cluster">
            <div className="profile-orb" aria-hidden="true">
              10k
            </div>
            <div className="brand-copy">
              <p className="brand-title">{t('温暖成长记录')}</p>
              <p className="brand-subtitle">{t('轻松照看每一点进步')}</p>
            </div>
          </div>
          <button className="icon-button" type="button" aria-label={t('设置')} onClick={() => setSettingsOpen(true)}>
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <nav className="tab-bar" aria-label="主导航">
        <div className="tab-bar-inner">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="tab-label">{t(tab.label)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {settingsOpen ? (
        <div className="settings-scrim" role="presentation" onClick={() => setSettingsOpen(false)}>
          <section
            className="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t('设置')}</p>
                <h2 id="settings-title">{t('偏好设置')}</h2>
              </div>
              <button className="icon-button" type="button" aria-label={t('关闭设置')} onClick={() => setSettingsOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="settings-group">
              <p className="mini-label">{t('外观')}</p>
              <div className="segmented-control" role="group" aria-label={t('外观')}>
                <button
                  className={theme === 'light' ? 'segment-button active' : 'segment-button'}
                  type="button"
                  onClick={() => setTheme('light')}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    light_mode
                  </span>
                  {t('明亮模式')}
                </button>
                <button
                  className={theme === 'dark' ? 'segment-button active' : 'segment-button'}
                  type="button"
                  onClick={() => setTheme('dark')}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    dark_mode
                  </span>
                  {t('暗色模式')}
                </button>
              </div>
            </div>

            <div className="settings-group">
              <p className="mini-label">{t('语言')}</p>
              <div className="segmented-control" role="group" aria-label={t('语言')}>
                <button
                  className={language === 'zh' ? 'segment-button active' : 'segment-button'}
                  type="button"
                  onClick={() => setLanguage('zh')}
                >
                  {t('中文')}
                </button>
                <button
                  className={language === 'en' ? 'segment-button active' : 'segment-button'}
                  type="button"
                  onClick={() => setLanguage('en')}
                >
                  {t('英文')}
                </button>
              </div>
            </div>

            <div className="settings-group">
              <p className="mini-label">{t('数据与隐私')}</p>
              <div className="settings-actions">
                <button className="secondary-button" type="button" onClick={handleExport}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    download
                  </span>
                  {t('导出备份')}
                </button>
                <button className="secondary-button" type="button" onClick={() => fileInputRef.current?.click()}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    upload_file
                  </span>
                  {t('导入恢复')}
                </button>
                <button className="secondary-button danger" type="button" onClick={handleClearData}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    delete
                  </span>
                  {t('清空本地数据')}
                </button>
              </div>
              <input
                ref={fileInputRef}
                className="visually-hidden"
                type="file"
                accept="application/json,.json"
                onChange={handleImport}
              />
            </div>

            <div className="privacy-note">
              <p className="mini-label">{t('隐私说明')}</p>
              <p>{t('当前版本的数据只保存在这台设备的浏览器里，不会上传到服务器。')}</p>
              <p>{t('请定期导出备份；清理浏览器数据、换设备或换浏览器可能导致记录丢失。')}</p>
              <Link className="inline-link" to="/privacy" onClick={() => setSettingsOpen(false)}>
                {t('查看完整隐私政策')}
              </Link>
            </div>

            {settingsMessage ? (
              <p className={settingsMessage.tone === 'error' ? 'settings-message error' : 'settings-message'}>
                {settingsMessage.text}
              </p>
            ) : null}

            <p className="muted">{t('当前设置会自动保存到这台设备。')}</p>
          </section>
        </div>
      ) : null}
    </div>
  )
}
