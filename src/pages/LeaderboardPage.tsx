import { Users, Shield, Award, Tag } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import StatsCard from '../components/leaderboard/StatsCard';

const LeaderboardPage = () => {
  const { players, currentMatch } = useGameStore();
  
  // Calculate match-based stats
  const activePlayers = players.filter(p => p.status !== 'out').length;
  const neutralPlayers = players.filter(p => p.status === 'neutral').length;
  
  // Find player with most tags
  const topTagger = [...players].sort((a, b) => b.totalTags - a.totalTags)[0];
  
  // Find player with most dodges
  const topDodger = [...players].sort((a, b) => b.dodgeCount - a.dodgeCount)[0];
  
  // Find player with highest streak
  const topStreaker = [...players].sort((a, b) => b.tagStreak - a.tagStreak)[0];
  
  // Find player with highest points
  const topScorer = [...players].sort((a, b) => b.points - a.points)[0];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Match Leaderboard</h1>
        <p className="text-neutral-400">
          Current match statistics and rankings
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Players"
          value={activePlayers}
          icon={<Users className="h-6 w-6 text-primary-500" />}
        />
        
        <StatsCard
          title="Neutral Players"
          value={neutralPlayers}
          icon={<Shield className="h-6 w-6 text-secondary-500" />}
        />
        
        <StatsCard
          title="Most Tags"
          value={topTagger?.totalTags || 0}
          icon={<Tag className="h-6 w-6 text-error" />}
          playerName={topTagger?.codename}
        />
        
        <StatsCard
          title="Top Score"
          value={topScorer?.points || 0}
          icon={<Award className="h-6 w-6 text-warning" />}
          playerName={topScorer?.codename}
        />
      </div>
      
      <LeaderboardTable />
    </div>
  );
};

export default LeaderboardPage;