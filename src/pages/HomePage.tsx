import { Link } from 'react-router-dom';
import { Tag, Shield, Award, Map, Clock, Zap, Users, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import Button from '../components/ui/Button';

const HomePage = () => {
  const { currentPlayer, currentMatch } = useGameStore();
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-300 to-dark-400 z-0"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-[20%] left-[10%] w-24 h-24 bg-primary-900/20 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[15%] w-32 h-32 bg-secondary-900/20 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-[15%] left-[20%] w-40 h-40 bg-accent-900/20 rounded-full blur-3xl animate-pulse-slow"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-8 inline-flex items-center justify-center p-3 bg-dark-200 rounded-full">
              <Tag className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              30-Minute <span className="text-primary-500">Tag Matches</span>
              <br />
              <span className="text-neutral-300">Real-Time Competition</span>
            </h1>
            <p className="text-lg text-neutral-300 mb-8">
              Join intense 30-minute matches where players compete for MVP status.
              Tag others, dodge attacks, and survive to climb the live leaderboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentPlayer ? (
                currentMatch ? (
                  <Link to="/game">
                    <Button size="lg" variant="primary" className="animate-pulse">
                      <Zap className="w-5 h-5 mr-2" />
                      Return to Match
                    </Button>
                  </Link>
                ) : (
                  <Link to="/game">
                    <Button size="lg">
                      <Trophy className="w-5 h-5 mr-2" />
                      Play Match
                    </Button>
                  </Link>
                )
              ) : (
                <Link to="/signup">
                  <Button size="lg">
                    Join the Competition
                  </Button>
                </Link>
              )}
              
              {currentPlayer && (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" size="lg">
                      View Profile
                    </Button>
                  </Link>
                  <Link to="/leaderboard">
                    <Button variant="ghost" size="lg">
                      Leaderboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Match Rules</h2>
            <p className="text-lg text-neutral-400 max-w-3xl mx-auto">
              Every match is a 30-minute battle for survival and points.
              Use strategy and timing to become the Match MVP.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-200 p-8 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-900/30 rounded-lg mb-6">
                <Tag className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tag Mechanics</h3>
              <ul className="text-neutral-400 space-y-2">
                <li>• One player starts as "It"</li>
                <li>• Tag others by getting close</li>
                <li>• Successfully tag to become neutral</li>
                <li>• Build tag streaks for bonus points</li>
              </ul>
            </div>
            
            <div className="bg-dark-200 p-8 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary-900/30 rounded-lg mb-6">
                <Shield className="w-6 h-6 text-secondary-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Defense & Points</h3>
              <ul className="text-neutral-400 space-y-2">
                <li>• Use Dodge for 2-minute immunity</li>
                <li>• +100 points per successful tag</li>
                <li>• +50 points per successful dodge</li>
                <li>• Bonus points for survival time</li>
              </ul>
            </div>
            
            <div className="bg-dark-200 p-8 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-accent-900/30 rounded-lg mb-6">
                <Trophy className="w-6 h-6 text-accent-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Match Victory</h3>
              <ul className="text-neutral-400 space-y-2">
                <li>• Highest points becomes MVP</li>
                <li>• Match ends after 30 minutes</li>
                <li>• Climb the live leaderboard</li>
                <li>• Unlock achievements and roles</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Live Activity Section */}
      <section className="py-16 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-6">Live Activity</h2>
              <p className="text-lg text-neutral-400 mb-6">
                Watch real-time tag activity in your area. Track player movements
                and plan your strategy using the live heatmap.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <span className="text-sm text-neutral-400">"It" Players Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <span className="text-sm text-neutral-400">Recent Tags</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm text-neutral-400">Safe Zones</span>
                </div>
              </div>
              
              {!currentPlayer && (
                <div className="mt-8">
                  <Link to="/signup">
                    <Button>
                      Join to Access Map
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="relative w-full aspect-square bg-dark-200 rounded-lg overflow-hidden">
                {/* Activity Heatmap Preview */}
                <div className="absolute inset-0">
                  <div className="absolute top-[20%] left-[30%] w-24 h-24 bg-error/40 rounded-full blur-lg"></div>
                  <div className="absolute top-[50%] left-[60%] w-32 h-32 bg-primary-500/40 rounded-full blur-lg"></div>
                  <div className="absolute top-[70%] left-[20%] w-16 h-16 bg-success/40 rounded-full blur-lg"></div>
                </div>
                
                {/* Scanning Effect */}
                <div className="absolute inset-0 origin-center animate-spin-slow">
                  <div className="absolute top-0 left-1/2 bottom-1/2 w-px bg-gradient-to-b from-primary-500/0 to-primary-500/30"></div>
                </div>
                
                {!currentPlayer && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-dark-400/50">
                    <div className="text-center p-6">
                      <Map className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-white">Join to access the map</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-dark-300 to-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Play?</h2>
          <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
            Join intense 30-minute matches, compete for MVP status, and climb
            the leaderboard. Every match is a new chance to prove yourself.
          </p>
          
          {currentPlayer ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/game">
                <Button size="lg">
                  {currentMatch ? 'Return to Match' : 'Play Match'}
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="ghost" size="lg">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/signup">
              <Button size="lg">
                Join Now
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;