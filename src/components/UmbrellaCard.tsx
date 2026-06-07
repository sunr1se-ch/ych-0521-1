import { useNavigate } from 'react-router-dom';
import { Calendar, Ruler, Eye, AlertTriangle } from 'lucide-react';
import type { UmbrellaListItem } from '@shared/types';
import { formatDate, getStatusText, getStatusClass } from '../utils/date';

interface UmbrellaCardProps {
  umbrella: UmbrellaListItem;
  index: number;
}

export default function UmbrellaCard({ umbrella, index }: UmbrellaCardProps) {
  const navigate = useNavigate();
  const delayClass = `animation-delay-${(index % 6) * 80}` as const;

  return (
    <div
      className={`card p-5 animate-fade-in-up ${delayClass}`}
      onClick={() => navigate(`/umbrella/${umbrella.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-ink-700 font-serif tracking-wide">
            {umbrella.umbrellaNo}
          </h3>
          <div className={`mt-1 ${getStatusClass(umbrella.status)}`}>
            {umbrella.status === 'stagnant' && (
              <AlertTriangle className="w-3 h-3 mr-1" />
            )}
            {getStatusText(umbrella.status)}
          </div>
        </div>
        <button
          className="p-2 hover:bg-paper-100 rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/umbrella/${umbrella.id}`);
          }}
        >
          <Eye className="w-4 h-4 text-ink-600" />
        </button>
      </div>

      <div className="space-y-2 text-sm text-ink-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gold-500" />
          <span>计划间隔：{umbrella.plannedIntervalDays} 天</span>
        </div>
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-bamboo-600" />
          <span>裱糊次数：{umbrella.pastingCount} 次</span>
        </div>
        {umbrella.lastPastingDate && (
          <div className="flex items-center gap-2 text-xs opacity-80">
            <Calendar className="w-3.5 h-3.5" />
            <span>最近裱糊：{formatDate(umbrella.lastPastingDate)}</span>
          </div>
        )}
      </div>

      {umbrella.currentStagnation && (
        <div className="mt-4 p-3 bg-cinnabar-50 border border-cinnabar-100 rounded-lg animate-pulse-red">
          <p className="text-xs text-cinnabar-600 font-medium">
            ⚠️ 裱糊停滞：{umbrella.currentStagnation.reason.substring(0, 30)}...
          </p>
        </div>
      )}
    </div>
  );
}
