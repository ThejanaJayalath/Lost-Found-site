import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Lost from './pages/Lost';
import Found from './pages/Found';
import Profile from './pages/Profile';
import CustomerSupport from './pages/CustomerSupport';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import FirstTimeSignupModal from './components/FirstTimeSignupModal';
import MaintenanceModeScreen from './components/MaintenanceModeScreen';
import { getApiBaseUrl } from './services/api';

function Layout({ children, onOpenLogin, onOpenSignup }: any) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {!isAdmin && <Navbar onOpenLogin={onOpenLogin} onOpenSignup={onOpenSignup} />}
      {children}
      {!isAdmin && <Footer />}
    </div>
  );
}

function AppContent() {
  const { user, loading, checkUserProfile } = useAuth();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  const openLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const openSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  // Check if user needs onboarding (missing phone or terms not agreed)
  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading || hasCheckedOnboarding) return;
      
      if (user?.email) {
        const profile = await checkUserProfile(user);
        if (profile) {
          const needsOnboarding = !profile.phoneNumber || !profile.termsAgreed;
          if (needsOnboarding) {
            setIsFirstTimeModalOpen(true);
          }
          setHasCheckedOnboarding(true);
        }
      } else {
        setHasCheckedOnboarding(true);
      }
    };

    checkOnboarding();
  }, [user, loading, checkUserProfile, hasCheckedOnboarding]);

  // Reset check when user logs out
  useEffect(() => {
    if (!user) {
      setHasCheckedOnboarding(false);
      setIsFirstTimeModalOpen(false);
    }
  }, [user]);

  // Check maintenance mode on app load
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/health/maintenance-mode`);
        if (response.ok) {
          const data = await response.json();
          setMaintenanceMode(data.enabled || false);
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
        // Default to false if there's an error
        setMaintenanceMode(false);
      } finally {
        setCheckingMaintenance(false);
      }
    };

    checkMaintenanceMode();
    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceMode, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Show maintenance screen if maintenance mode is enabled and user is not on admin route
  if (!checkingMaintenance && maintenanceMode && !isAdminRoute) {
    return <MaintenanceModeScreen />;
  }

  return (
    <>
      <Layout onOpenLogin={openLogin} onOpenSignup={openSignup}>
        <Routes>
          <Route path="/" element={<Home onOpenLogin={openLogin} />} />
          <Route path="/lost" element={<Lost onOpenLogin={openLogin} />} />
          <Route path="/found" element={<Found onOpenLogin={openLogin} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<CustomerSupport />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Layout>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={openSignup}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={openLogin}
      />
      <FirstTimeSignupModal
        isOpen={isFirstTimeModalOpen}
        onClose={() => {
          setIsFirstTimeModalOpen(false);
          // Re-check after closing to ensure user completed onboarding
          setHasCheckedOnboarding(false);
        }}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
