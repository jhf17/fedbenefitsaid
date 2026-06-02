import { Link } from 'react-router-dom'

/**
 * FMA UI kit button — one reusable, designer-grade button with real
 * hover / focus / active(press) states (defined in fma-ui.css, built to the
 * Impeccable + Emil Kowalski bar). Renders a router <Link> (to), an <a> (href),
 * or a <button> (onClick).
 *
 *   <Button to="/consultation" variant="primary" arrow>Book a free consultation</Button>
 *
 * variant: 'primary' (maroon) | 'ghost' (on dark) | 'secondary' (navy outline on light)
 * size:    'sm' | undefined (md) | 'lg'
 * arrow:   appends an animated trailing → that slides on hover
 */
export default function Button({
  to,
  href,
  onClick,
  type,
  variant = 'primary',
  size,
  arrow = false,
  children,
  className = '',
  ...rest
}) {
  const cls = [
    'fma-btn',
    `fma-btn-${variant}`,
    size === 'lg' ? 'fma-btn-lg' : size === 'sm' ? 'fma-btn-sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      {children}
      {arrow && <span className="fma-btn-arrow" aria-hidden>→</span>}
    </>
  )

  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>
  return <button type={type || 'button'} className={cls} onClick={onClick} {...rest}>{inner}</button>
}
