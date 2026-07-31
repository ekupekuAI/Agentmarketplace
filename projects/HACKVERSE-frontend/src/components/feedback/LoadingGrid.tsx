export function LoadingGrid({ count = 3 }: { count?: number }) {
  return <div className="loading-grid" aria-label="Loading agents" aria-busy="true">{Array.from({ length: count }, (_, index) => <div className="agent-skeleton" key={index}><span/><div><i/><i/><i/></div></div>)}</div>
}
