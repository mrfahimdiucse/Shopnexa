import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { LogOut, LayoutDashboard, User, Shield, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatCurrency } from "../lib/utils";
import axios from "axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        try {
          const response = await axios.get('/api/auth/me');
          setBalance(response.data.walletBalance || 0);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          // Fallback to user balance from context if fetch fails
          setBalance(user.walletBalance || 0);
        }
      };
      fetchBalance();
    }
  }, [user]);

  const isLanding = location.pathname === "/";

  const navLinks = [
    { name: "Discover Investments", path: "/discover" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <nav className={`h-24 flex items-center justify-between px-6 lg:px-20 sticky top-0 z-[100] transition-all duration-300 ${
      isLanding && !isMenuOpen ? "bg-transparent absolute left-0 right-0 border-none" : "bg-background-dark/95 backdrop-blur-xl border-b border-white/5"
    }`}>
      <Link to="/" className="flex items-center gap-4 group">
        <div className="flex flex-col">
          <span className="font-black tracking-tighter text-2xl uppercase text-white leading-none">Shopnexa</span>
          <span className="text-[8px] uppercase tracking-[0.4em] font-black text-brand mt-1">Digital Platform</span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-10">
        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="hidden md:flex items-center gap-6">
            {user.role === "ADMIN" && (
              <Link 
                to="/admin" 
                className="text-[10px] uppercase tracking-[0.2em] font-black text-brand border border-brand/20 bg-brand/5 px-4 py-2 rounded-xl hover:bg-brand/10 transition-all"
              >
                ADMIN PANEL
              </Link>
            )}
            <Link 
              to={user.role === "ADMIN" ? "/admin" : (user.role === "INVESTOR" ? "/investor" : "/vendor")} 
              className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300 hover:text-brand transition-all flex items-center gap-2"
            >
              <LayoutDashboard size={14} /> DASHBOARD
            </Link>
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="text-right">
                  <p className="text-brand font-black font-mono text-sm leading-none italic tracking-tighter">{formatCurrency(balance)}</p>
              </div>
              <button 
                onClick={logout}
                className="w-10 h-10 rounded-xl border border-white/5 bg-red-500/5 flex items-center justify-center text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-300 hover:text-white transition-colors">LOGIN / SIGN UP</Link>
            <Link to="/signup" className="text-[10px] uppercase tracking-[0.3em] font-black bg-brand text-[#001C3D] px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-xl shadow-brand/20">SIGN UP</Link>
          </div>
        )}

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-24 left-0 right-0 bg-background-dark border-b border-white/10 p-8 flex flex-col gap-8 lg:hidden z-[99]"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-black uppercase tracking-widest text-slate-300 hover:text-brand"
              >
                {link.name}
              </Link>
            ))}
            {!user ? (
              <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs font-black uppercase tracking-widest text-white py-4 text-center border border-white/10 rounded-xl"
                >
                  LOGIN / SIGN UP
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs font-black uppercase tracking-widest text-[#001C3D] py-4 text-center bg-brand rounded-xl"
                >
                  SIGN UP
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                <Link 
                  to={user.role === "ADMIN" ? "/admin" : (user.role === "INVESTOR" ? "/investor" : "/vendor")}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs font-black uppercase tracking-widest text-brand py-4 text-center border border-brand/20 bg-brand/5 rounded-xl"
                >
                  MY DASHBOARD
                </Link>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="text-xs font-black uppercase tracking-widest text-red-500 py-4 text-center border border-red-500/20 bg-red-500/5 rounded-xl"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
