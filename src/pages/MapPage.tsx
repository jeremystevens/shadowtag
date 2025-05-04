import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import StatusBadge from '../components/game/StatusBadge';
import { Tag, AlertCircle, Map as MapIcon, Clock } from 'lucide-react';
import Card from '../components/ui/Card';

interface TagActivity {
  id: string;
  location: { lat: number; lng: number };
  timestamp: Date;
  intensity: number;
}

const MapPage = () => {
  const { currentPlayer, nearbyPlayers, tags, locationError } = useGameStore();
  const [recentTags, setRecentTags] = useState<TagActivity[]>([]);
  
  // Process recent tags (last 10 minutes)
  useEffect(() => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    const processedTags = tags
      .filter(tag => new Date(tag.timestamp) > tenMinutesAgo)
      .map(tag => ({
        id: tag.id,
        location: tag.location,
        timestamp: new Date(tag.timestamp),
        intensity: Math.max(0, 1 - (now.getTime() - new Date(tag.timestamp).getTime()) / (10 * 60 * 1000))
      }));
    
    setRecentTags(processedTags);
  }, [tags]);

  // Calculate activity zones based on player density and recent tags
  const activityZones = nearbyPlayers.reduce((zones, player) => {
    if (!player.location) return zones;
    
    // Create rough zones by rounding coordinates
    const zoneKey = `${Math.round(player.location.lat * 100) / 100}_${Math.round(player.location.lng * 100) / 100}`;
    
    if (!zones[zoneKey]) {
      zones[zoneKey] = {
        count: 0,
        hasItPlayer: false,
        averageLat: player.location.lat,
        averageLng: player.location.lng,
        recentActivity: 0
      };
    }
    
    zones[zoneKey].count++;
    zones[zoneKey].hasItPlayer = zones[zoneKey].hasItPlayer || player.status === 'it';
    
    // Add recent tag activity to zone intensity
    const zoneTagActivity = recentTags.filter(tag => {
      const tagZoneKey = `${Math.round(tag.location.lat * 100) / 100}_${Math.round(tag.location.lng * 100) / 100}`;
      return tagZoneKey === zoneKey;
    });
    
    zones[zoneKey].recentActivity = zoneTagActivity.reduce((sum, tag) => sum + tag.intensity, 0);
    
    return zones;
  }, {} as Record<string, { 
    count: number; 
    hasItPlayer: boolean; 
    averageLat: number; 
    averageLng: number;
    recentActivity: number;
  }>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Activity Map</h1>
        <p className="text-neutral-400">
          Live tag activity and player zones within 500 meters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Map */}
        <Card className="relative overflow-hidden">
          <div className="aspect-square relative bg-dark-400">
            {/* Map grid lines */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-dark-300/30"
                />
              ))}
            </div>

            {/* Activity zones */}
            {Object.values(activityZones).map((zone, index) => {
              const baseSize = 40 + (zone.count * 20);
              const activityBonus = zone.recentActivity * 20;
              const size = Math.min(120, baseSize + activityBonus);
              const opacity = Math.min(0.8, 0.3 + (zone.count * 0.1) + (zone.recentActivity * 0.2));
              
              return (
                <div
                  key={index}
                  className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-xl transition-all duration-1000 ${
                    zone.hasItPlayer ? 'bg-error' : 'bg-primary-500'
                  }`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${((zone.averageLat + 90) / 180) * 100}%`,
                    top: `${((zone.averageLng + 180) / 360) * 100}%`,
                    opacity,
                  }}
                />
              );
            })}

            {/* Recent tag pulses */}
            {recentTags.map(tag => (
              <div
                key={tag.id}
                className="absolute rounded-full bg-error animate-ping"
                style={{
                  width: '16px',
                  height: '16px',
                  left: `${((tag.location.lat + 90) / 180) * 100}%`,
                  top: `${((tag.location.lng + 180) / 360) * 100}%`,
                  opacity: tag.intensity * 0.8,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {/* Current player marker */}
            {currentPlayer?.location && (
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((currentPlayer.location.lat + 90) / 180) * 100}%`,
                  top: `${((currentPlayer.location.lng + 180) / 360) * 100}%`,
                }}
              >
                <div className="relative">
                  <div className="h-6 w-6 rounded-full bg-white border-2 border-primary-500 animate-pulse" />
                  <div className="absolute -top-8">
                    <StatusBadge status={currentPlayer.status} />
                  </div>
                </div>
              </div>
            )}

            {/* Scanning effect */}
            <div className="absolute inset-0 origin-center animate-spin-slow">
              <div className="absolute top-0 left-1/2 bottom-1/2 w-px bg-gradient-to-b from-primary-500/0 to-primary-500/30" />
            </div>

            {/* Map overlay */}
            <div className="absolute bottom-4 left-4 bg-dark-300/90 p-4 rounded-lg">
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
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error animate-ping" />
                  <span className="text-xs text-neutral-300">Recent Tags</span>
                </div>
              </div>
            </div>

            {/* Live indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-dark-300/90 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-white">Live</span>
            </div>
          </div>

          {locationError && (
            <div className="mt-4 p-3 bg-error/20 border border-error/30 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-error mr-2" />
              <p className="text-sm text-white">{locationError}</p>
            </div>
          )}
        </Card>

        {/* Activity List */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          
          {recentTags.length === 0 && Object.values(activityZones).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapIcon className="h-12 w-12 text-neutral-500 mb-4" />
              <p className="text-neutral-400">
                No player activity detected nearby.<br />
                Move around to discover active zones.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recent Tags */}
              {recentTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                    Recent Tags
                  </h3>
                  <div className="space-y-3">
                    {recentTags.map(tag => (
                      <div
                        key={tag.id}
                        className="bg-dark-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 text-error mr-2" />
                          <span className="text-sm text-white">Tag detected</span>
                        </div>
                        <div className="flex items-center text-xs text-neutral-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.round((Date.now() - tag.timestamp.getTime()) / 1000 / 60)}m ago
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Zones */}
              {Object.values(activityZones).map((zone, index) => (
                <div
                  key={index}
                  className="bg-dark-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        zone.hasItPlayer ? 'bg-error' : 'bg-primary-500'
                      }`} />
                      <div>
                        <p className="text-white font-medium">
                          Zone {index + 1}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {zone.count} player{zone.count !== 1 ? 's' : ''} detected
                        </p>
                      </div>
                    </div>
                    {zone.hasItPlayer && (
                      <div className="px-2 py-1 bg-error/20 rounded-full">
                        <span className="text-xs text-error font-medium">
                          Danger Zone
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {zone.recentActivity > 0 && (
                    <div className="mt-2 flex items-center">
                      <Tag className="h-4 w-4 text-error mr-2" />
                      <span className="text-xs text-neutral-400">
                        High tag activity in this zone
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-dark-200 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">About Activity Tracking</h3>
            <p className="text-sm text-neutral-400">
              Tag locations are blurred for privacy. Activity zones show approximate player locations and density.
              Red zones indicate the presence of "It" players or recent tag activity.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;