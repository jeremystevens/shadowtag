import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentPlayer } = useGameStore();
  const location = useLocation();

  if (!currentPlayer) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;