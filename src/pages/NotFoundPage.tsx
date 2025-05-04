import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-error mb-6" />
      
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-neutral-300 mb-6">Page Not Found</p>
      
      <p className="text-neutral-400 max-w-md mx-auto mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/">
        <Button>
          Return Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;