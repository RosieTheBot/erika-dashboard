import React from 'react'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`
        bg-primary-700/40 
        animate-pulse 
        rounded-lg 
        ${className}
      `}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b border-primary-700">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      
      {/* Rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-1/4 rounded" />
          <Skeleton className="h-10 w-1/4 rounded" />
          <Skeleton className="h-10 w-1/4 rounded" />
          <Skeleton className="h-10 w-1/6 rounded" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-primary-800 border border-primary-700 rounded-lg p-4">
          <Skeleton className="h-3 w-3/4 mb-2" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      ))}
    </div>
  )
}
