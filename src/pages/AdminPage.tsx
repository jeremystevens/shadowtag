import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Trophy, Calendar, Clock, AlertTriangle, Tag as TagIcon, Shield, Map } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

// Admin access code - In production, this should be environment-based and more secure
const ADMIN_ACCESS_CODE = 'SECRET123';

const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'matches' | 'logs'>('overview');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'gps' | 'bluetooth'>('all');
  
  const { 
    players,
    matches,
    tags,
    dodges,
    currentSeason,
    endCurrentSeason,
    resetGame
  } = useGameStore();
  
  useEffect(() => {
    // Check access code from URL params
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    
    if (code === ADMIN_ACCESS_CODE) {
      setIsAuthorized(true);
      setError(''); // Clear any existing errors
    }
  }, [location]);
  
  const handleAccessSubmit = () => {
    if (accessCode === ADMIN_ACCESS_CODE) {
      setIsAuthorized(true);
      setError('');
      navigate(`/admin?code=${accessCode}`);
    } else {
      setError('Invalid access code');
    }
  };
  
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6">
        <Card>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-dark-200 mb-4">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Access Required</h2>
            <p className="text-sm text-neutral-400 mt-2">
              Please enter the admin access code to continue
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-error/20 border border-error/30 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 text-error mr-2" />
              <p className="text-sm text-white">{error}</p>
            </div>
          )}
          
          <Input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Enter access code"
            className="mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAccessSubmit();
              }
            }}
          />
          
          <Button
            onClick={handleAccessSubmit}
            fullWidth
          >
            Access Dashboard
          </Button>
        </Card>
      </div>
    );
  }
  
  // Calculate statistics
  const activePlayers = players.filter(p => p.status !== 'out').length;
  const itPlayers = players.filter(p => p.status === 'it').length;
  const activeMatches = matches.filter(m => m.isActive).length;
  const tagsToday = tags.filter(t => {
    const today = new Date();
    const tagDate = new Date(t.timestamp);
    return (
      tagDate.getDate() === today.getDate() &&
      tagDate.getMonth() === today.getMonth() &&
      tagDate.getFullYear() === today.getFullYear()
    );
  }).length;
  
  // Sort players by tags and dodges
  const topTaggers = [...players]
    .sort((a, b) => b.totalTags - a.totalTags)
    .slice(0, 5);
  
  const topDodgers = [...players]
    .sort((a, b) => b.dodgeCount - a.dodgeCount)
    .slice(0, 5);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-neutral-400">
          Monitor and manage game activity
        </p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Trophy },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'matches', label: 'Matches', icon: Calendar },
          { id: 'logs', label: 'Debug Logs', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-200 text-neutral-400 hover:bg-dark-100'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-primary-500/20">
                  <Users className="h-6 w-6 text-primary-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-400">Active Players</p>
                  <p className="text-2xl font-semibold text-white">{activePlayers}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-error/20">
                  <TagIcon className="h-6 w-6 text-error" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-400">Tags Today</p>
                  <p className="text-2xl font-semibold text-white">{tagsToday}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-warning/20">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-400">"It" Players</p>
                  <p className="text-2xl font-semibold text-white">{itPlayers}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-success/20">
                  <Trophy className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-400">Active Matches</p>
                  <p className="text-2xl font-semibold text-white">{activeMatches}</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Top Players */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Top Taggers">
              <div className="space-y-4">
                {topTaggers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center mr-3">
                        <span className="text-xs font-mono text-neutral-400">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{player.codename}</p>
                        <p className="text-xs text-neutral-400">Total Tags: {player.totalTags}</p>
                      </div>
                    </div>
                    <div className="text-sm font-mono text-success">
                      {player.tagStreak}x streak
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card title="Top Dodgers">
              <div className="space-y-4">
                {topDodgers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center mr-3">
                        <span className="text-xs font-mono text-neutral-400">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{player.codename}</p>
                        <p className="text-xs text-neutral-400">Total Dodges: {player.dodgeCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-primary-500 mr-1" />
                      <span className="text-sm font-mono text-primary-500">
                        {player.dodgeCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Activity Map */}
          <Card title="Activity Heatmap">
            <div className="h-96 bg-dark-200 rounded-lg relative overflow-hidden">
              {/* Placeholder heatmap visualization */}
              <div className="absolute inset-0">
                {players.map((player, index) => {
                  if (!player.location) return null;
                  
                  return (
                    <div
                      key={player.id}
                      className={`absolute w-16 h-16 rounded-full blur-xl ${
                        player.status === 'it' ? 'bg-error' : 'bg-primary-500'
                      }`}
                      style={{
                        opacity: 0.3,
                        left: `${((player.location.lat + 90) / 180) * 100}%`,
                        top: `${((player.location.lng + 180) / 360) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  );
                })}
              </div>
              
              <div className="absolute bottom-4 left-4 bg-dark-300/90 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-2">Activity Zones</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                    <span className="text-xs text-neutral-300">Player Activity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-error" />
                    <span className="text-xs text-neutral-300">"It" Presence</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card title="Recent Users">
            <div className="space-y-4">
              {players.map(player => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg transition-colors cursor-pointer ${
                    selectedUser === player.id
                      ? 'bg-primary-500/20 border-2 border-primary-500'
                      : 'bg-dark-200 hover:bg-dark-100'
                  }`}
                  onClick={() => setSelectedUser(player.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-dark-100 rounded-full flex items-center justify-center font-mono text-xs text-neutral-300 mr-3">
                        {player.codename.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{player.codename}</p>
                        <div className="flex items-center text-xs text-neutral-400">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>
                            Joined {new Date(player.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-xs px-2 py-1 rounded-full bg-dark-300">
                        {player.status}
                      </div>
                      {player.isAdmin && (
                        <div className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-500">
                          Admin
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedUser === player.id && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-dark-300 rounded-lg">
                          <p className="text-sm text-neutral-400">Total Tags</p>
                          <p className="text-lg font-medium text-white">{player.totalTags}</p>
                        </div>
                        <div className="p-3 bg-dark-300 rounded-lg">
                          <p className="text-sm text-neutral-400">Dodges</p>
                          <p className="text-lg font-medium text-white">{player.dodgeCount}</p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-dark-300 rounded-lg">
                        <p className="text-sm text-neutral-400 mb-2">Recent Activity</p>
                        <div className="space-y-2">
                          {tags
                            .filter(t => t.taggerId === player.id || t.taggedId === player.id)
                            .slice(0, 5)
                            .map(tag => (
                              <div key={tag.id} className="text-xs text-neutral-300">
                                {tag.taggerId === player.id ? 'Tagged' : 'Was tagged by'}{' '}
                                {players.find(p => 
                                  p.id === (tag.taggerId === player.id ? tag.taggedId : tag.taggerId)
                                )?.codename}{' '}
                                ({new Date(tag.timestamp).toLocaleTimeString()})
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this player?')) {
                              // Handle player removal
                            }
                          }}
                        >
                          Remove Player
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // Handle role reset
                          }}
                        >
                          Reset Role
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      
      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <Card title="Active Matches">
            <div className="space-y-4">
              {matches
                .filter(m => m.isActive)
                .map(match => (
                  <div
                    key={match.id}
                    className={`p-4 rounded-lg transition-colors cursor-pointer ${
                      selectedMatch === match.id
                        ? 'bg-primary-500/20 border-2 border-primary-500'
                        : 'bg-dark-200 hover:bg-dark-100'
                    }`}
                    onClick={() => setSelectedMatch(match.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          Match #{match.id.substring(0, 8)}
                        </p>
                        <p className="text-xs text-neutral-400">
                          Started {new Date(match.startedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">
                          Active
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to end this match?')) {
                              // Handle match end
                            }
                          }}
                        >
                          End Match
                        </Button>
                      </div>
                    </div>
                    
                    {selectedMatch === match.id && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-dark-300 rounded-lg">
                            <p className="text-sm text-neutral-400">Players</p>
                            <p className="text-lg font-medium text-white">
                              {players.filter(p => p.status !== 'out').length}
                            </p>
                          </div>
                          <div className="p-3 bg-dark-300 rounded-lg">
                            <p className="text-sm text-neutral-400">"It" Players</p>
                            <p className="text-lg font-medium text-white">
                              {players.filter(p => p.status === 'it').length}
                            </p>
                          </div>
                          <div className="p-3 bg-dark-300 rounded-lg">
                            <p className="text-sm text-neutral-400">Time Left</p>
                            <p className="text-lg font-medium text-white">
                              {Math.max(
                                0,
                                Math.floor(
                                  (new Date(match.startedAt).getTime() +
                                    30 * 60 * 1000 -
                                    Date.now()) /
                                    1000 /
                                    60
                                )
                              )}m
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-dark-300 rounded-lg">
                          <p className="text-sm text-neutral-400 mb-2">Recent Events</p>
                          <div className="space-y-2">
                            {tags
                              .filter(t => new Date(t.timestamp) > new Date(match.startedAt))
                              .slice(0, 5)
                              .map(tag => (
                                <div key={tag.id} className="text-xs text-neutral-300">
                                  {players.find(p => p.id === tag.taggerId)?.codename} tagged{' '}
                                  {players.find(p => p.id === tag.taggedId)?.codename}{' '}
                                  ({new Date(tag.timestamp).toLocaleTimeString()})
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </Card>
          
          <Card title="Match History">
            <div className="space-y-4">
              {matches
                .filter(m => !m.isActive)
                .slice(0, 5)
                .map(match => (
                  <div key={match.id} className="p-4 bg-dark-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          Match #{match.id.substring(0, 8)}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {new Date(match.startedAt).toLocaleDateString()}{' '}
                          {new Date(match.startedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-400">
                        Completed
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
      
      {/* Debug Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={logFilter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setLogFilter('all')}
            >
              All Logs
            </Button>
            <Button
              variant={logFilter === 'gps' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setLogFilter('gps')}
            >
              GPS Errors
            </Button>
            <Button
              variant={logFilter === 'bluetooth' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setLogFilter('bluetooth')}
            >
              Bluetooth Issues
            </Button>
          </div>
          
          <Card title="System Logs">
            <div className="space-y-4">
              {/* Placeholder for logs */}
              <div className="p-3 bg-dark-200 rounded-lg">
                <div className="flex items-center text-error mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">GPS Error</span>
                </div>
                <p className="text-sm text-neutral-400">
                  Location accuracy below threshold for player "ShadowRunner42"
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  2 minutes ago • iPhone 13 • iOS 15.4
                </p>
              </div>
              
              <div className="p-3 bg-dark-200 rounded-lg">
                <div className="flex items-center text-warning mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Bluetooth Warning</span>
                </div>
                <p className="text-sm text-neutral-400">
                  Weak Bluetooth signal detected for player "PhantomHawk99"
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  5 minutes ago • Pixel 6 • Android 12
                </p>
              </div>
            </div>
          </Card>
          
          <Card title="Error Distribution">
            <div className="h-64 bg-dark-200 rounded-lg p-4">
              {/* Placeholder for error distribution chart */}
              <div className="h-full flex items-end space-x-4">
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-error/20 rounded-t-lg" style={{ height: '60%' }}></div>
                  <span className="text-xs text-neutral-400 mt-2">GPS</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-warning/20 rounded-t-lg" style={{ height: '30%' }}></div>
                  <span className="text-xs text-neutral-400 mt-2">Bluetooth</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-primary-500/20 rounded-t-lg" style={{ height: '10%' }}></div>
                  <span className="text-xs text-neutral-400 mt-2">Network</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage;