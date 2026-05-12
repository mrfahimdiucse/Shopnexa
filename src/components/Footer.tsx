import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border-glass py-12 px-10 bg-background-dark/80 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
          <span className="text-slate-400 opacity-80 text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2026 Shopnexa | Secured Digital Investment Platform | Designed By Mr.Fahim
          </span>
        </div>

        <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em]">
          <Link to="/discover" className="text-slate-600 hover:text-brand transition-colors">Discover</Link>
          <Link to="/how-it-works" className="text-slate-600 hover:text-brand transition-colors">Protocol</Link>
          <Link to="/contact" className="text-slate-600 hover:text-brand transition-colors">Support</Link>
          <span className="text-brand/30 animate-pulse italic">Platform Secured</span>
        </div>
      </div>
    </footer>
  );
}
