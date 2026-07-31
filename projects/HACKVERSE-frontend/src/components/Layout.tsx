import { useState, type PropsWithChildren } from 'react'
import { AppLogo } from './AppLogo'
import { Link } from './Link'
import { routes } from '../router/routes'
import { WalletControl } from './blockchain/WalletControl'

const links = [{ label: 'Marketplace', to: routes.marketplace }, { label: 'How it works', to: '/#how-it-works' }, { label: 'For creators', to: routes.creator }]
export function Layout({ children }: PropsWithChildren) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="app-shell"><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="nav-wrap"><AppLogo /><button className="menu-toggle" aria-label="Toggle navigation menu" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>☰</button><nav id="primary-navigation" aria-label="Primary navigation" className={menuOpen ? 'nav-links open' : 'nav-links'}>{links.map((link) => <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}</nav><div className="nav-actions"><Link to={routes.dashboard} className="text-button">Dashboard</Link><WalletControl /></div></div></header><main id="main-content" tabIndex={-1}>{children}</main><footer className="site-footer"><AppLogo /><p>Discover and run trusted AI agents, with transparent on-chain payments.</p><div><Link to={routes.marketplace}>Marketplace</Link><Link to={routes.creator}>Creators</Link><Link to={routes.settings}>Settings</Link></div><small>© 2026 AgentVerse. Built on Algorand.</small></footer></div>
}
