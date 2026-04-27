import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

function ToastIcon({ type }) {
  if (type === 'success') return <CheckCircle2 size={18} className="text-success" />;
  if (type === 'warning') return <AlertTriangle size={18} className="text-warning" />;
  if (type === 'error') return <XCircle size={18} className="text-danger" />;
  return <Info size={18} className="text-accent-primary" />;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const t = timersRef.current.get(id);
    if (t) clearTimeout(t);
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    ({ title, message, type = 'info', durationMs = 3500 }) => {
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const toast = { id, title, message, type };
      setToasts((prev) => [toast, ...prev].slice(0, 4));

      const t = setTimeout(() => dismiss(id), durationMs);
      timersRef.current.set(id, t);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-[5000] right-4 left-4 md:left-auto md:right-6 bottom-24 md:bottom-6 pointer-events-none">
        <div className="md:w-[380px] md:max-w-[380px] ml-auto flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="pointer-events-auto glass-panel rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <ToastIcon type={t.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    {t.title && (
                      <p className="text-sm font-bold text-text-primary leading-snug truncate">
                        {t.title}
                      </p>
                    )}
                    {t.message && (
                      <p className="text-[0.9rem] text-text-secondary leading-snug mt-1">
                        {t.message}
                      </p>
                    )}
                  </div>
                  <button
                    className="w-8 h-8 rounded-full bg-white/5 border border-glass-border text-text-primary inline-flex items-center justify-center hover:bg-white/10 transition-all"
                    onClick={() => dismiss(t.id)}
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

