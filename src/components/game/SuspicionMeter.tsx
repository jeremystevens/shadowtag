import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface SuspicionMeterProps {
  className?: string;
}

const SuspicionMeter = ({ className = '' }: SuspicionMeterProps) => {
  const { currentPlayer, dodges } = useGameStore();
  const [suspicionLevel, setSuspicionLevel] = useState(0);
  
  useEffect(() => {
    if (!currentPlayer) return;
    
    // Calculate suspicion based on recent dodges and player behavior
    const recentDodges = dodges.filter(dodge => {
      const dodgeTime = new Date(dodge.createdAt);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return dodgeTime > fiveMinutesAgo;
    });
    
    // Calculate suspicion level (0-100)
    const level = Math.min(100, recentDodges.length * 20);
    setSuspicionLevel(level);
  }, [currentPlayer, dodges]);
  
  const getSuspicionLabel = () => {
    if (suspicionLevel < 20) return 'Low';
    if (suspicionLevel < 50) return 'Moderate';
    if (suspicionLevel < 80) return 'High';
    return 'Extreme';
  };
  
  const getSuspicionColor = () => {
    if (suspicionLevel < 20) return 'bg-success';
    if (suspicionLevel < 50) return 'bg-warning';
    if (suspicionLevel < 80) return 'bg-error';
    return 'bg-error animate-pulse';
  };
  
  return (
    <div className={`bg-dark-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-warning mr-2" />
          <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
            Area Suspicion Level
          </h3>
        </div>
        <span className="text-sm font-medium text-neutral-400">
          {getSuspicionLabel()}
        </span>
      </div>
      
      <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
        <div
          className={`h-full ${getSuspicionColor()} transition-all duration-500`}
          style={{ width: `${suspicionLevel}%` }}
        ></div>
      </div>
      
      <p className="mt-2 text-xs text-neutral-500">
        Based on recent player activity in your area
      </p>
    </div>
  );
};

export default SuspicionMeter;