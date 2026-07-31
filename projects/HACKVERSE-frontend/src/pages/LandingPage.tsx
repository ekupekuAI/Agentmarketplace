import { useMemo } from 'react'
import { AgentCard } from '../components/AgentCard'
import { Link } from '../components/Link'
import { SectionHeading } from '../components/SectionHeading'
import { getPublishedAgents } from '../services/workspace/localWorkspace'

const trustPoints = [
  { icon: '◆', title: 'Trusted by design', body: 'Transparent ratings, verified creators, and reputation you can inspect.' },
  { icon: '◌', title: 'Pay only for value', body: 'Simple per-run pricing with a TestNet-ready Algorand payment layer.' },
  { icon: '⌁', title: 'Built to perform', body: 'Focused agents that turn everyday tasks into clear, useful outcomes.' },
]

export function LandingPage() {
  const featuredAgents = useMemo(() => getPublishedAgents().filter((agent) => agent.featured).slice(0, 3), [])
  return <><section className="hero-section"><div className="hero-copy"><p className="eyebrow hero-eyebrow">THE AI AGENT MARKETPLACE</p><h1>Find the agent that <span>moves work forward.</span></h1><p className="hero-lede">Discover specialized AI agents from trusted creators. Run them in seconds, pay transparently, and build with confidence.</p><div className="hero-actions"><Link className="button" to="/marketplace">Explore agents <span>→</span></Link><Link className="button button-ghost" to="/#how-it-works">How it works</Link></div><div className="hero-proof"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i><i>+</i></span><span>Join <strong>4,000+</strong> builders finding better ways to work.</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-dot dot-one"/><div className="orbit-dot dot-two"/><div className="hero-core"><span>✦</span><small>AGENTVERSE</small></div><div className="float-card card-research"><b>Research Assistant</b><span>Insights ready</span></div><div className="float-card card-score"><strong>94</strong><span>ATS score</span></div><div className="float-card card-guard"><span>✓</span> Prompt safe</div></div></section><section className="trust-strip" id="how-it-works">{trustPoints.map((point) => <div key={point.title}><span className="trust-icon">{point.icon}</span><div><h3>{point.title}</h3><p>{point.body}</p></div></div>)}</section><section className="content-section"><SectionHeading eyebrow="CURATED FOR IMPACT" title="Featured agents"><Link to="/marketplace" className="view-all">View all agents →</Link></SectionHeading><div className="agent-grid">{featuredAgents.map((agent) => <AgentCard key={agent.id} agent={agent}/>)}</div></section><section className="creator-banner"><div><p className="eyebrow">FOR AGENT BUILDERS</p><h2>Turn your expertise into an agent people trust.</h2><p>Publish, measure, and grow your AI agent on a marketplace designed for serious creators.</p><Link to="/creator" className="button button-light">Start building <span>→</span></Link></div><div className="creator-stat"><strong>New creator?</strong><span>Ship your first agent with a clear profile, transparent pricing, and a home for your reputation.</span></div></section></>
}
