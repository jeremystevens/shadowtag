import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Tag, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const LoginPage = () => {
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentPlayer } = useGameStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // If user is already logged in, redirect to game page
  if (currentPlayer) {
    navigate('/game');
    return null;
  }
  
  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    
    if (!codename.trim() || !password.trim()) {
      setError('Please enter both codename and password');
      setIsLoading(false);
      return;
    }
    
    try {
      const { success, error: loginError } = await login(codename, password);
      
      if (success) {
        // Get the intended destination from state, or default to /game
        const destination = location.state?.from?.pathname || '/game';
        navigate(destination);
      } else {
        setError(loginError || 'Failed to log in. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-dark-300">
            <Tag className="h-8 w-8 text-primary-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Log in to continue your game
          </p>
        </div>
        
        <Card>
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-error/20 border border-error/30 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-error mr-2 flex-shrink-0" />
                <p className="text-sm text-white">{error}</p>
              </div>
            )}
            
            <Input
              label="Codename"
              type="text"
              value={codename}
              onChange={(e) => setCodename(e.target.value)}
              placeholder="Enter your codename"
              fullWidth
              required
              autoFocus
              aria-label="Codename"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                fullWidth
                required
                aria-label="Password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-neutral-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <Button
              onClick={handleLogin}
              fullWidth
              isLoading={isLoading}
            >
              Log In
            </Button>
            
            <div className="flex items-center justify-between">
              <Link
                to="/signup"
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                Create an account
              </Link>
              
              <button
                className="text-sm text-neutral-400 hover:text-white"
                onClick={() => {
                  // Placeholder for password reset
                  alert('Password reset functionality coming soon!');
                }}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;