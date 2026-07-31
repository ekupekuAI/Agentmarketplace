import type { AnchorHTMLAttributes, PropsWithChildren } from 'react'
import { navigate } from '../router/routes'

type LinkProps = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>> & { to: string }
export function Link({ to, children, onClick, ...props }: LinkProps) {
  return <a href={to} {...props} onClick={(event) => { onClick?.(event); if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || to.startsWith('/#')) return; event.preventDefault(); navigate(to) }}>{children}</a>
}
