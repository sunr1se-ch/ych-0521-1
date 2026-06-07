import type { PastingRecord } from '@shared/types';

interface WrinkleChartProps {
  records: PastingRecord[];
}

export default function WrinkleChart({ records }: WrinkleChartProps) {
  if (records.length < 2) {
    return (
      <div className="text-center py-8 text-ink-600 text-sm">
        <p>至少需要 2 次记录才能显示趋势图</p>
      </div>
    );
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.pastingDate).getTime() - new Date(b.pastingDate).getTime(),
  );

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = sortedRecords.map((r) => r.wrinkleLength);
  const maxValue = Math.max(...values) * 1.2;
  const minValue = 0;

  const points = sortedRecords.map((record, index) => {
    const x = padding.left + (index / (sortedRecords.length - 1)) * chartWidth;
    const y =
      padding.top +
      chartHeight -
      ((record.wrinkleLength - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, record };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaData =
    pathData +
    ` L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <svg width={width} height={height} className="min-w-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7D8471" />
            <stop offset="100%" stopColor="#C41E3A" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C41E3A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C41E3A" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * ratio;
          const value = (maxValue - minValue) * (1 - ratio) + minValue;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#EBE3D0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#8B9080"
                fontSize="10"
              >
                {value.toFixed(1)}cm
              </text>
            </g>
          );
        })}

        <path d={areaData} fill="url(#areaGradient)" />

        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {points.map((p, i) => {
          const isStagnant = p.record.isStagnantTrigger;
          const prevIncrease =
            i > 0 ? p.record.wrinkleLength - sortedRecords[i - 1].wrinkleLength : 0;
          const isSharpIncrease = prevIncrease >= 3;

          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isStagnant ? 6 : 4}
                fill={isStagnant || isSharpIncrease ? '#C41E3A' : '#FAF7F0'}
                stroke={isStagnant || isSharpIncrease ? '#C41E3A' : '#7D8471'}
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                fill="#4A4A4A"
                fontSize="10"
              >
                {p.record.pastingDate.slice(5)}
              </text>
              <title>{`${p.record.pastingDate}: ${p.record.wrinkleLength}cm`}</title>
            </g>
          );
        })}

        <text
          x={padding.left}
          y={12}
          fill="#7D8471"
          fontSize="11"
          fontWeight="500"
        >
          起皱长度 (cm)
        </text>
      </svg>
    </div>
  );
}
