import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  playerName?: string;
  className?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  icon,
  playerName,
  className = '' 
}: StatsCardProps) => {
  return (
    <div className={`bg-dark-300 rounded-lg p-6 shadow-lg ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-neutral-400 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          
          {playerName && (
            <div className="mt-2 text-xs">
              <span className="text-neutral-500">Achieved by </span>
              <span className="text-primary-500 font-mono">{playerName}</span>
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-md bg-dark-200">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;