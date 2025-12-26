import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Lost from './pages/Lost';
import Found from './pages/Found';
import Profile from './pages/Profile';
import CustomerSupport from './pages/CustomerSupport';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';

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

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const openSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  return (
    <AuthProvider>
      <Router>
        <Layout onOpenLogin={openLogin} onOpenSignup={openSignup}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lost" element={<Lost onOpenLogin={openLogin} onOpenSignup={openSignup} />} />
            <Route path="/found" element={<Found onOpenLogin={openLogin} onOpenSignup={openSignup} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/support" element={<CustomerSupport />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
