import React from "react";
import { motion } from "motion/react";
import { Zap, Rocket, Users, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function BusinessOwnersInfo() {
  const features = [
    {
      icon: Rocket,
      title: "Rapid Liquidity",
      desc: "Access capital faster than traditional banking systems. Our community of investors is ready to fuel validated business expansion."
    },
    {
      icon: Zap,
      title: "Wide Exposure",
      desc: "Get your business in front of thousands of potential backers. Shopnexa serves as a digital showroom for Bangladeshi excellence."
    },
    {
      icon: Users,
      title: "Direct Equity",
      desc: "Sell parts of your business's future profit potential (equity) directly to the people of Bangladesh, fostering a sense of shared ownership."
    },
    {
      icon: Lock,
      title: "Secure Protocols",
      desc: "Our platform manages the complex legal and financial layers of crowdsourced investment, allowing you to focus on your core business."
    }
  ];

  return (
    <div className="min-h-screen bg-background-dark py-24 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
          <div className="relative order-2 lg:order-1">
             <div className="absolute -inset-10 bg-brand/10 blur-[120px] rounded-full"></div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative glass-card p-12 border-brand/20 bg-brand/[0.03]"
             >
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-[#001C3D] font-black text-2xl italic">S</div>
                   <div>
                      <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Simple Process</h3>
                      <p className="text-brand text-[8px] font-black uppercase tracking-[0.4em] mt-2 italic">Standardized Growth</p>
                   </div>
                </div>
                <div className="space-y-6">
                   {[
                     "Scale Production Capacity",
                     "Expand Delivery Logistics",
                     "Renovate Physical Stores",
                     "Launch Digital Presence"
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-brand"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{item}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div className="inline-block px-4 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <span className="text-[10px] text-brand font-black uppercase tracking-[0.4em] italic">Business Portal</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
              Scale Your <br/><span className="text-brand">Local Vision</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
              Are you a local business owner looking to take your venture to the next level? Shopnexa provides the tools and the audience to secure non-debt capital through fractional equity.
            </p>
            <div className="flex gap-6">
               <Link to="/signup" className="px-10 py-5 bg-brand text-[#001C3D] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-brand/20 transition-all hover:scale-105">Join as Vendor</Link>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {features.map((f, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-10 glass-card hover:border-brand/40 transition-colors"
             >
                <f.icon size={28} className="text-brand mb-6" />
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-4 leading-none">{f.title}</h3>
                <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{f.desc}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
