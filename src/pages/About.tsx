import React from "react";
import { motion } from "motion/react";
import { Shield, Target, Users, Map } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Security",
      desc: "We employ advanced encryption and verification protocols to protect your assets and data in the digital nexus."
    },
    {
      icon: Target,
      title: "Precision",
      desc: "Our vetting process ensures only the most viable and ambitious local ventures receive funding opportunities."
    },
    {
      icon: Users,
      title: "Community",
      desc: "Shopnexa is built on the belief that shared prosperity leads to a stronger, more resilient Bangladesh."
    },
    {
      icon: Map,
      title: "Localization",
      desc: "We focus exclusively on the Bangladeshi market, understanding its unique challenges and immense potential."
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
              <span className="text-[10px] text-brand font-black uppercase tracking-[0.4em] italic">Our Vision</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
              Fueling the <br/><span className="text-brand">Future of Equity</span> In Bangladesh
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
              Shopnexa isn't just an investment platform; it's a movement to localize capital and empower the heartbeat of our nation—the local entrepreneurs and small business owners.
            </p>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="relative aspect-square rounded-[3rem] overflow-hidden group"
          >
             <img 
               src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" 
               alt="Vision" 
               className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
             />
             <div className="absolute inset-0 bg-brand/20 mix-blend-overlay group-hover:bg-transparent transition-all duration-1000"></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 hover:border-brand/30 transition-all group"
            >
              <v.icon size={32} className="text-brand mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4 italic">{v.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center py-24 border-y border-white/5">
           <h2 className="text-4xl lg:text-8xl font-black text-white/5 uppercase italic tracking-tighter select-none mb-12">OUR MISSION</h2>
           <p className="max-w-4xl mx-auto text-2xl lg:text-3xl font-serif text-brand font-bold italic tracking-wide text-center leading-relaxed">
             "বাংলাদেশের স্থানীয় বিনিয়োগে ক্ষমতায়ন। আপনার যাত্রা এখানে শুরু হোক।"
           </p>
           <p className="mt-8 text-slate-500 text-sm font-black uppercase tracking-[0.3em] italic">Shopnexa Foundation - Dhaka, 2026</p>
        </div>
      </div>
    </div>
  );
}
