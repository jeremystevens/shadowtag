import { useState, useEffect } from 'react';
import { useGameStore, Player } from '../store/gameStore';
import { MapPin, UserCheck, Search, AlertCircle, Bell, Shield } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/game/StatusBadge';
import CountdownTimer from '../components/game/CountdownTimer';
import TagButton from '../components/game/TagButton';
import DodgeButton from '../components/game/DodgeButton';
import PowerUpButton from '../components/game/PowerUpButton';
import SuspicionMeter from '../components/game/SuspicionMeter';
import DodgeControls from '../components/game/DodgeControls';
import MysteryRoleCard from '../components/game/MysteryRoleCard';
import MindGamesControls from '../components/game/MindGamesControls';
import WhisperControls from '../components/game/WhisperControls';
import DisguiseControls from '../components/game/DisguiseControls';
import FlashEventBanner from '../components/game/FlashEventBanner';
import PlayerCard from '../components/game/PlayerCard';
import AvatarDisplay from '../components/profile/AvatarDisplay';

const GamePage = () => {
  const { currentPlayer, currentMatch, joinMatch, nearbyPlayers, locationError, clearLocationError } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showTagSuccess, setShowTagSuccess] = useState(false);
  const [showDodgeSuccess, setShowDodgeSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const handleTagSuccess = () => {
    setSelectedPlayer(null);
    setShowTagSuccess(true);
    
    setTimeout(() => {
      setShowTagSuccess(false);
    }, 3000);
  };

  const handleDodgeSuccess = () => {
    setSelectedPlayer(null);
    setShowDodgeSuccess(true);
    
    setTimeout(() => {
      setShowDodgeSuccess(false);
    }, 3000);
  };
  
  if (!currentMatch) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Join a Match</h1>
          <p className="text-neutral-400 mb-6">
            Join a match in your area to start playing
          </p>
          <Button
            onClick={joinMatch}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Find Match
          </Button>
        </div>
      </div>
    );
  }

  if (!currentPlayer) return null;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Game Status</h1>
        <p className="text-neutral-400">
          Playing in {currentMatch.region_name}
        </p>
      </div>
      
      <FlashEventBanner />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <AvatarDisplay size="lg" className="mb-4" />
            
            <h2 className="text-xl font-bold text-white font-mono mb-2">
              {currentPlayer.codename}
            </h2>
            
            <div className="flex items-center mb-6">
              <StatusBadge status={currentPlayer.status} className="text-lg" />
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-200 p-3 rounded-lg text-center">
                <p className="text-neutral-400 text-sm">Tag Streak</p>
                <p className="text-white text-xl font-bold">{currentPlayer.tagStreak}</p>
              </div>
              
              <div className="bg-dark-200 p-3 rounded-lg text-center">
                <p className="text-neutral-400 text-sm">Dodges Left</p>
                <p className="text-white text-xl font-bold">{currentPlayer.dodgeCount}</p>
              </div>
            </div>
            
            {currentPlayer.status === 'it' && (
              <CountdownTimer className="w-full mb-6 bg-dark-200 p-4 rounded-lg" />
            )}

            {locationError && (
              <div className="w-full p-3 bg-error/20 border border-error/30 rounded-lg flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-error mr-2 flex-shrink-0" />
                <p className="text-sm text-white">{locationError}</p>
                <button
                  onClick={clearLocationError}
                  className="ml-2 text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Power-ups section */}
            <div className="w-full space-y-3">
              <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Power-ups</h3>
              <PowerUpButton type="extraDodge" />
              <PowerUpButton type="shadowCloak" />
              <PowerUpButton type="reverseTag" />
            </div>

            {/* Add Suspicion Meter */}
            <SuspicionMeter className="mt-6" />

            {/* Add Mystery Role Card */}
            <MysteryRoleCard />
          </div>
        </Card>
        
        {/* Nearby Players */}
        <Card className="lg:col-span-2" title="Nearby Players">
          <WhisperControls />
          <MindGamesControls />
          <DisguiseControls />
          <DodgeControls />

          {showTagSuccess && (
            <div className="mb-4 p-3 bg-success/20 border border-success/30 rounded-lg flex items-center">
              <UserCheck className="h-5 w-5 text-success mr-2" />
              <span className="text-white">Tag successful! You are no longer "It".</span>
            </div>
          )}

          {showDodgeSuccess && (
            <div className="mb-4 p-3 bg-primary-500/20 border border-primary-500/30 rounded-lg flex items-center">
              <Shield className="h-5 w-5 text-primary-500 mr-2" />
              <span className="text-white">Dodge successful! You're safe for 2 minutes.</span>
            </div>
          )}
          
          {/* Selected player for tagging/dodging */}
          {selectedPlayer && (
            <div className="mb-6 p-4 bg-dark-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <AvatarDisplay 
                    playerId={selectedPlayer.id}
                    size="sm"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-white font-medium font-mono">{selectedPlayer.codename}</h3>
                    <div className="flex items-center">
                      <StatusBadge status={selectedPlayer.status} />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {currentPlayer.status === 'it' && selectedPlayer.status === 'neutral' && (
                  <TagButton 
                    targetPlayer={selectedPlayer} 
                    onSuccess={handleTagSuccess}
                  />
                )}
                
                {selectedPlayer.status === 'it' && currentPlayer.status === 'neutral' && (
                  <DodgeButton 
                    targetId={selectedPlayer.id}
                    onSuccess={handleDodgeSuccess}
                  />
                )}
              </div>
            </div>
          )}
          
          {nearbyPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-neutral-500 mb-4" />
              <p className="text-neutral-400 text-center">
                No players nearby. Move around to find others.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {nearbyPlayers.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={setSelectedPlayer}
                />
              ))}
            </div>
          )}
          
          {currentPlayer.status === 'out' && (
            <div className="mt-6 p-4 bg-dark-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-error mr-2" />
              <div>
                <p className="text-white">You are out of this season.</p>
                <p className="text-neutral-400 text-sm">
                  Wait for the next season to start or create a new account.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GamePage;