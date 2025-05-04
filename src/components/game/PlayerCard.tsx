import { useGameStore, Player } from '../../store/gameStore';
import StatusBadge from './StatusBadge';
import AvatarDisplay from '../profile/AvatarDisplay';
import Button from '../ui/Button';

interface PlayerCardProps {
  player: Player;
  onSelect?: (player: Player) => void;
  className?: string;
}

const PlayerCard = ({ player, onSelect, className = '' }: PlayerCardProps) => {
  const { currentPlayer } = useGameStore();
  
  if (!currentPlayer) return null;
  
  const canTag = currentPlayer.status === 'it' && player.status === 'neutral';
  const canDodge = player.status === 'it' && currentPlayer.status === 'neutral';
  
  return (
    <div
      className={`p-4 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
        (canTag || canDodge)
          ? 'bg-dark-200 hover:bg-dark-100'
          : 'bg-dark-200'
      } ${className}`}
      onClick={() => {
        if ((canTag || canDodge) && onSelect) {
          onSelect(player);
        }
      }}
    >
      <div className="flex items-center">
        <AvatarDisplay 
          playerId={player.id}
          size="sm"
          className="mr-3"
        />
        <div>
          <p className="text-white font-medium font-mono">{player.codename}</p>
          <div className="flex items-center">
            <StatusBadge status={player.status} />
          </div>
        </div>
      </div>
      
      {canTag && (
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(player);
          }}
        >
          Tag
        </Button>
      )}

      {canDodge && (
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(player);
          }}
        >
          Dodge
        </Button>
      )}
    </div>
  );
};

export default PlayerCard;