export const routes = {
  home: '/',
  marketplace: '/marketplace',
  dashboard: '/dashboard',
  profile: '/profile',
  creator: '/creator',
  transactions: '/transactions',
  settings: '/settings',
} as const

export type RoutePath = (typeof routes)[keyof typeof routes]

export function navigate(to: string) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}
