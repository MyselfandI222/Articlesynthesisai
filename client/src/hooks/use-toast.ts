import { useState, useCallback } from "react";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface Toast extends ToastProps {
  id: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...props, id };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 5000);
    
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return { toast, toasts, dismiss };
};