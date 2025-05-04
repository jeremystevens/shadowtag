import { useGameStore } from '../../store/gameStore';

interface AvatarDisplayProps {
  playerId?: string;
  avatarId?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AvatarDisplay = ({ 
  playerId, 
  avatarId, 
  avatarUrl, 
  size = 'md', 
  className = '' 
}: AvatarDisplayProps) => {
  const { currentPlayer, players } = useGameStore();
  
  // Determine which player to display
  const player = playerId 
    ? players.find(p => p.id === playerId) 
    : currentPlayer;
  
  // Use provided avatarId/Url or get from player
  const finalAvatarId = avatarId || player?.avatarId;
  const finalAvatarUrl = avatarUrl || player?.avatarUrl;
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24'
  };
  
  // If no avatar, show initials
  if (!finalAvatarUrl) {
    const initials = player?.codename?.substring(0, 2) || '??';
    
    return (
      <div className={`${sizeClasses[size]} bg-dark-100 rounded-full flex items-center justify-center font-mono text-neutral-300 ${className}`}>
        {initials}
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
      <img 
        src={finalAvatarUrl} 
        alt="Player avatar" 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

export default AvatarDisplay;