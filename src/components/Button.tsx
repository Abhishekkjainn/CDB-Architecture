import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'solid' | 'outline' | 'text'

const styles: Record<Variant, string> = {
  solid:
    'bg-ink text-paper hover:bg-ink-soft px-7 py-4 border border-ink',
  outline:
    'border border-line text-ink hover:border-ink px-7 py-4',
  text: 'text-ink underline-offset-[6px] hover:underline px-0 py-1',
}

type Props = {
  children: ReactNode
  href: string
  variant?: Variant
  className?: string
  /** Renders a trailing arrow that slides on hover. */
  arrow?: boolean
}

/** Internal routes use the router; anything with a scheme opens normally. */
export function Button({
  children,
  href,
  variant = 'solid',
  className,
  arrow = true,
}: Props) {
  const external = /^(https?:|mailto:|tel:)/.test(href)
  const classes = cn(
    'group inline-flex items-center gap-3 label transition-colors duration-300',
    styles[variant],
    className,
  )

  const inner = (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
        >
          &#8594;
        </span>
      )}
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith('http') && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link to={href} className={classes}>
      {inner}
    </Link>
  )
}
