import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/', label: '首页', end: true },
  { to: '/goals', label: '目标' },
  { to: '/records', label: '记录' },
  { to: '/plans', label: '计划' },
  { to: '/diary', label: '家庭日记' },
]

export function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-content">
        <Outlet />
      </main>

      <nav className="tab-bar" aria-label="主导航">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
