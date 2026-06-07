import { NavLink, Outlet } from 'react-router-dom';
import { Umbrella, AlertTriangle, CheckCircle, List } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { path: '/', label: '伞号列表', icon: List },
    { path: '/stagnation', label: '停滞待处理', icon: AlertTriangle },
    { path: '/completion', label: '完工登记', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-paper-100">
      <header className="bg-paper-50 border-b border-paper-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="container">
          <div className="flex items-center justify-between py-4 gold-line">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cinnabar-600 to-gold-500 flex items-center justify-center">
                <Umbrella className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink-700 font-serif tracking-wide">
                  油纸伞裱糊台账
                </h1>
                <p className="text-xs text-ink-600">杭州 · 传统工艺数字化管理</p>
              </div>
            </div>
          </div>

          <nav className="flex gap-1 mt-2 overflow-x-auto scrollbar-thin">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  isActive ? 'nav-tab-active' : 'nav-tab'
                }
              >
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="container py-6">
        <Outlet />
      </main>

      <footer className="mt-auto py-6 border-t border-paper-200 bg-paper-50">
        <div className="container text-center text-sm text-ink-600">
          <p className="font-serif">匠心传承 · 油纸伞制作工艺全程追溯</p>
          <p className="text-xs mt-1 opacity-60">© 2026 杭州油纸伞作坊</p>
        </div>
      </footer>
    </div>
  );
}
