import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useGameStore, AVATARS } from '../store/gameStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const SignupPage = () => {
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, currentPlayer } = useGameStore();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to game page
  if (currentPlayer) {
    navigate('/game');
    return null;
  }
  
  const handleSignup = async () => {
    setError('');
    setIsLoading(true);
    
    // Validate codename
    if (!codename.trim()) {
      setError('Codename is required');
      setIsLoading(false);
      return;
    }
    
    if (codename.length < 3 || codename.length > 16) {
      setError('Codename must be between 3 and 16 characters');
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(codename)) {
      setError('Codename can only contain letters, numbers, and underscores');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const { success, error: signupError } = await signup(codename, password, selectedAvatar);
      
      if (success) {
        navigate('/game');
      } else {
        setError(signupError || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
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
          <h2 className="mt-6 text-3xl font-bold text-white">Join ShadowTag</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Create your player profile to start competing
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
              placeholder="Choose a unique codename"
              fullWidth
              required
              autoFocus
              maxLength={16}
              aria-label="Codename"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                fullWidth
                required
                aria-label="Password"
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

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Choose Avatar
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`group relative aspect-square rounded-lg overflow-hidden transition-all ${
                      selectedAvatar === avatar.id
                        ? 'ring-2 ring-primary-500 scale-105'
                        : 'hover:ring-2 hover:ring-primary-500/50 hover:scale-105'
                    }`}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.label}
                      className="w-full h-full object-contain bg-dark-200 p-2"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-dark-400/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white font-medium pb-2">
                        {avatar.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleSignup}
              fullWidth
              isLoading={isLoading}
            >
              Create Account
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-neutral-500">Already have an account? </span>
              <a href="/login" className="text-primary-500 hover:text-primary-400">
                Log in
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;