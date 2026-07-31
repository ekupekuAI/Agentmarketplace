import { Link } from '../Link'

export function NotFoundState() { return <section className="feedback-page"><p className="eyebrow">404 · PAGE NOT FOUND</p><h1>That page isn’t in this universe.</h1><p>The link may be outdated, or the page may have moved.</p><Link className="button" to="/marketplace">Explore agents <span>→</span></Link></section> }
