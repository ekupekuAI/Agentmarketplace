import { useDeferredValue, useMemo, useState } from 'react'
import { AgentCard } from '../components/AgentCard'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingGrid } from '../components/feedback/LoadingGrid'
import { getCategories, getPublishedAgents } from '../services/workspace/localWorkspace'
import type { AgentCategory } from '../types/agent'

const pageSize = 6
const categoryLabel = (category: string) => category === 'All agents' ? 'Explore agents' : `${category} agents`

export function MarketplacePage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All agents')
  const [sort, setSort] = useState('Featured')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const deferredQuery = useDeferredValue(query)
  const agents = useMemo(getPublishedAgents, [])
  const categories = useMemo(getCategories, [])
  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    return [...agents].filter((agent) => (
      category === 'All agents' || agent.category === category as AgentCategory
    ) && [agent.name, agent.description, agent.category, agent.creator, ...(agent.tags ?? [])].some((value) => value.toLowerCase().includes(normalizedQuery))).sort((a, b) => sort === 'Highest rated' ? b.rating - a.rating : sort === 'Most used' ? Number.parseFloat(b.usageCount) - Number.parseFloat(a.usageCount) : sort === 'Lowest price' ? Number.parseFloat(a.price) - Number.parseFloat(b.price) : sort === 'Newest' ? b.createdAt.localeCompare(a.createdAt) : Number(b.featured) - Number(a.featured))
  }, [agents, category, deferredQuery, sort])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const changeCategory = (next: string) => {
    setLoading(true)
    setCategory(next)
    setPage(1)
    window.setTimeout(() => setLoading(false), 220)
  }

  return <><section className="marketplace-hero"><p className="eyebrow">THE MARKETPLACE</p><h1>One place for agents that deliver.</h1><p>Explore reliable tools for career moves, research, secure prompting, and better code.</p><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search agents, creators, categories, tags" aria-label="Search agents"/></label></section><section className="marketplace-content"><div className="filter-row"><div className="category-tabs" role="group" aria-label="Filter agents by category">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => changeCategory(item)}>{item}</button>)}</div><label className="sort-select">Sort: <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }}><option>Featured</option><option>Newest</option><option>Highest rated</option><option>Most used</option><option>Lowest price</option></select></label></div><div className="marketplace-heading"><div><h2>{categoryLabel(category)}</h2><p aria-live="polite">{filtered.length} trusted agents ready to run</p></div><span className="results-note">Verified creators <i>✓</i></span></div>{loading ? <LoadingGrid count={3}/> : visible.length ? <><div className="agent-grid">{visible.map((agent) => <AgentCard key={agent.id} agent={agent}/>)}</div><div className="pagination"><button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button><span>Page {currentPage} of {totalPages}</span><button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button></div></> : <EmptyState title="No agents found" description="Try a different search term or remove a category filter."/>}</section></>
}
