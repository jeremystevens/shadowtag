import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { currentPlayer } = useGameStore();

  if (!currentPlayer || !currentPlayer.isAdmin) {
    return <Navigate to="/game" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;