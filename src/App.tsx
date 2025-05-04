import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useGameStore } from './store/gameStore';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Button from './components/ui/Button';

function App() {
  const { initialized, initGame, isLoading, error, clearError } = useGameStore();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      initGame();
    }
  }, [initialized, initGame]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-400">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-primary-500 mb-4" />
          <p className="text-neutral-400">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-400 p-4">
        <div className="bg-dark-300 p-6 rounded-lg max-w-md w-full text-center">
          <div className="text-error mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-neutral-400 mb-4">{error}</p>
          <Button onClick={clearError}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="login" element={<LoginPage />} />
          
          <Route path="game" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <GamePage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="map" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <MapPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <ProfilePage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="leaderboard" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <LeaderboardPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="admin" element={
            <AdminRoute>
              <ErrorBoundary>
                <AdminPage />
              </ErrorBoundary>
            </AdminRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;