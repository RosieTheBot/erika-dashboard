import { useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (title: string, options?: {
      type?: ToastType
      message?: string
      duration?: number
    }) => {
      const id = Math.random().toString(36).substr(2, 9)
      const toast: Toast = {
        id,
        type: options?.type || 'info',
        title,
        message: options?.message,
        duration: options?.duration ?? 5000
      }

      setToasts((prev) => [...prev, toast])
      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (title: string, message?: string) =>
      addToast(title, { type: 'success', message }),
    [addToast]
  )

  const error = useCallback(
    (title: string, message?: string) =>
      addToast(title, { type: 'error', message }),
    [addToast]
  )

  const info = useCallback(
    (title: string, message?: string) =>
      addToast(title, { type: 'info', message }),
    [addToast]
  )

  const warning = useCallback(
    (title: string, message?: string) =>
      addToast(title, { type: 'warning', message }),
    [addToast]
  )

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
