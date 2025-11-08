import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { BusProvider } from './contexts/busDataContexts';
import { ConductorProvider } from './contexts/conductorDataContext';
import { RouteProvider } from './contexts/RouteDataContext';
import { SearchProvider } from './contexts/searchContext';
import { SeatProvider } from './contexts/seatSelectionContext';

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
import { BookingProvider } from './contexts/BookingContext';
import { OwnerProvider } from './contexts/OwnerContext';

// Helper to get correct dashboard route
const getDashboardRoute = (role: string) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'owner': return '/owner';
    case 'conductor': return '/conductor';
    case 'agent': return '/agent';
    default: return '/search';
  }
};

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

          {/* Protected routes */}
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

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
       
          <BusProvider>
            <ConductorProvider>
              <RouteProvider>
                <SearchProvider>
                  {/* ✅ Move Router INSIDE SeatProvider */}
                  <SeatProvider>
                    <BookingProvider>
                      <OwnerProvider>
                         <AuthProvider>

                       <Router>
                        <AppContent />
                      </Router>
                         </AuthProvider>
                      </OwnerProvider>
                    </BookingProvider>
                  </SeatProvider>
                </SearchProvider>
              </RouteProvider>
            </ConductorProvider>
          </BusProvider>
        
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
