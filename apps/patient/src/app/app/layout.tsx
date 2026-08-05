'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/app/meal-plan', icon: '🍽️', label: 'Cardápio' },
  { href: '/app/food-log', icon: '✏️', label: 'Diário' },
  { href: '/app/evolution', icon: '📈', label: 'Evolução' },
  { href: '/app/profile', icon: '👤', label: 'Perfil' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {children}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname.startsWith(item.href) ? 'active' : ''}
          >
            <span className="nav-icon-emoji">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
