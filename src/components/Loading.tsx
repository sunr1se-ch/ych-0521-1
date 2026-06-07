import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
      <p className="mt-4 text-ink-600 text-sm">加载中...</p>
    </div>
  );
}
