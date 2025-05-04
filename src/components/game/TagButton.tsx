import { useState } from 'react';
import { useGameStore, Player } from '../../store/gameStore';

interface TagButtonProps {
  targetPlayer: Player;
  onSuccess?: () => void;
  className?: string;
}

const TagButton = ({ targetPlayer, onSuccess, className = '' }: TagButtonProps) => {
  const { currentPlayer, tagPlayer } = useGameStore();
  const [isTagging, setIsTagging] = useState(false);
  
  // Only show tag button if current player is "it" and target is "neutral"
  if (!currentPlayer || 
      currentPlayer.status !== 'it' || 
      targetPlayer.status !== 'neutral') {
    return null;
  }
  
  const handleTag = () => {
    setIsTagging(true);
    
    // Simulate tag delay
    setTimeout(() => {
      const success = tagPlayer(targetPlayer.id);
      setIsTagging(false);
      
      if (success && onSuccess) {
        onSuccess();
      }
    }, 1500);
  };
  
  return (
    <button
      onClick={handleTag}
      disabled={isTagging}
      className={`relative overflow-hidden bg-error hover:bg-error/90 disabled:bg-neutral-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-95 ${className}`}
    >
      {isTagging ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Tagging...</span>
        </div>
      ) : (
        <>
          <span className="relative z-10">TAG {targetPlayer.codename}!</span>
          <div className="absolute inset-0 bg-error animate-pulse-slow opacity-50"></div>
        </>
      )}
    </button>
  );
};

export default TagButton;