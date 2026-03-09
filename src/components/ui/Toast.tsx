import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const Icon = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}

const Colors = {
  success: 'bg-green-500/10 border-green-500/30 text-green-300',
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}: ToastProps) {
  const IconComponent = Icon[type]

  useEffect(() => {
    if (!duration) return
    
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div className={`
      border rounded-lg p-4
      flex items-start gap-3
      animation-in
      ${Colors[type]}
    `}>
      <IconComponent size={20} className="flex-shrink-0 mt-0.5" />
      
      <div className="flex-1">
        <p className="font-semibold text-white">{title}</p>
        {message && <p className="text-sm mt-1">{message}</p>}
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-70 transition"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export function ToastContainer({
  toasts,
  onClose
}: {
  toasts: ToastProps[]
  onClose: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}
