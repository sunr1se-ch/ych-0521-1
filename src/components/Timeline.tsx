import { Calendar, Ruler, TrendingUp, AlertTriangle } from 'lucide-react';
import type { PastingRecord } from '@shared/types';
import { formatDate } from '../utils/date';

interface TimelineProps {
  records: PastingRecord[];
}

export default function Timeline({ records }: TimelineProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-ink-600">
        <Ruler className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>暂无裱糊记录</p>
      </div>
    );
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.pastingDate).getTime() - new Date(a.pastingDate).getTime(),
  );

  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-gold-400 via-paper-300 to-paper-200" />

      {sortedRecords.map((record, index) => (
        <div
          key={record.id}
          className={`relative pb-8 last:pb-0 animate-fade-in-up animation-delay-${(index % 6) * 80}`}
        >
          <div
            className={`absolute -left-5 top-0 w-4 h-4 rounded-full border-2 ${
              record.isStagnantTrigger
                ? 'bg-cinnabar-600 border-cinnabar-600 animate-pulse-red'
                : 'bg-paper-50 border-bamboo-600'
            } transition-all duration-300`}
          />

          <div
            className={`card p-4 ${
              record.isStagnantTrigger ? 'border-cinnabar-200 bg-cinnabar-50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-500" />
                <span className="font-semibold text-ink-700">
                  {formatDate(record.pastingDate)}
                </span>
                <span className="text-xs text-ink-600 opacity-70">
                  第 {sortedRecords.length - index} 次裱糊
                </span>
              </div>
              {record.isStagnantTrigger && (
                <div className="status-stagnant">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  触发停滞
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-ink-600">
                <Ruler className="w-4 h-4 text-bamboo-600" />
                <span>起皱长度：</span>
                <span className="font-medium text-ink-700">
                  {record.wrinkleLength} cm
                </span>
              </div>
              {record.intervalDays !== null && (
                <div className="flex items-center gap-2 text-ink-600">
                  <TrendingUp className="w-4 h-4 text-gold-500" />
                  <span>距上次：</span>
                  <span className="font-medium text-ink-700">
                    {record.intervalDays} 天
                  </span>
                </div>
              )}
              {record.wrinkleIncrease !== null && (
                <div className="col-span-2 flex items-center gap-2 text-ink-600">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      record.wrinkleIncrease >= 3 ? 'text-cinnabar-600' : 'text-bamboo-600'
                    }`}
                  />
                  <span>起皱增加：</span>
                  <span
                    className={`font-medium ${
                      record.wrinkleIncrease >= 3 ? 'text-cinnabar-600' : 'text-ink-700'
                    }`}
                  >
                    {record.wrinkleIncrease > 0 ? '+' : ''}
                    {record.wrinkleIncrease} cm
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
