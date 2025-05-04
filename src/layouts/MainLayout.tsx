import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import MobileNav from '../components/game/MobileNav';
import { useGameStore } from '../store/gameStore';

const MainLayout = () => {
  const { currentPlayer } = useGameStore();
  
  return (
    <div className="flex flex-col min-h-screen bg-dark-400 text-white">
      <Navbar />
      <main className="flex-grow pb-20 md:pb-0">
        <Outlet />
      </main>
      {currentPlayer && <MobileNav />}
      <Footer className="hidden md:block" />
    </div>
  );
};

export default MainLayout;