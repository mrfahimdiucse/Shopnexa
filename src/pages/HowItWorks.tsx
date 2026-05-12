import React from "react";
import { motion } from "motion/react";
import { UserPlus, Wallet, TrendingUp, ArrowDownToLine, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Account",
      desc: "Join our platform for free. All users undergo a quick verification to ensure a safe investment ecosystem for every Bangladeshi.",
      color: "brand"
    },
    {
      icon: Wallet,
      title: "Add Funds",
      desc: "Deposit Taka easily via bKash or Nagad. Your funds are instantly ready to be used for local business growth.",
      color: "brand"
    },
    {
      icon: TrendingUp,
      title: "Start Investing",
      desc: "Browse dozens of small-business sectors and choose where to put your money. Your investment fuels our local economy.",
      color: "brand"
    },
    {
      icon: ArrowDownToLine,
      title: "Earn Profit",
      desc: "Watch your investment grow in real-time. Once the business cycle completes, your initial capital plus profit is returned to you.",
      color: "brand"
    }
  ];

  return (
    <div className="min-h-screen bg-background-dark py-24 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1 bg-brand/10 border border-brand/20 rounded-full mb-6"
          >
            <span className="text-[10px] text-brand font-black uppercase tracking-[0.4em] italic">Protocol Guide</span>
          </motion.div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-white uppercase italic leading-none mb-8">
            The <span className="text-brand">Workflow</span> of Wealth
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Shopnexa bridges the gap between ambitious local entrepreneurs and visionary investors. 
            Follow our streamlined protocol to start your journey.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-[150px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/20 to-transparent z-0"></div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-background-dark border-4 border-white/5 rounded-[2rem] flex items-center justify-center text-brand mb-10 group-hover:border-brand/40 group-hover:shadow-[0_0_40px_rgba(0,200,83,0.2)] transition-all duration-500 transform group-hover:-translate-y-2">
                <step.icon size={32} />
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-brand text-[#001C3D] rounded-full flex items-center justify-center font-black italic text-sm border-4 border-background-dark">
                  0{i + 1}
                </div>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-brand transition-colors">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 glass-card border-brand/10 bg-brand/[0.02] flex flex-col lg:flex-row items-center justify-between gap-12"
        >
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Ready to Start?</h2>
            <p className="text-slate-400 text-sm font-medium">
              Join the thousands of Bangladeshi citizens fueling the growth of our nation's local industries.
            </p>
          </div>
          <Link 
            to="/signup"
            className="px-12 py-6 bg-brand text-[#001C3D] font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-brand/20 flex items-center gap-4"
          >
            START INVESTING <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
