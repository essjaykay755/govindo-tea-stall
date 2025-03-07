"use client"

import * as React from "react"

const TOAST_REMOVE_DELAY = 1000

type ToastActionElement = React.ReactElement<{
  altText: string
}>

type ToastProps = {
  id?: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
  duration?: number
}

type ToasterToast = ToastProps & {
  id: string
  open: boolean
  duration: number
}

type ToastContextType = {
  toasts: ToasterToast[]
  addToast: (toast: ToastProps) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return {
    toast: context.addToast,
    dismiss: context.removeToast,
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const addToast = React.useCallback((toast: ToastProps) => {
    const id = toast.id || crypto.randomUUID()
    const duration = toast.duration || 5000;

    setToasts((prev) => [
      ...prev,
      {
        ...toast,
        id,
        open: true,
        duration,
      },
    ])

    // Automatically dismiss the toast after its duration
    if (duration !== 0) { // Allow duration of 0 to disable auto-dismiss
      const timeoutId = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  open: false,
                }
              : t
          )
        )
        
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, TOAST_REMOVE_DELAY)
      }, duration);
      
      return () => clearTimeout(timeoutId);
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id
          ? {
              ...toast,
              open: false,
            }
          : toast
      )
    )

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, TOAST_REMOVE_DELAY)
  }, [])

  const contextValue = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
    }),
    [toasts, addToast, removeToast]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded border p-4 shadow-md ${
              toast.open ? "animate-enter" : "animate-leave"
            } ${
              toast.variant === "destructive" 
                ? "border-red-200 bg-red-50 text-red-800" 
                : "border-gray-200 bg-white"
            }`}
          >
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && <div className="text-sm text-muted-foreground">{toast.description}</div>}
            {toast.action && <div className="mt-2">{toast.action}</div>}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
} 