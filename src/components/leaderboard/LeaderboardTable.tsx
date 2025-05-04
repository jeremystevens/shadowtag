import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import StatusBadge from '../game/StatusBadge';
import { Tag, Shield, Trophy, Clock } from 'lucide-react';

type SortField = 'points' | 'tags' | 'dodges' | 'streak';
type SortDirection = 'asc' | 'desc';

const LeaderboardTable = () => {
  const { players, currentMatch } = useGameStore();
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const sortedPlayers = [...players].sort((a, b) => {
    switch (sortField) {
      case 'points':
        return sortDirection === 'desc' 
          ? b.points - a.points 
          : a.points - b.points;
      case 'tags':
        return sortDirection === 'desc' 
          ? b.totalTags - a.totalTags 
          : a.totalTags - b.totalTags;
      case 'dodges':
        return sortDirection === 'desc' 
          ? b.dodgeCount - a.dodgeCount 
          : a.dodgeCount - b.dodgeCount;
      case 'streak':
        return sortDirection === 'desc' 
          ? b.tagStreak - a.tagStreak 
          : a.tagStreak - b.tagStreak;
      default:
        return 0;
    }
  });
  
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'desc' ? '↓' : '↑'}
      </span>
    );
  };
  
  return (
    <div className="bg-dark-300 rounded-lg shadow-lg overflow-hidden">
      {currentMatch && (
        <div className="p-4 border-b border-dark-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Current Match</h3>
              <p className="text-sm text-neutral-400">
                Started {new Date(currentMatch.startedAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-400">
                {Math.max(
                  0,
                  Math.floor(
                    (new Date(currentMatch.startedAt).getTime() +
                      30 * 60 * 1000 -
                      Date.now()) /
                      1000 /
                      60
                  )
                )}m remaining
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-100">
          <thead className="bg-dark-200">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Player
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('points')}
              >
                <span className="flex items-center">
                  Points
                  {renderSortIcon('points')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('tags')}
              >
                <span className="flex items-center">
                  Tags
                  {renderSortIcon('tags')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('dodges')}
              >
                <span className="flex items-center">
                  Dodges
                  {renderSortIcon('dodges')}
                </span>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-dark-300 divide-y divide-dark-100">
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className="hover:bg-dark-200 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-dark-100 rounded-full flex items-center justify-center font-mono text-xs text-neutral-300">
                      {player.codename.substring(0, 2)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white font-mono">
                        {player.codename}
                      </div>
                      {player.tagStreak > 0 && (
                        <div className="text-xs text-success">
                          {player.tagStreak}x streak
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 text-primary-500 mr-1" />
                    <span className="text-sm text-white">{player.points}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-error mr-1" />
                    <span className="text-sm text-white">{player.totalTags}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-secondary-500 mr-1" />
                    <span className="text-sm text-white">{player.dodgeCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={player.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;