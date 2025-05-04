import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { useGameStore } from '../../store/gameStore';

interface CountdownTimerProps {
  className?: string;
}

const CountdownTimer = ({ className = '' }: CountdownTimerProps) => {
  const { currentPlayer } = useGameStore();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpiring, setIsExpiring] = useState(false);
  
  useEffect(() => {
    if (!currentPlayer || currentPlayer.status !== 'it' || !currentPlayer.becameItAt) {
      return;
    }
    
    const calculateTimeLeft = () => {
      const becameItAt = new Date(currentPlayer.becameItAt!);
      const expiryTime = new Date(becameItAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      const now = new Date();
      
      // If already expired
      if (now > expiryTime) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const totalSeconds = differenceInSeconds(expiryTime, now);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // Set expiring status if less than 1 hour left
      setIsExpiring(hours < 1);
      
      return { hours, minutes, seconds };
    };
    
    // Calculate initially
    setTimeLeft(calculateTimeLeft());
    
    // Set up interval
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentPlayer]);
  
  if (!currentPlayer || currentPlayer.status !== 'it') {
    return null;
  }
  
  const { hours, minutes, seconds } = timeLeft;
  
  return (
    <div className={`${className}`}>
      <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">Time left to tag</h3>
      <div className={`text-2xl font-mono font-bold ${isExpiring ? 'text-error animate-pulse' : 'text-white'}`}>
        {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default CountdownTimer;