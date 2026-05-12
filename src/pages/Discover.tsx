import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, TrendingUp, Users, ArrowRight } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

export default function Discover() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/investments");
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((plan: any) => 
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background-dark py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 md:space-y-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 border-b border-white/5 pb-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase italic leading-none mb-3 sm:mb-4">
              Discover <span className="text-brand">Investments</span>
            </h1>
            <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-relaxed">
              Browse through a curated list of local ventures seeking capital growth. 
              Deploy your assets into the most promising Bangladeshi nodes.
            </p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} sm:size={18} />
            <input 
              type="text"
              placeholder="FILTER VENTURES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-16 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
            />
          </div>
        </div>

        {/* Loader Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="min-h-[420px] sm:min-h-[440px] md:min-h-[480px] bg-white/5 animate-pulse rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPlans.map((plan: any) => (
                <motion.div 
                  key={plan.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card group relative overflow-hidden flex flex-col min-h-[420px] sm:min-h-[440px] md:min-h-[480px]"
                >
                  {/* Card Image Area */}
                  <div className="h-32 sm:h-40 md:h-44 lg:h-48 relative overflow-hidden">
                    <img 
                      src={plan.imageUrl || "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=800&auto=format&fit=crop"} 
                      alt={plan.title}
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="bg-brand/20 backdrop-blur-md text-brand text-[6px] sm:text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.3em] border border-brand/30">VERIFIED</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <h4 className="font-black text-base sm:text-lg md:text-xl leading-tight sm:leading-none mb-1 uppercase tracking-tighter text-white group-hover:text-brand transition-colors line-clamp-2">{plan.title}</h4>
                      <p className="text-slate-500 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] mb-3 sm:mb-4">Partnership with {plan.vendor?.name}</p>
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 border-y border-white/5 py-2">
                        <div className="flex flex-col">
                          <span className="text-[6px] sm:text-[7px] uppercase text-slate-500 font-black tracking-[0.3em] italic mb-0.5 sm:mb-1">Minimum Goal</span>
                          <span className="text-[9px] sm:text-xs font-mono font-black text-white italic">{formatCurrency(plan.minAmount)}</span>
                        </div>
                        <div className="flex flex-col items-end text-right">
                          <span className="text-[6px] sm:text-[7px] uppercase text-slate-500 font-black tracking-[0.3em] italic mb-0.5 sm:mb-1">Backers</span>
                          <div className="flex items-center gap-1 justify-end">
                            <Users size={6} className="text-brand" />
                            <span className="text-[9px] sm:text-xs font-mono font-black text-brand italic">+{plan.backers || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-end gap-2">
                        <div className="flex flex-col">
                          <span className="text-[6px] sm:text-[7px] uppercase text-slate-500 font-black tracking-[0.3em] italic">ROI TARGET</span>
                          <span className="text-brand font-black text-lg sm:text-xl md:text-2xl leading-none italic tracking-tighter">+{plan.profitPercentage}%</span>
                        </div>
                          <Link 
                            to="/signup"
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand text-[#001C3D] text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-white transition-all shadow-xl shadow-brand/20 flex items-center gap-2 whitespace-nowrap"
                          >
                            INVEST <ArrowRight size={10} />
                          </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredPlans.length === 0 && (
          <div className="py-16 sm:py-20 md:py-24 text-center border border-dashed border-white/10 rounded-2xl sm:rounded-3xl md:rounded-[3rem]">
            <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em]">No Ventures Match Your Search Criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
