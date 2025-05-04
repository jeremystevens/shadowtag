import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Shield, MapPin, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const MindGamesControls = () => {
  const { currentPlayer, nearbyPlayers, fakeDodge, baitPing } = useGameStore();
  const [isFakeDodging, setIsFakeDodging] = useState(false);
  const [isBaitPinging, setIsBaitPinging] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  
  if (!currentPlayer) return null;
  
  const handleFakeDodge = async () => {
    if (!selectedTarget) return;
    
    setIsFakeDodging(true);
    try {
      await fakeDodge(selectedTarget);
      setSelectedTarget(null);
    } finally {
      setIsFakeDodging(false);
    }
  };
  
  const handleBaitPing = async () => {
    setIsBaitPinging(true);
    try {
      // Create a slightly offset location from current position
      const offset = (Math.random() - 0.5) * 0.001; // ~100m radius
      const location = {
        lat: (currentPlayer.location?.lat || 0) + offset,
        lng: (currentPlayer.location?.lng || 0) + offset,
      };
      await baitPing(location);
    } finally {
      setIsBaitPinging(false);
    }
  };
  
  return (
    <div className="bg-dark-200 p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
          Mind Games
        </h3>
        <AlertTriangle className="h-5 w-5 text-warning" />
      </div>
      
      <div className="space-y-6">
        {/* Fake Dodge */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary-500" />
            <span className="text-sm text-white">Fake Dodge</span>
          </div>
          
          {nearbyPlayers.length > 0 ? (
            <>
              <p className="text-xs text-neutral-400 mb-3">
                Select a target and perform a fake dodge animation to trick them!
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {nearbyPlayers.map(player => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedTarget(player.id)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        selectedTarget === player.id
                          ? 'bg-primary-500/20 border-2 border-primary-500'
                          : 'bg-dark-300 border-2 border-transparent hover:border-primary-500/50'
                      }`}
                    >
                      <div className="font-medium text-white">
                        {player.codename}
                      </div>
                      <div className="text-xs text-neutral-400">
                        Click to select
                      </div>
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="primary"
                  onClick={handleFakeDodge}
                  isLoading={isFakeDodging}
                  disabled={!selectedTarget || isFakeDodging}
                  fullWidth
                >
                  Fake Dodge {selectedTarget && `${nearbyPlayers.find(p => p.id === selectedTarget)?.codename}`}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-3 bg-dark-300 rounded-lg">
              <p className="text-sm text-neutral-400">
                No players nearby to fake dodge
              </p>
            </div>
          )}
        </div>
        
        {/* Bait Ping */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-secondary-500" />
            <span className="text-sm text-white">Bait Ping</span>
          </div>
          <p className="text-xs text-neutral-400 mb-3">
            Create a false location ping to bait other players.
          </p>
          <Button
            variant="secondary"
            onClick={handleBaitPing}
            isLoading={isBaitPinging}
            disabled={isBaitPinging}
            fullWidth
          >
            Create Bait Ping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MindGamesControls;