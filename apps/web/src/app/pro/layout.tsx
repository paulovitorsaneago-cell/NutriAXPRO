'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { section: 'Principal' },
  { href: '/pro/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/pro/patients', icon: '👥', label: 'Pacientes' },
  { section: 'Clínico' },
  { href: '/pro/prescriptions', icon: '📋', label: 'Prescrições' },
  { href: '/pro/ai-copilot', icon: '🤖', label: 'AI Copilot', badge: 'IA' },
  { href: '/pro/food-database', icon: '🍎', label: 'Alimentos' },
  { section: 'Análise' },
  { href: '/pro/exams', icon: '🔬', label: 'Exames' },
  { href: '/pro/evolution', icon: '📈', label: 'Evolução' },
];

export default function ProLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="layout-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/pro/dashboard" className="sidebar-logo">
            <div className="logo-icon">N</div>
            <span className="logo-text">NutriAX Pro</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ('section' in item && item.section) {
              return (
                <div key={`section-${i}`} className="sidebar-section-label">
                  {item.section}
                </div>
              );
            }

            if ('href' in item) {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="badge badge-accent" style={{ marginLeft: 'auto', fontSize: '10px' }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            return null;
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none' }}>
            <span className="nav-icon">🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
