import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  highlighted?: boolean
  hoverable?: boolean
}

export function Card({
  children,
  className = '',
  highlighted = false,
  hoverable = false
}: CardProps) {
  return (
    <div
      className={`
        bg-primary-800/50
        border
        ${highlighted ? 'border-primary-600' : 'border-primary-700'}
        rounded-lg
        p-6
        ${hoverable ? 'hover:border-primary-600 hover:shadow-lg transition' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`pb-4 border-b border-primary-700 mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

export function CardFooter({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`pt-4 border-t border-primary-700 mt-4 flex gap-2 ${className}`}>
      {children}
    </div>
  )
}
