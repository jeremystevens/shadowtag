import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { UserCheck2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

const DisguiseControls = () => {
  const { currentPlayer, activateDisguise } = useGameStore();
  const [isDisguising, setIsDisguising] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  useEffect(() => {
    if (!currentPlayer?.disguiseUntil) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const until = new Date(currentPlayer.disguiseUntil);
      const diff = Math.max(0, Math.floor((until.getTime() - now.getTime()) / 1000));
      
      setTimeLeft(diff);
      
      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentPlayer?.disguiseUntil]);
  
  if (!currentPlayer || currentPlayer.status !== 'it') return null;
  
  const handleDisguise = async () => {
    setIsDisguising(true);
    try {
      await activateDisguise();
    } finally {
      setIsDisguising(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-dark-200 p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
          Disguise Mode
        </h3>
        <UserCheck2 className="h-5 w-5 text-accent-500" />
      </div>
      
      <p className="text-xs text-neutral-400 mb-4">
        Temporarily appear as a neutral player to deceive others.
        {currentPlayer.disguiseActive && " Your true status will be revealed when you tag someone."}
      </p>
      
      {currentPlayer.disguiseActive ? (
        <div className="space-y-3">
          <div className="p-3 bg-accent-500/20 border border-accent-500/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-accent-500 mr-2" />
              <span className="text-white">Disguise Active</span>
            </div>
            <span className="text-accent-500 font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <p className="text-xs text-neutral-500 text-center">
            You appear as neutral to other players
          </p>
        </div>
      ) : (
        <Button
          variant="accent"
          onClick={handleDisguise}
          isLoading={isDisguising}
          disabled={isDisguising}
          fullWidth
        >
          Activate Disguise (2 min)
        </Button>
      )}
    </div>
  );
};

export default DisguiseControls;