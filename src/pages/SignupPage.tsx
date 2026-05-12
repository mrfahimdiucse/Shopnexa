import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";
import { motion } from "motion/react";
import { UserPlus, Loader2, Landmark, Store } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "INVESTOR"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/auth/signup", formData);
      login(res.data.user);
      navigate(res.data.user.role === "INVESTOR" ? "/investor" : "/vendor");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background-dark">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl glass-card p-12 space-y-10 relative overflow-hidden bg-black border-border-glass rounded-[2.5rem]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-alt"></div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Sign Up</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black flex items-center gap-3">
            START YOUR JOURNEY <UserPlus size={12} className="text-brand" />
          </p>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-400 p-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-2 block">Legal Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-border-glass rounded-2xl px-6 py-4 text-sm font-bold tracking-tight text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                placeholder="JOHN DOE"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-2 block">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-border-glass rounded-2xl px-6 py-4 text-sm font-bold tracking-tight text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                placeholder="NAME@DOMAIN.COM"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-3 block text-center">I want to be an...</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, role: "INVESTOR" })}
                className={`flex flex-col items-center gap-4 p-8 border rounded-3xl transition-all ${formData.role === "INVESTOR" ? "border-brand bg-brand/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "border-border-glass bg-transparent hover:border-slate-700"}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.role === "INVESTOR" ? "bg-brand text-black" : "bg-slate-900 text-slate-600"}`}>
                  <Landmark size={24} />
                </div>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${formData.role === "INVESTOR" ? "text-brand" : "text-slate-500"}`}>Investor</span>
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, role: "VENDOR" })}
                className={`flex flex-col items-center gap-4 p-8 border rounded-3xl transition-all ${formData.role === "VENDOR" ? "border-brand bg-brand/5 shadow-[0_0_20_rgba(249,115,22,0.1)]" : "border-border-glass bg-transparent hover:border-slate-700"}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.role === "VENDOR" ? "bg-brand text-black" : "bg-slate-900 text-slate-600"}`}>
                  <Store size={24} />
                </div>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${formData.role === "VENDOR" ? "text-brand" : "text-slate-500"}`}>Vendor</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-2 block text-center">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-border-glass rounded-2xl px-6 py-4 text-sm font-bold tracking-tight text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="glow-button w-full px-6 py-4 rounded-xl text-[10px] tracking-[0.4em] font-black flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "CREATE MY ACCOUNT"}
          </button>
        </form>

        <p className="text-center text-[10px] uppercase tracking-[0.3em] font-black text-slate-600 pt-6">
          Identified? <Link to="/login" className="text-brand hover:text-brand-alt transition-colors">Authorize Here</Link>
        </p>
      </motion.div>
    </div>
  );
}
