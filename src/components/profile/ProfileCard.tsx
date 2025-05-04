import { useGameStore } from '../../store/gameStore';
import { Shield, Award, Tag as TagIcon } from 'lucide-react';
import StatusBadge from '../game/StatusBadge';
import AvatarDisplay from './AvatarDisplay';

interface ProfileCardProps {
  className?: string;
}

const ProfileCard = ({ className = '' }: ProfileCardProps) => {
  const { currentPlayer } = useGameStore();
  
  if (!currentPlayer) return null;
  
  return (
    <div className={`bg-dark-300 rounded-lg p-6 shadow-lg ${className}`}>
      <div className="flex flex-col items-center">
        <AvatarDisplay size="xl" className="mb-4" />
        
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
        
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-neutral-400 mr-2" />
              <span className="text-neutral-300">Points</span>
            </div>
            <span className="text-white">{currentPlayer.points}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TagIcon className="h-5 w-5 text-neutral-400 mr-2" />
              <span className="text-neutral-300">Total Tags</span>
            </div>
            <span className="text-white">{currentPlayer.totalTags}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-neutral-400 mr-2" />
              <span className="text-neutral-300">Total Dodges</span>
            </div>
            <span className="text-white">{currentPlayer.dodgeCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;