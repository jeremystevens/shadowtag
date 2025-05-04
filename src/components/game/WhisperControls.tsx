import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const PREDEFINED_MESSAGES = [
  "I see you 👀",
  "You're next.",
  "Don't trust them.",
  "Behind you...",
  "Run while you can.",
  "They're watching.",
  "Not who you think.",
  "Look around.",
];

const WhisperControls = () => {
  const { currentPlayer, nearbyPlayers, sendWhisper } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!currentPlayer || currentPlayer.hasUsedWhisper) return null;
  
  const handleSendWhisper = async () => {
    if (!selectedPlayer || !message.trim()) return;
    
    setError(null);
    setIsSending(true);
    
    try {
      const success = await sendWhisper(selectedPlayer, message.trim());
      if (success) {
        setSelectedPlayer(null);
        setMessage('');
      } else {
        setError('Failed to send whisper. Try again later.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const selectedPlayerData = nearbyPlayers.find(p => p.id === selectedPlayer);
  
  return (
    <div className="bg-dark-200 p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
          One-Time Whisper
        </h3>
        <MessageCircle className="h-5 w-5 text-secondary-500" />
      </div>
      
      <p className="text-xs text-neutral-400 mb-4">
        Send one anonymous message to a nearby player. Choose wisely - you only get one whisper per season!
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-error/20 border border-error/30 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 text-error mr-2" />
          <p className="text-sm text-white">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Target Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Select Target
          </label>
          {nearbyPlayers.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {nearbyPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedPlayer === player.id
                      ? 'bg-secondary-500/20 border-2 border-secondary-500'
                      : 'bg-dark-300 border-2 border-transparent hover:border-secondary-500/50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-dark-100 rounded-full flex items-center justify-center font-mono text-xs text-neutral-300 mr-2">
                      {player.codename.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {player.codename}
                      </div>
                      <div className="text-xs text-neutral-400">
                        Click to select
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 bg-dark-300 rounded-lg">
              <p className="text-sm text-neutral-400">
                No players nearby to whisper to
              </p>
            </div>
          )}
        </div>
        
        {/* Message Selection */}
        {selectedPlayer && (
          <div className="space-y-4">
            <div className="p-2 bg-dark-300 rounded-lg text-sm">
              <span className="text-neutral-400">Sending to: </span>
              <span className="text-white font-mono">{selectedPlayerData?.codename}</span>
            </div>
            
            {/* Predefined Messages */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Quick Messages
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PREDEFINED_MESSAGES.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(msg)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      message === msg
                        ? 'bg-secondary-500/20 border-2 border-secondary-500'
                        : 'bg-dark-300 border-2 border-transparent hover:border-secondary-500/50'
                    }`}
                  >
                    <span className="text-white">{msg}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Or Write Custom Message
              </label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your anonymous message..."
                maxLength={100}
              />
              
              <div className="text-xs text-neutral-500 text-right mt-1">
                {message.length}/100 characters
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="secondary"
          onClick={handleSendWhisper}
          isLoading={isSending}
          disabled={!selectedPlayer || !message.trim() || isSending}
          fullWidth
        >
          Send Anonymous Whisper
        </Button>
      </div>
    </div>
  );
};

export default WhisperControls;