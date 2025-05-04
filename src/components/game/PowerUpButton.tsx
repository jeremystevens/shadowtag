import { useState } from 'react';
import { Shield, Eye, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

type PowerUpType = 'extraDodge' | 'shadowCloak' | 'reverseTag';

interface PowerUpButtonProps {
  type: PowerUpType;
  className?: string;
}

const PowerUpButton = ({ type, className = '' }: PowerUpButtonProps) => {
  const { currentPlayer } = useGameStore();
  const [isActive, setIsActive] = useState(false);
  
  if (!currentPlayer?.powerUps?.[type]) return null;
  
  const getPowerUpDetails = () => {
    switch (type) {
      case 'extraDodge':
        return {
          icon: Shield,
          label: 'Extra Dodge',
          description: 'One additional dodge per day',
          activeClass: 'bg-primary-600 hover:bg-primary-700',
        };
      case 'shadowCloak':
        return {
          icon: Eye,
          label: 'Shadow Cloak',
          description: 'Hide from the map for 15 minutes',
          activeClass: 'bg-secondary-600 hover:bg-secondary-700',
        };
      case 'reverseTag':
        return {
          icon: RotateCcw,
          label: 'Reverse Tag',
          description: 'Flip incoming tags back to the tagger',
          activeClass: 'bg-accent-600 hover:bg-accent-700',
        };
    }
  };
  
  const details = getPowerUpDetails();
  const Icon = details.icon;
  
  return (
    <button
      onClick={() => setIsActive(!isActive)}
      className={`
        relative
        ${isActive ? details.activeClass : 'bg-dark-200 hover:bg-dark-100'}
        rounded-lg
        p-4
        transition-all
        duration-200
        flex
        items-center
        justify-between
        w-full
        ${className}
      `}
    >
      <div className="flex items-center">
        <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
        <div className="ml-3">
          <p className={`font-medium ${isActive ? 'text-white' : 'text-neutral-300'}`}>
            {details.label}
          </p>
          <p className="text-xs text-neutral-400">
            {details.description}
          </p>
        </div>
      </div>
      
      <div className={`
        w-12
        h-6
        rounded-full
        p-1
        transition-colors
        duration-200
        ${isActive ? 'bg-white/20' : 'bg-dark-300'}
      `}>
        <div className={`
          w-4
          h-4
          rounded-full
          transition-transform
          duration-200
          ${isActive ? 'bg-white translate-x-6' : 'bg-neutral-400 translate-x-0'}
        `}></div>
      </div>
    </button>
  );
};

export default PowerUpButton;