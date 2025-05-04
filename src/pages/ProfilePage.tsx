import { useState } from 'react';
import { CalendarDays, Clock, Award, AlertTriangle, Tag as TagIcon, Shield, Trophy, Target, MapPin, Crown, Zap, Network } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatDistance } from 'date-fns';
import Card from '../components/ui/Card';
import StatusBadge from '../components/game/StatusBadge';
import Button from '../components/ui/Button';
import AvatarDisplay from '../components/profile/AvatarDisplay';
import ProfileCard from '../components/profile/ProfileCard';

const ProfilePage = () => {
  const { currentPlayer, tags, players } = useGameStore();
  const [selectedSection, setSelectedSection] = useState<'stats' | 'achievements' | 'network'>('stats');
  
  if (!currentPlayer) return null;
  
  // Helper function to safely format dates
  const formatDateDistance = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown';
    }
  };
  
  // Get player's tags
  const playerTags = tags.filter(tag => 
    tag.taggerId === currentPlayer.id || tag.taggedId === currentPlayer.id
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Calculate stats
  const totalDodges = currentPlayer.dodgeCount || 0;
  const totalTags = currentPlayer.totalTags || 0;
  const currentStreak = currentPlayer.tagStreak || 0;
  const totalPoints = currentPlayer.points || 0;
  
  // Calculate badges
  const badges = [
    {
      id: 'ghost',
      name: 'Ghost Mode',
      icon: Shield,
      unlocked: totalDodges >= 5,
      description: 'Survived 5+ dodges',
      color: 'text-primary-500',
    },
    {
      id: 'hunter',
      name: 'Tag God',
      icon: Target,
      unlocked: totalTags >= 5,
      description: '5+ successful tags',
      color: 'text-error',
    },
    {
      id: 'survivor',
      name: 'Uncatchable',
      icon: Zap,
      unlocked: currentStreak >= 3,
      description: '3+ tag streak',
      color: 'text-warning',
    },
    {
      id: 'master',
      name: 'Zone Master',
      icon: MapPin,
      unlocked: totalPoints >= 1000,
      description: '1000+ points earned',
      color: 'text-success',
    },
  ];
  
  // Calculate most tagged players
  const tagConnections = playerTags.reduce((acc, tag) => {
    const isOutgoing = tag.taggerId === currentPlayer.id;
    const otherId = isOutgoing ? tag.taggedId : tag.taggerId;
    
    if (!acc[otherId]) {
      acc[otherId] = { outgoing: 0, incoming: 0 };
    }
    
    if (isOutgoing) {
      acc[otherId].outgoing++;
    } else {
      acc[otherId].incoming++;
    }
    
    return acc;
  }, {} as Record<string, { outgoing: number; incoming: number }>);
  
  // Get top connections
  const topConnections = Object.entries(tagConnections)
    .map(([id, counts]) => ({
      player: players.find(p => p.id === id) || { codename: 'Unknown' },
      ...counts,
    }))
    .sort((a, b) => (b.outgoing + b.incoming) - (a.outgoing + a.incoming))
    .slice(0, 5);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        <p className="text-neutral-400">
          View your stats, achievements, and tag history
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Card */}
        <div className="lg:col-span-1">
          <ProfileCard />
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Navigation */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={selectedSection === 'stats' ? 'primary' : 'ghost'}
              onClick={() => setSelectedSection('stats')}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Stats
            </Button>
            <Button
              variant={selectedSection === 'achievements' ? 'primary' : 'ghost'}
              onClick={() => setSelectedSection('achievements')}
            >
              <Crown className="w-4 h-4 mr-2" />
              Achievements
            </Button>
            <Button
              variant={selectedSection === 'network' ? 'primary' : 'ghost'}
              onClick={() => setSelectedSection('network')}
            >
              <Network className="w-4 h-4 mr-2" />
              Tag Network
            </Button>
          </div>
          
          {/* Stats Section */}
          {selectedSection === 'stats' && (
            <>
              <Card title="Match Performance">
                <div className="h-64 bg-dark-200 rounded-lg relative overflow-hidden">
                  {/* Simple bar chart showing last 5 matches */}
                  <div className="absolute inset-0 flex items-end justify-around p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-1/6">
                        <div 
                          className="bg-primary-500 rounded-t-lg"
                          style={{ 
                            height: `${Math.random() * 80 + 20}%`,
                            opacity: 1 - (i * 0.15)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-around p-2 text-xs text-neutral-400">
                    {[...Array(5)].map((_, i) => (
                      <div key={i}>Match {5 - i}</div>
                    ))}
                  </div>
                </div>
              </Card>
              
              <Card className="mt-6" title="Tag History">
                <div className="space-y-4">
                  {playerTags.slice(0, 10).map(tag => {
                    const isTagged = tag.taggedId === currentPlayer.id;
                    const otherPlayerId = isTagged ? tag.taggerId : tag.taggedId;
                    const otherPlayer = players.find(p => p.id === otherPlayerId) || {
                      codename: 'Unknown Player'
                    };
                    
                    return (
                      <div key={tag.id} className="p-4 bg-dark-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                              isTagged ? 'bg-error/20' : 'bg-success/20'
                            }`}>
                              {isTagged ? (
                                <TagIcon className="h-5 w-5 text-error" />
                              ) : (
                                <TagIcon className="h-5 w-5 text-success" />
                              )}
                            </div>
                            <div>
                              <p className="text-white text-sm">
                                {isTagged 
                                  ? <span>You were tagged by <span className="font-mono">{otherPlayer.codename}</span></span>
                                  : <span>You tagged <span className="font-mono">{otherPlayer.codename}</span></span>
                                }
                              </p>
                              <p className="text-neutral-500 text-xs">
                                {formatDateDistance(tag.timestamp.toString())}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
          
          {/* Achievements Section */}
          {selectedSection === 'achievements' && (
            <Card title="Badges & Achievements">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {badges.map(badge => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg ${
                      badge.unlocked
                        ? 'bg-dark-200'
                        : 'bg-dark-300 opacity-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <badge.icon className={`h-5 w-5 ${badge.color} mr-2`} />
                      <span className={`text-sm font-medium ${
                        badge.unlocked ? 'text-white' : 'text-neutral-500'
                      }`}>
                        {badge.name}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {badge.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-4">Unlockables</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Power-ups */}
                <div className="p-4 bg-dark-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-3">Power-ups</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Extra Dodge', unlocked: currentPlayer.powerUps?.extraDodge || false },
                      { name: 'Shadow Cloak', unlocked: currentPlayer.powerUps?.shadowCloak || false },
                      { name: 'Reverse Tag', unlocked: currentPlayer.powerUps?.reverseTag || false },
                    ].map(powerUp => (
                      <div
                        key={powerUp.name}
                        className={`p-3 rounded-lg ${powerUp.unlocked ? 'bg-primary-500/20' : 'bg-dark-300/50'}`}
                      >
                        <div className="flex items-center">
                          <Zap className={`h-4 w-4 mr-2 ${powerUp.unlocked ? 'text-primary-500' : 'text-neutral-500'}`} />
                          <span className={powerUp.unlocked ? 'text-white' : 'text-neutral-500'}>
                            {powerUp.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mystery Roles */}
                <div className="p-4 bg-dark-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-3">Mystery Roles</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Tracker', unlocked: currentPlayer.mysteryRole === 'tracker' },
                      { name: 'Decoy', unlocked: currentPlayer.mysteryRole === 'decoy' },
                      { name: 'Mole', unlocked: currentPlayer.mysteryRole === 'mole' },
                    ].map(role => (
                      <div
                        key={role.name}
                        className={`p-3 rounded-lg ${role.unlocked ? 'bg-accent-500/20' : 'bg-dark-300/50'}`}
                      >
                        <div className="flex items-center">
                          <Crown className={`h-4 w-4 mr-2 ${role.unlocked ? 'text-accent-500' : 'text-neutral-500'}`} />
                          <span className={role.unlocked ? 'text-white' : 'text-neutral-500'}>
                            {role.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* Tag Network Section */}
          {selectedSection === 'network' && (
            <Card title="Tag Network">
              <div className="space-y-6">
                {/* Network Visualization */}
                <div className="h-64 bg-dark-200 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Center node (current player) */}
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-xs font-mono text-white">
                          {currentPlayer.codename.substring(0, 2)}
                        </span>
                      </div>
                      
                      {/* Connection lines */}
                      {topConnections.map((conn, index) => {
                        const angle = (360 / topConnections.length) * index;
                        const distance = 100;
                        
                        return (
                          <div
                            key={conn.player.id}
                            className="absolute"
                            style={{
                              width: '2px',
                              height: `${distance}px`,
                              background: `linear-gradient(to bottom, ${
                                conn.outgoing > conn.incoming ? '#ef4444' : '#22c55e'
                              }, transparent)`,
                              transformOrigin: 'top',
                              transform: `rotate(${angle}deg)`,
                            }}
                          >
                            <div
                              className="absolute top-full -translate-x-1/2"
                              style={{
                                transform: `rotate(-${angle}deg) translateY(-50%)`,
                              }}
                            >
                              <AvatarDisplay 
                                playerId={conn.player.id}
                                size="sm"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Connection Details */}
                <div className="space-y-3">
                  {topConnections.map(conn => (
                    <div key={conn.player.id} className="p-4 bg-dark-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AvatarDisplay 
                            playerId={conn.player.id}
                            size="sm"
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium text-white">
                              {conn.player.codename}
                            </p>
                            <div className="flex items-center text-xs text-neutral-400">
                              <TagIcon className="h-3 w-3 mr-1" />
                              <span>{conn.outgoing + conn.incoming} interactions</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-error">
                            {conn.outgoing} out
                          </div>
                          <div className="text-success">
                            {conn.incoming} in
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;