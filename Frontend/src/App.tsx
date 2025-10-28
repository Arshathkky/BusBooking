import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { BusProvider } from './contexts/busDataContexts';
import { ConductorProvider } from './contexts/conductorDataContext';
import { RouteProvider } from './contexts/RouteDataContext';
import { SearchProvider } from './contexts/searchContext'; // ✅ import SearchProvider

import Header from './components/Header';
import AgentDashboard from './pages/AgentDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ConductorDashboard from './pages/ConductorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import BusSearch from './pages/BusSearch';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import './index.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#fdc106]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to={getDashboardRoute(user.role)} />} />
          <Route path="/search" element={<BusSearch />} />
          <Route path="/seat-selection/:busId" element={<SeatSelection />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/passenger-details" element={<PassengerDetails />} />
          <Route path="/payment" element={<Payment />} />

          {/* Protected Routes */}
          <Route path="/agent" element={user?.role === 'agent' ? <AgentDashboard /> : <Navigate to="/login" />} />
          <Route path="/owner" element={user?.role === 'owner' ? <OwnerDashboard /> : <Navigate to="/login" />} />
          <Route path="/conductor" element={user?.role === 'conductor' ? <ConductorDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />

          <Route path="/" element={user ? <Navigate to={getDashboardRoute(user.role)} /> : <BusSearch />} />
        </Routes>
      </main>
    </div>
  );
};

const getDashboardRoute = (role: string) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'owner': return '/owner';
    case 'conductor': return '/conductor';
    case 'agent': return '/agent';
    default: return '/search';
  }
};

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <BusProvider> 
            <ConductorProvider>
              <RouteProvider>
                <SearchProvider> {/* ✅ Added here */}
                  <Router>
                    <AppContent />
                  </Router>
                </SearchProvider>
              </RouteProvider>
            </ConductorProvider>
          </BusProvider>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
