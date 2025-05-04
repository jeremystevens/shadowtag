import { Link, useLocation } from 'react-router-dom';
import { Tag, Map, Award, Shield } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import StatusBadge from './StatusBadge';

const MobileNav = () => {
  const location = useLocation();
  const { currentPlayer } = useGameStore();
  
  if (!currentPlayer) return null;
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-300 border-t border-dark-100 px-2 py-2 md:hidden">
      <div className="flex justify-around items-center">
        <Link
          to="/game"
          className={`flex flex-col items-center p-3 rounded-lg ${
            isActive('/game') ? 'text-white bg-dark-200' : 'text-neutral-400'
          }`}
        >
          <Tag className="h-6 w-6" />
          <span className="text-xs mt-1">Game</span>
        </Link>
        
        <Link
          to="/map"
          className={`flex flex-col items-center p-3 rounded-lg ${
            isActive('/map') ? 'text-white bg-dark-200' : 'text-neutral-400'
          }`}
        >
          <Map className="h-6 w-6" />
          <span className="text-xs mt-1">Map</span>
        </Link>
        
        <div className="flex flex-col items-center">
          <StatusBadge 
            status={currentPlayer.status} 
            showText={false}
            className="p-3 rounded-lg bg-dark-200"
          />
          <span className="text-xs mt-1 text-neutral-400">Status</span>
        </div>
        
        <Link
          to="/leaderboard"
          className={`flex flex-col items-center p-3 rounded-lg ${
            isActive('/leaderboard') ? 'text-white bg-dark-200' : 'text-neutral-400'
          }`}
        >
          <Award className="h-6 w-6" />
          <span className="text-xs mt-1">Leaders</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;