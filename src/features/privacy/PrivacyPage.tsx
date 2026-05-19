import { NavLink } from 'react-router-dom'
import { usePreferences } from '../../app/preferences'

export function PrivacyPage() {
  const { t } = usePreferences()

  return (
    <section className="page-stack">
      <div className="hero-card journal-texture">
        <p className="eyebrow">{t('数据与隐私')}</p>
        <h1>{t('隐私政策')}</h1>
        <p>{t('这份说明解释当前版本如何保存、备份和删除你的家庭成长记录。')}</p>
      </div>

      <div className="page-card content-card">
        <h2>{t('我们保存什么')}</h2>
        <p>{t('应用会在本机浏览器中保存家庭成员、目标、任务、专注记录、计划、里程碑和日记照片。')}</p>
      </div>

      <div className="page-card content-card">
        <h2>{t('数据保存在哪里')}</h2>
        <p>{t('当前版本没有账号和服务器同步。主要记录保存在 IndexedDB，偏好设置和当前计时状态保存在 localStorage。')}</p>
      </div>

      <div className="page-card content-card">
        <h2>{t('备份与恢复')}</h2>
        <p>{t('你可以在设置中导出 JSON 备份文件，也可以导入备份恢复到当前设备。请妥善保管备份文件。')}</p>
      </div>

      <div className="page-card content-card">
        <h2>{t('删除数据')}</h2>
        <p>{t('你可以在设置中清空本地数据。清空浏览器数据、换设备或换浏览器也可能删除这些记录。')}</p>
      </div>

      <div className="page-card content-card">
        <h2>{t('第三方服务')}</h2>
        <p>{t('应用托管在 Cloudflare Pages。当前版本不会把你的日记、照片或学习记录上传到应用服务器。')}</p>
      </div>

      <NavLink className="secondary-button" to="/">
        <span className="material-symbols-outlined" aria-hidden="true">
          arrow_back
        </span>
        {t('返回首页')}
      </NavLink>
    </section>
  )
}
