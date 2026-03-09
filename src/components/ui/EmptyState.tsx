import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'info' | 'success' | 'warning'
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default'
}: EmptyStateProps) {
  const variantStyles = {
    default: 'bg-primary-800/30 border-primary-700 text-primary-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
  }

  const iconColor = {
    default: 'text-primary-600',
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400'
  }

  return (
    <div className={`border rounded-lg p-12 text-center ${variantStyles[variant]}`}>
      {Icon && (
        <Icon size={48} className={`mx-auto mb-4 ${iconColor[variant]}`} />
      )}
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm mb-6 max-w-md mx-auto">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
