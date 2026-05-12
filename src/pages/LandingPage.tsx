import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowUpRight, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  Shield,
  Menu,
  X,
  ArrowRight,
  Store,
  Palette,
  Sprout,
  Gem,
  TrendingUp,
  Users
} from "lucide-react";
import { formatCurrency } from "../lib/utils";

const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2000&auto=format&fit=crop",
    alt: "Empower Local Businesses",
    title: "Empower Local Businesses",
    subtitle: "Fueling the engine of the Bangladeshi economy through direct capital flow.",
    tag: "IMPACT"
  },
  {
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop",
    alt: "Secure ROI with Shopnexa",
    title: "Secure ROI with Shopnexa",
    subtitle: "Mathematically optimized ventures designed for consistent, verified growth.",
    tag: "STABILITY"
  },
  {
    url: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop",
    alt: "Community Driven Growth",
    title: "Community Driven Growth",
    subtitle: "Join a network of thousands empowering local Bangladeshi entrepreneurs.",
    tag: "COMMUNITY"
  }
];

export default function LandingPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % carouselImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/investments");
      setPlans(res.data);
    } catch (err) {
      console.error("Nexus sync failure", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark transition-colors duration-500 overflow-x-hidden font-sans">
      <div className="relative min-h-[100vh] rounded-b-[4rem] overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Faded Map Background with Gold Sparkles */}
          <div className="absolute inset-0 bg-background-dark">
            <img 
              src="https://images.unsplash.com/photo-1536431311719-398b6704d40f?q=80&w=2000&auto=format&fit=crop" 
              alt="City Map Pattern"
              className="w-full h-full object-cover opacity-20 grayscale brightness-50 mix-blend-overlay"
            />
            {/* Sparkles effect */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-radial from-brand/10 to-transparent opacity-60 pointer-events-none" />
            
            <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-transparent to-background-dark pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-background-dark opacity-80 pointer-events-none" />
          </div>
          
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')` }}
          />
        </div>

        {/* Hero Section Container */}
        <main className="relative w-full px-4 sm:px-6 pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          
          {/* Header Text Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="text-center max-w-4xl mb-8 sm:mb-12 md:mb-16 lg:mb-20 z-20"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-4 sm:mb-6 md:mb-8 tracking-tighter uppercase italic px-2">
              Empowering Bangladesh <br className="hidden sm:block"/><span className="text-brand">through local investment.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 font-bold font-serif italic tracking-wide max-w-2xl sm:max-w-3xl mx-auto border-t border-white/5 pt-4 sm:pt-6 md:pt-8 px-2 sm:px-4">
              "বাংলাদেশের স্থানীয় বিনিয়োগে ক্ষমতায়ন। আপনার যাত্রা এখানে শুরু হোক।"
            </p>
          </motion.div>

          {/* Carousel Section */}

          {/* Mobile Simple Carousel */}
          <div className="lg:hidden relative w-full max-w-md sm:max-w-2xl h-64 sm:h-80 z-20 px-0 sm:px-4 mx-auto">
            <AnimatePresence mode="wait">
              {carouselImages.map((img, i) => i === activeImage && (
                <motion.div
                  key={img.url}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full h-full rounded-[2rem] overflow-hidden relative border border-white/10"
                >
                  <img src={img.url} className="w-full h-full object-cover brightness-50" alt={img.alt} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark p-6 flex flex-col justify-end">
                    <span className="text-brand text-[8px] font-black uppercase tracking-[0.4em] mb-2">{img.tag}</span>
                    <h4 className="text-white font-black text-xl uppercase italic leading-none mb-4">{img.title}</h4>
                    <Link to="/signup" className="w-full bg-brand text-background-dark py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">Start Investing</Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              {carouselImages.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${activeImage === i ? "bg-brand w-4" : "bg-white/20"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Reconstructed Curved Card Carousel (Desktop/Tablet) */}
          <div className="hidden lg:flex relative w-full max-w-6xl mx-auto h-80 xl:h-96 z-20 items-center justify-center lg:mt-12">
            <AnimatePresence mode="popLayout">
              {carouselImages.slice(0, 3).map((img, i) => {
                let diff = (i - activeImage) % 3;
                if (diff < 0) diff += 3;
                
                const isMain = diff === 0;
                const isSec1 = diff === 1;
                const isTwo = diff === 2;

                const getStyle = () => {
                  if (isMain) return { left: '50%', translateX: '-50%', width: '40%', zIndex: 50, opacity: 1, scale: 1, rounded: '2.5rem', rotate: '0deg' };
                  if (isSec1) return { left: '70%', translateX: '-50%', width: '32%', zIndex: 40, opacity: 0.75, scale: 0.85, rounded: '2.2rem', rotate: '3deg' };
                  if (isTwo) return { left: '30%', translateX: '-50%', width: '32%', zIndex: 40, opacity: 0.75, scale: 0.85, rounded: '2.2rem', rotate: '-3deg' };
                  return { left: '50%', translateX: '-50%', width: '0%', zIndex: 0, opacity: 0, scale: 0, rounded: '0rem', rotate: '0deg' };
                };

                const style = getStyle();
                const plan = plans.find(p => p.imageUrl === img.url) || { title: img.title, minAmount: 150000, profitPercentage: 22 };

                return (
                  <motion.div
                    key={img.url}
                    layout
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ 
                      left: style.left,
                      transform: style.translateX ? `translateX(${style.translateX})` : 'none',
                      width: style.width, 
                      zIndex: style.zIndex, 
                      opacity: style.opacity, 
                      scale: style.scale,
                      rotate: style.rotate
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute h-full overflow-hidden bg-[#001C3D] shadow-[30px_60px_100px_-20px_rgba(0,0,0,0.8)] border-4 md:border-6 border-white/5 cursor-pointer group"
                    style={{ borderRadius: style.rounded }}
                    onClick={() => setActiveImage(i)}
                  >
                    <img 
                      src={img.url} 
                      alt={img.alt} 
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" 
                    />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001C3D] via-transparent to-transparent p-10 flex flex-col justify-end">
                      <div className="mb-4">
                        <span className="text-brand text-[9px] font-black uppercase tracking-[0.4em] mb-2 block">{img.tag}</span>
                        <h4 className="text-white font-black text-xl lg:text-2xl uppercase italic tracking-tighter leading-none mb-1">
                           {img.title}
                        </h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          {img.subtitle}
                        </p>
                      </div>

                      {isMain && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-between items-end border-t border-white/10 pt-6 mt-4"
                        >
                          <Link 
                            to="/discover" 
                            className="bg-brand text-[#001C3D] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:scale-110 transition-all shadow-xl shadow-brand/40 whitespace-nowrap"
                          >
                            Explore Opportunities
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Dynamic Venture Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-16 bg-background-dark">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
            <div>
              <span className="text-brand text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-2 sm:mb-4 block">LIVE MARKETS</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">Explore active ventures</h2>
            </div>
            <Link 
              to="/discover" 
              className="group flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors whitespace-nowrap"
            >
              View Global Market <ChevronRight size={12} sm:size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {!loading && plans.length === 0 ? (
            <div className="py-16 sm:py-20 md:py-24 border border-dashed border-white/10 rounded-2xl sm:rounded-3xl md:rounded-[3rem] text-center">
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[9px] sm:text-[10px]">New ventures arriving soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
              {plans.slice(0, 9).map((plan) => (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative bg-[#0a0a0a] border border-white/5 rounded-xl sm:rounded-2xl md:rounded-[2rem] overflow-hidden hover:border-brand/30 transition-all duration-500 shadow-2xl hover:shadow-brand/5 min-h-[420px] sm:min-h-[440px] md:min-h-[480px] flex flex-col"
                >
                  {/* Card Image Area */}
                  <div className="h-32 sm:h-40 md:h-44 lg:h-48 relative overflow-hidden">
                    <img 
                      src={plan.imageUrl || "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=800&auto=format&fit=crop"} 
                      alt={plan.title}
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="bg-brand/20 backdrop-blur-md text-brand text-[6px] sm:text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.3em] border border-brand/30">VERIFIED</span>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-base sm:text-lg md:text-xl leading-tight sm:leading-none mb-1 uppercase tracking-tighter text-white group-hover:text-brand transition-colors line-clamp-2">{plan.title}</h4>
                      <p className="text-slate-500 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 line-clamp-1">AUTHORIZED BY {plan.vendor?.name || 'Local Partner'}</p>
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 border-y border-white/5 py-2">
                        <div>
                          <span className="text-[6px] sm:text-[7px] uppercase text-slate-600 font-black tracking-[0.2em] block mb-0.5 sm:mb-1 italic">THRESHOLD</span>
                          <span className="text-[9px] sm:text-xs font-mono font-bold text-white">{formatCurrency(plan.minAmount)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[6px] sm:text-[7px] uppercase text-slate-600 font-black tracking-[0.2em] block mb-0.5 sm:mb-1 italic">BACKERS</span>
                          <div className="flex items-center justify-end gap-1">
                            <Users size={6} className="text-brand" />
                            <span className="text-[9px] sm:text-xs font-mono font-bold text-white">{plan.backers || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end gap-2">
                      <div>
                        <span className="text-[6px] sm:text-[7px] uppercase text-slate-600 font-black tracking-[0.2em] block italic">ROI</span>
                        <span className="text-brand font-black text-lg sm:text-xl md:text-2xl leading-none italic tracking-tighter">+{plan.profitPercentage}%</span>
                      </div>
                      <Link 
                        to={`/signup`}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand text-[#001C3D] text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-white transition-all shadow-xl shadow-brand/20 whitespace-nowrap"
                      >
                        Invest
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
