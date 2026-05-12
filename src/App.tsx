import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";

import { Toaster } from "react-hot-toast";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import InvestorDashboard from "./pages/InvestorDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Discover from "./pages/Discover";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Contact from "./pages/Contact";
import InvestorsInfo from "./pages/InvestorsInfo";
import BusinessOwnersInfo from "./pages/BusinessOwnersInfo";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Axios Config
axios.defaults.baseURL = "/api";
axios.defaults.withCredentials = true;

// Auth Context
interface AuthContextType {
  user: any;
  loading: boolean;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => useContext(AuthContext)!;

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (data: any) => setUser(data);
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      window.location.href = "/login";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-[#F27D26] animate-pulse font-mono uppercase tracking-[0.2em]">Shopnexa ...</div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <BrowserRouter>
        <div className="min-h-screen bg-background-dark text-white selection:bg-brand/30 selection:text-white flex flex-col">
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#0a0a0a',
                color: '#fff',
                border: '1px solid rgba(0, 200, 83, 0.2)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 'bold',
                borderRadius: '12px'
              },
            }}
          />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === "ADMIN" ? "/admin" : (user.role === "INVESTOR" ? "/investor" : "/vendor")} />} />
              <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={user.role === "ADMIN" ? "/admin" : (user.role === "INVESTOR" ? "/investor" : "/vendor")} />} />
              
              <Route path="/discover" element={<Discover />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/investors" element={<InvestorsInfo />} />
              <Route path="/business-owners" element={<BusinessOwnersInfo />} />
              
              <Route path="/investor/*" element={user?.role === "INVESTOR" ? <InvestorDashboard /> : <Navigate to="/login" />} />
              <Route path="/vendor/*" element={user?.role === "VENDOR" ? <VendorDashboard /> : <Navigate to="/login" />} />
              <Route path="/admin/*" element={user?.role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/login" />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
