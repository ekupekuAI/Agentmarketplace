import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { error: Error | null }

/** Contains unexpected rendering failures without exposing implementation details to users. */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return { error } }

  private retry = () => this.setState({ error: null })

  render(): ReactNode {
    if (this.state.error) {
      return <main className="feedback-page" role="alert"><p className="eyebrow">SOMETHING WENT WRONG</p><h1>We couldn’t load AgentVerse.</h1><p>Please try again. If the problem continues, return to the marketplace and start over.</p><div className="feedback-actions"><button className="button" onClick={this.retry}>Try again</button><a className="button button-ghost" href="/marketplace">Open marketplace</a></div></main>
    }
    return this.props.children
  }
}

export default ErrorBoundary
