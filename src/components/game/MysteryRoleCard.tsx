import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Eye, Shield, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const MysteryRoleCard = () => {
  const { currentPlayer, useTrackerAbility, useDecoyAbility } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  if (!currentPlayer || currentPlayer.mysteryRole === 'none') return null;
  
  const getRoleDetails = () => {
    switch (currentPlayer.mysteryRole) {
      case 'tracker':
        return {
          icon: Eye,
          title: 'The Tracker',
          description: 'You can ping the last known location of "It" once per game.',
          action: 'Locate "It"',
          color: 'text-primary-500',
        };
      case 'decoy':
        return {
          icon: Shield,
          title: 'The Decoy',
          description: 'You appear as "It" to everyone but aren\'t - cause chaos!',
          action: 'Toggle Decoy',
          color: 'text-secondary-500',
        };
      case 'mole':
        return {
          icon: RotateCcw,
          title: 'The Mole',
          description: 'You are controlled by the system to confuse others.',
          action: null, // Moles don't have an action button
          color: 'text-accent-500',
        };
      default:
        return null;
    }
  };
  
  const details = getRoleDetails();
  if (!details) return null;
  
  const Icon = details.icon;
  
  const handleAction = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (currentPlayer.mysteryRole === 'tracker') {
        const location = await useTrackerAbility();
        setLastLocation(location);
      } else if (currentPlayer.mysteryRole === 'decoy') {
        await useDecoyAbility();
      }
    } catch (error) {
      console.error('Failed to use ability:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-dark-200 border border-dark-100">
      <div className="flex items-center mb-4">
        <div className={`p-2 rounded-lg bg-dark-300 ${details.color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-white">{details.title}</h3>
          <p className="text-sm text-neutral-400">{details.description}</p>
        </div>
      </div>
      
      {details.action && (
        <Button
          onClick={handleAction}
          isLoading={isLoading}
          fullWidth
          variant="primary"
        >
          {details.action}
        </Button>
      )}
      
      {lastLocation && (
        <div className="mt-4 p-3 bg-dark-300 rounded-lg">
          <p className="text-sm text-neutral-300">Last known location:</p>
          <p className="text-xs font-mono text-neutral-400">
            {lastLocation.lat.toFixed(6)}, {lastLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </Card>
  );
};

export default MysteryRoleCard;