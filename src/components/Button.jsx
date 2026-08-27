import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Button({ children, to, variant = 'primary', disabled = false, className = '', ...props }) {
  const classes = `button button-${variant} ${disabled ? 'button-disabled' : ''} ${className}`
  const content = <>{disabled && <LockKeyhole size={15} />}{children}{!disabled && variant === 'primary' && <ArrowRight size={16} />}</>
  if (to && !disabled) return <Link className={classes} to={to}>{content}</Link>
  return <button className={classes} disabled={disabled} {...props}>{content}</button>
}