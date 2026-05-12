import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { motion } from "motion/react";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/auth/login", { email, password });
      login(res.data.user);
      const role = res.data.user.role;
      if (role === "ADMIN") navigate("/admin");
      else if (role === "INVESTOR") navigate("/investor");
      else navigate("/vendor");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background-dark">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-12 space-y-10 relative overflow-hidden bg-black border-border-glass rounded-[2.5rem]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-alt"></div>
        <div className="space-y-3 text-center">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Login</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black flex items-center justify-center gap-3">
            WELCOME BACK <LogIn size={12} className="text-brand" />
          </p>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-2 block">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-border-glass rounded-2xl px-6 py-4 text-sm font-bold tracking-tight text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                placeholder="NAME@DOMAIN.COM"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-2 block">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-border-glass rounded-2xl px-6 py-4 text-sm font-bold tracking-tight text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="glow-button w-full px-6 py-4 rounded-xl text-[10px] tracking-[0.4em] font-black flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "LOGIN TO MY ACCOUNT"}
          </button>
        </form>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] font-black text-slate-600 pt-6">
          Unregistered? <Link to="/signup" className="text-brand hover:text-brand-alt transition-colors">Sign Up Here</Link>
        </p>
      </motion.div>
    </div>
  );
}
