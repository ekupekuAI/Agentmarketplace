import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { NotFoundState } from '../components/feedback/NotFoundState'
import { AgentDetailsPage } from '../pages/AgentDetailsPage'
import { CreatorPage } from '../pages/CreatorPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ExecuteAgentPage } from '../pages/ExecuteAgentPage'
import { ExecutionHistoryPage } from '../pages/ExecutionHistoryPage'
import { LandingPage } from '../pages/LandingPage'
import { MarketplacePage } from '../pages/MarketplacePage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'

function pageFor(pathname: string) {
  if (pathname === '/') return <LandingPage />
  if (pathname === '/marketplace') return <MarketplacePage />
  if (pathname === '/dashboard') return <DashboardPage />
  if (pathname === '/creator') return <CreatorPage />
  if (pathname === '/profile') return <ProfilePage />
  if (pathname === '/transactions') return <ExecutionHistoryPage />
  if (pathname === '/settings') return <SettingsPage />
  const executeMatch = pathname.match(/^\/agents\/([^/]+)\/execute$/)
  if (executeMatch) return <ExecuteAgentPage agentId={executeMatch[1]} />
  const agentMatch = pathname.match(/^\/agents\/([^/]+)$/)
  if (agentMatch) return <AgentDetailsPage agentId={agentMatch[1]} />
  return <NotFoundState />
}

export function AppRouter() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => { const onChange = () => setPath(window.location.pathname); window.addEventListener('popstate', onChange); return () => window.removeEventListener('popstate', onChange) }, [])
  return <Layout>{pageFor(path)}</Layout>
}
