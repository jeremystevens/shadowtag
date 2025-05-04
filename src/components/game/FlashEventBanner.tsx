import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Zap, Clock } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';

const FlashEventBanner = () => {
  const { currentEvent } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  useEffect(() => {
    if (!currentEvent) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(currentEvent.endsAt);
      const diff = Math.max(0, differenceInSeconds(end, now));
      
      setTimeLeft(diff);
      
      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentEvent]);
  
  if (!currentEvent) return null;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getEventDetails = () => {
    switch (currentEvent.type) {
      case 'double_tag':
        return {
          title: 'Double Tag Hour!',
          description: 'All tags are worth double points!',
          color: 'text-success bg-success/20 border-success/30',
        };
      case 'silent_mode':
        return {
          title: 'Silent Mode',
          description: 'Player radar is disabled - trust no one!',
          color: 'text-warning bg-warning/20 border-warning/30',
        };
      case 'tag_reversal':
        return {
          title: 'Tag Reversal',
          description: 'The last person tagged becomes "It" again!',
          color: 'text-error bg-error/20 border-error/30',
        };
      default:
        return {
          title: 'Flash Event',
          description: 'Something unexpected is happening!',
          color: 'text-primary-500 bg-primary-500/20 border-primary-500/30',
        };
    }
  };
  
  const details = getEventDetails();
  
  return (
    <div className={`p-4 rounded-lg border animate-pulse mb-4 ${details.color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <h3 className="font-bold">{details.title}</h3>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>
      <p className="text-sm opacity-90">{details.description}</p>
    </div>
  );
};

export default FlashEventBanner;