import { PlayerStatus } from '../../store/gameStore';

interface StatusBadgeProps {
  status: PlayerStatus;
  showText?: boolean;
  className?: string;
}

const StatusBadge = ({ status, showText = true, className = '' }: StatusBadgeProps) => {
  let bgColor = '';
  let textColor = '';
  let label = '';
  let animationClass = '';
  
  switch (status) {
    case 'neutral':
      bgColor = 'bg-primary-600';
      textColor = 'text-primary-100';
      label = 'Neutral';
      break;
    case 'it':
      bgColor = 'bg-error';
      textColor = 'text-white';
      label = 'It';
      animationClass = 'animate-glow';
      break;
    case 'out':
      bgColor = 'bg-neutral-700';
      textColor = 'text-neutral-300';
      label = 'Out';
      break;
    default:
      bgColor = 'bg-gray-500';
      textColor = 'text-white';
      label = 'Unknown';
  }
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className={`h-3 w-3 rounded-full ${bgColor} ${animationClass} mr-2`}></div>
      {showText && <span className={`text-xs font-semibold ${textColor}`}>{label}</span>}
    </div>
  );
};

export default StatusBadge;