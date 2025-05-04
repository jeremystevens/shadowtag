import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { differenceInSeconds } from 'date-fns';
import Button from '../ui/Button';

const DodgeControls = () => {
  const { currentPlayer, nearbyPlayers } = useGameStore();
  const [nearbyThreat, setNearbyThreat] = useState(false);
  
  // Check for nearby "it" players
  useEffect(() => {
    const threatNearby = nearbyPlayers.some(player => player.status === 'it');
    setNearbyThreat(threatNearby);
  }, [nearbyPlayers]);
  
  if (!currentPlayer || currentPlayer.status !== 'neutral' || !nearbyThreat) {
    return null;
  }
  
  const itPlayers = nearbyPlayers.filter(p => p.status === 'it');
  
  return (
    <div className="bg-dark-200 p-4 rounded-lg mb-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-error mr-2" />
          <span className="text-error font-medium">Threat Nearby!</span>
        </div>
        <span className="text-sm text-neutral-400">
          {itPlayers.length} player{itPlayers.length !== 1 ? 's' : ''} hunting
        </span>
      </div>
      
      <p className="text-sm text-neutral-300 mb-4">
        Someone nearby is "it" - use your dodge to gain temporary immunity!
      </p>
      
      <div className="flex gap-2">
        {itPlayers.map(player => (
          <DodgeButton 
            key={player.id}
            targetId={player.id}
            className="flex-1"
          />
        ))}
      </div>
    </div>
  );
};

export default DodgeControls;