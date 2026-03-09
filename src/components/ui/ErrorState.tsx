import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  details?: string
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  details
}: ErrorStateProps) {
  return (
    <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-8 text-center">
      <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-red-300 mb-4">{message}</p>
      
      {details && (
        <details className="mb-6 text-left bg-red-500/5 border border-red-500/20 rounded p-3">
          <summary className="cursor-pointer text-sm text-red-400 font-medium">
            Technical Details
          </summary>
          <p className="text-xs text-red-300 mt-2 font-mono whitespace-pre-wrap break-words">
            {details}
          </p>
        </details>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  )
}
