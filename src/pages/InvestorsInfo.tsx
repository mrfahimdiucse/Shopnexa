import React from "react";
import { motion } from "motion/react";
import { TrendingUp, Shield, BarChart4, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function InvestorsInfo() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Local Market ROI",
      desc: "Tap into the high-growth potential of Bangladeshi SMEs and local industries, sectors traditionally difficult for individual investors to enter."
    },
    {
      icon: Shield,
      title: "Asset Verification",
      desc: "Every business node on Shopnexa is thoroughly vetted. We ensure that your capital is backing legitimate, high-potential ventures."
    },
    {
      icon: BarChart4,
      title: "Nexus Credit System",
      desc: "Our unique internal ledger system allows for instant deployment and seamless harvesting of wealth without manual bank delays."
    },
    {
      icon: Globe,
      title: "Diversified Portfolio",
      desc: "From textiles in Narayanganj to tech hubs in Dhaka, diversify your investments across multiple sectors through a single interface."
    }
  ];

  return (
    <div className="min-h-screen bg-background-dark py-24 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <span className="text-[10px] text-brand font-black uppercase tracking-[0.4em] italic">Investor Portal</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
              Secure Your <br/><span className="text-brand">Future Participation</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
              Shopnexa provides a direct conduit for your capital to reach the most vibrant sectors of the Bangladeshi economy. Eliminate middlemen and secure direct equity in growth.
            </p>
            <div className="flex gap-6">
               <Link to="/signup" className="px-10 py-5 bg-brand text-[#001C3D] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-brand/20 transition-all hover:scale-105">START INVESTING</Link>
               <Link to="/discover" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white/10">Browse Ventures</Link>
            </div>
          </motion.div>
          
          <div className="relative group">
             <div className="absolute -inset-4 bg-brand/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <motion.div 
               initial={{ opacity: 0, rotate: 5 }}
               animate={{ opacity: 1, rotate: 0 }}
               className="relative glass-card p-12 border-brand/20"
             >
                <TrendingUp size={64} className="text-brand mb-8" />
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">Transparency <br/>By Design</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                  Every transaction is recorded in the Nexus Ledger, providing you with real-time auditability of your capital deployment and profit accumulation.
                </p>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                   <div className="h-full bg-brand w-[75%] animate-pulse"></div>
                </div>
             </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {benefits.map((b, i) => (
             <div key={i} className="p-12 glass-card flex flex-col items-start hover:bg-brand/[0.02] transition-colors group">
                <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-8 group-hover:scale-110 transition-transform">
                   <b.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{b.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{b.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
