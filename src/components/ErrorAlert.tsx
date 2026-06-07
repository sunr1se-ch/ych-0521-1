import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export default function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="mb-6 p-4 bg-cinnabar-50 border border-cinnabar-200 rounded-lg flex items-start gap-3 animate-fade-in">
      <AlertCircle className="w-5 h-5 text-cinnabar-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-cinnabar-600 text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-cinnabar-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-cinnabar-600" />
        </button>
      )}
    </div>
  );
}
