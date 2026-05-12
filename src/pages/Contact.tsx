import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, Mail, MapPin, Phone, MessageSquare, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Investment Inquiry",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/contact", formData);
      setSubmitted(true);
      toast.success("Transmission successful. Our team will contact you shortly.");
    } catch (err) {
      toast.error("Signal interference detected. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md w-full border-emerald-500/30"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-500/20">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Transmission <span className="text-brand">Received</span></h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed mb-8">Your inquiry has been successfully localized and added to our priority queue.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Send Another Message
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark py-24 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="inline-block px-4 py-1 bg-brand/10 border border-brand/20 rounded-full">
                <span className="text-[10px] text-brand font-black uppercase tracking-[0.4em] italic">Support Nexus</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
                Get In <br/><span className="text-brand">Touch</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Have questions about the venture nodes or the Nexus integrity? Our team is standing by to assist you.
              </p>
            </motion.div>

            <div className="space-y-8">
              {[
                { icon: Mail, label: "Official Communications", info: "nexus@shopnexa.com.bd" },
                { icon: Phone, label: "Direct Support", info: "+880 1700-000000" },
                { icon: MapPin, label: "Operations Hub", info: "Gulshan-2, Dhaka, Bangladesh" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-6 group"
                >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-brand border border-white/5 group-hover:bg-brand group-hover:text-[#001C3D] transition-all">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-white tracking-tight">{item.info}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-brand to-transparent"></div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legal Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="ENTER NAME..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-xs font-bold text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Email</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="ENTER EMAIL..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-xs font-bold text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-xs font-bold text-white focus:border-brand focus:outline-none transition-all"
                  >
                    <option>Investment Inquiry</option>
                    <option>Business Partnership</option>
                    <option>Technical Support</option>
                    <option>Others</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Message</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="TYPE YOUR MESSAGE..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-xs font-bold text-white focus:border-brand focus:outline-none transition-all placeholder:text-slate-800 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-[#001C3D] py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-brand/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "SEND MESSAGE"} <Send size={14} />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
