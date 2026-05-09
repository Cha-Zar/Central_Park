'use client';

import { getHealthColor, getHealthLabel, getHealthBgColor } from '@/lib/utils';

interface HealthScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function HealthScore({ score, size = 'md' }: HealthScoreProps) {
  const label = getHealthLabel(score);
  const colorClass = getHealthBgColor(score);
  
  const sizes = {
    sm: { circle: 'w-12 h-12', text: 'text-lg', progress: 'h-2' },
    md: { circle: 'w-20 h-20', text: 'text-2xl', progress: 'h-3' },
    lg: { circle: 'w-32 h-32', text: 'text-5xl', progress: 'h-4' },
  };
  
  const sizeClass = sizes[size];
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg className={`${sizeClass.circle} transform -rotate-90`} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colorClass}
            style={{ transition: 'stroke-dashoffset 0.35s' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`${sizeClass.text} font-bold`}>{score}</span>
          <span className="text-xs text-gray-400">%</span>
        </div>
      </div>
      <div className={`badge ${getHealthColor(score)}`}>{label}</div>
    </div>
  );
}
