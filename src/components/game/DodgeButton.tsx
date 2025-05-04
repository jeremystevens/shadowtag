import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { differenceInSeconds } from 'date-fns';

interface DodgeButtonProps {
  targetId: string;
  onSuccess?: () => void;
  className?: string;
}

const DodgeButton = ({ targetId, onSuccess, className = '' }: DodgeButtonProps) => {
  const { currentPlayer, dodgePlayer } = useGameStore();
  const [isDodging, setIsDodging] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  
  useEffect(() => {
    if (!currentPlayer?.lastDodgeAt) return;
    
    const interval = setInterval(() => {
      const seconds = differenceInSeconds(
        new Date(currentPlayer.lastDodgeAt!).getTime() + (8 * 60 * 60 * 1000), // 8 hours
        new Date()
      );
      
      if (seconds <= 0) {
        setCooldownSeconds(0);
        clearInterval(interval);
      } else {
        setCooldownSeconds(seconds);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentPlayer?.lastDodgeAt]);
  
  const handleDodge = async () => {
    if (!currentPlayer || cooldownSeconds > 0) return;
    
    setIsDodging(true);
    const success = await dodgePlayer(targetId);
    setIsDodging(false);
    
    if (success && onSuccess) {
      onSuccess();
    }
  };
  
  const formatCooldown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <button
      onClick={handleDodge}
      disabled={isDodging || cooldownSeconds > 0}
      className={`
        relative overflow-hidden
        ${cooldownSeconds > 0 ? 'bg-neutral-700' : 'bg-primary-600 hover:bg-primary-700'}
        disabled:bg-neutral-600
        text-white
        font-bold
        py-4
        px-8
        rounded-lg
        shadow-lg
        transition-transform
        transform
        hover:scale-105
        active:scale-95
        flex
        items-center
        justify-center
        gap-2
        ${className}
      `}
    >
      <Shield className="w-5 h-5" />
      {isDodging ? (
        <div className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Dodging...</span>
        </div>
      ) : cooldownSeconds > 0 ? (
        <span>Dodge Ready in {formatCooldown(cooldownSeconds)}</span>
      ) : (
        <span>Dodge!</span>
      )}
    </button>
  );
};

export default DodgeButton;