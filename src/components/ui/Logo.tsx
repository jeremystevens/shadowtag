import { Tag } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "h-6 w-6" }: LogoProps) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <div className="absolute inset-0 bg-primary-600 rounded-full opacity-30 animate-pulse-slow"></div>
      <div className="relative z-10">
        <Tag className="text-primary-500" />
      </div>
    </div>
  );
};

export default Logo;