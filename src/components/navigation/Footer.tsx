import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import Logo from '../ui/Logo';

interface FooterProps {
  className?: string;
}

const Footer = ({ className = '' }: FooterProps) => {
  return (
    <footer className={`bg-dark-300 border-t border-dark-100 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo className="h-6 w-auto" />
            <span className="ml-2 text-lg font-semibold">ShadowTag</span>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div className="text-center md:text-left">
              <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">About</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-neutral-400 hover:text-white transition-colors">
                    How to Play
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-neutral-400 hover:text-white transition-colors">
                    Rules
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-neutral-400 hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-2">Community</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/leaderboard" className="text-neutral-400 hover:text-white transition-colors">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors flex items-center justify-center md:justify-start space-x-1"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-dark-100 pt-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm mb-2 sm:mb-0 text-center sm:text-left">
            &copy; {new Date().getFullYear()} ShadowTag. All rights reserved.
          </p>
          <p className="text-neutral-500 text-sm text-center sm:text-right">
            Built with <span className="text-secondary-500">♥</span> in the shadows
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer