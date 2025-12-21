import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    if (!message) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type] || 'bg-blue-500';

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[type] || 'ℹ';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fadeInUp">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}>
        <span className="text-lg font-bold">{icon}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
