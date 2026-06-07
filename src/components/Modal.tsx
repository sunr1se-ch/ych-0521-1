import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-700 bg-opacity-50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md card p-0 animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-paper-200 bg-paper-100">
          <h2 className="text-lg font-semibold text-ink-700 font-serif">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-paper-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-ink-600" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
