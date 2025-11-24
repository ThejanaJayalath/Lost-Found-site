import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Lost from './pages/Lost';
import Found from './pages/Found';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';

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
        <div className="flex flex-col min-h-screen font-sans">
          <Navbar onOpenLogin={openLogin} onOpenSignup={openSignup} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lost" element={<Lost onOpenLogin={openLogin} />} />
            <Route path="/found" element={<Found onOpenLogin={openLogin} />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Footer />
        </div>
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
