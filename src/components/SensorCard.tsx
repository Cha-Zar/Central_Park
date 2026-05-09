'use client';

interface SensorCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit?: string;
  color?: string;
}

export function SensorCard({ icon, title, value, unit, color = 'blue' }: SensorCardProps) {
  const colorClasses = {
    blue: 'from-sky-950/70 to-stone-900/40 border-sky-700/60',
    green: 'from-emerald-950/60 to-stone-900/40 border-emerald-700/60',
    orange: 'from-amber-950/65 to-stone-900/40 border-amber-700/70',
    purple: 'from-indigo-950/60 to-stone-900/40 border-indigo-700/60',
  };

  return (
    <div className={`card bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} p-6 transition-transform duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-stone-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-stone-50">
            {value}
            {unit && <span className="text-xl text-stone-400 ml-2">{unit}</span>}
          </p>
        </div>
        <div className="text-amber-300/70 flex-shrink-0">{icon}</div>
      </div>
    </div>
  );
}
