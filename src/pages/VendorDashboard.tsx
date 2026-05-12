import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../App";
import { formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Loader2, Store, Users, BarChart3, Trash2, PieChart, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: "", minAmount: "", profitPercentage: "", duration: "", imageUrl: "" });
  const [stats, setStats] = useState({ totalInvestors: 0, activeFunds: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPlan({ ...newPlan, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/investments/vendor-stats");
      setPlans(res.data.plans);
      setInvestments(res.data.investments);
      const uniqueBackers = new Set(res.data.investments.map((i: any) => i.userId)).size;
      setStats({ 
        totalInvestors: uniqueBackers,
        activeFunds: Number(res.data.activeAssets || 0)
      });
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating investment plan...");
    try {
      await axios.post("/investments", newPlan);
      setShowCreate(false);
      setNewPlan({ title: "", minAmount: "", profitPercentage: "", duration: "", imageUrl: "" });
      fetchPlans();
      toast.success("Investment plan created successfully", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to create plan", { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this investment plan?")) return;
    const loadingToast = toast.loading("Removing plan...");
    try {
      await axios.delete(`/investments/${id}`);
      fetchPlans();
      toast.success("Plan removed successfully", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to remove plan", { id: loadingToast });
    }
  };

  if (loading) return <div className="p-12 text-center text-white/20">LOADING VENDOR PORTAL...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 grid grid-cols-12 gap-8 pb-24">
      {/* Sidebar Column */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
        <div className="bg-brand text-white p-10 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="z-10">
            <h2 className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Total Assets</h2>
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight font-mono">{formatCurrency(stats.activeFunds)}</span>
              <span className="text-white/80 text-[10px] font-bold mt-1 uppercase tracking-wider italic">Capital Flow</span>
            </div>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="z-10 w-full px-6 py-3 bg-white hover:bg-slate-100 text-black rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <Plus size={16} /> Create Plan
          </button>
          <BarChart3 size={120} className="absolute -right-10 -bottom-10 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>

        <div className="glass-card p-6 space-y-6">
          <div>
            <h2 className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4">Vendor Ecosystem</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim font-bold uppercase tracking-widest">Active Plans</span>
                <span className="text-white font-mono font-bold">{plans.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim font-bold uppercase tracking-widest">Total Backers</span>
                <span className="text-brand font-mono font-bold">{stats.totalInvestors}</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-2 text-text-dim italic text-[11px]">
              <Store size={14} className="text-brand" />
              <span>{user.name} Official Store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
        {/* Investment Plans */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold tracking-tight text-white uppercase">Venture Management</h3>
            <span className="text-[10px] text-brand font-bold uppercase tracking-widest px-2 py-1 bg-brand/5 border border-brand/20 rounded">
              High Availability
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan: any) => (
              <motion.div 
                key={plan.id} 
                whileHover={{ y: -5, rotateX: 2, rotateY: 2 }}
                className="glass-card flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Venture Image */}
                <div className="h-32 w-full overflow-hidden relative">
                   <img 
                    src={plan.imageUrl || "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=800&auto=format&fit=crop"} 
                    alt={plan.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                </div>

                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-xl"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="z-10 p-6 pt-0 mt-[-10px]">
                  <h4 className="font-black text-lg leading-tight uppercase tracking-tighter mb-1 text-white">{plan.title}</h4>
                  <p className="text-text-dim text-[8px] font-black uppercase tracking-widest mb-4">Launched {new Date(plan.createdAt).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric" })}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-black border border-white/5 rounded-xl flex flex-col">
                      <span className="text-[7px] text-text-dim uppercase font-bold tracking-widest">Threshold</span>
                      <span className="text-[10px] font-bold font-mono text-white">{formatCurrency(plan.minAmount)}</span>
                    </div>
                    <div className="p-3 bg-black border border-white/5 rounded-xl flex flex-col">
                      <span className="text-[7px] text-text-dim uppercase font-bold tracking-widest">Growth Target</span>
                      <span className="text-[10px] font-bold font-mono text-brand">+{plan.profitPercentage}%</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-border-glass flex justify-between items-center z-10">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-text-dim uppercase font-bold tracking-widest">Cycle Term</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">{plan.duration} Days Lock</span>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-900 border border-black flex items-center justify-center">
                        <Users size={10} className="text-slate-600" />
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/20 flex items-center justify-center text-brand text-[8px] font-black italic">
                      +{new Set(investments.filter((i: any) => i.planId === plan.id).map((i: any) => i.userId)).size}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors"></div>
              </motion.div>
            ))}
            {plans.length === 0 && (
              <div className="col-span-full py-20 bg-[#0a0a0a] border border-dashed border-border-glass rounded-3xl flex flex-col items-center justify-center text-text-dim">
                <Users size={32} className="mb-4 opacity-10" />
                <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-40">No active plans found</p>
              </div>
            )}
          </div>
        </section>

        {/* Backers Activity */}
        <section className="flex flex-col gap-6">
          <h3 className="text-xl font-bold tracking-tight text-white uppercase">Active Backers</h3>
          <div className="glass-card overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-[#0a0a0a] text-text-dim text-[10px] uppercase tracking-[0.3em] font-black border-b border-border-glass">
                      <tr>
                         <th className="px-8 py-6">Investor Node</th>
                         <th className="px-8 py-6">Tier</th>
                         <th className="px-8 py-6">Capital</th>
                         <th className="px-8 py-6">End Date</th>
                         <th className="px-8 py-6">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-glass">
                      {investments.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-brand/[0.02] transition-colors border-none text-xs">
                          <td className="px-8 py-5">
                             <div className="flex flex-col">
                               <span className="text-white font-bold uppercase tracking-tight">{inv.user?.name}</span>
                               <span className="text-text-dim text-[8px] font-bold tracking-widest">{inv.user?.email}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-brand font-bold uppercase tracking-widest text-[10px]">{inv.plan?.title}</span>
                          </td>
                          <td className="px-8 py-5 font-mono font-bold text-white italic">{formatCurrency(inv.amount)}</td>
                          <td className="px-8 py-5 text-text-dim font-bold uppercase tracking-widest">{new Date(inv.endDate).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td className="px-8 py-5">
                             <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                                {inv.status}
                             </span>
                          </td>
                        </tr>
                      ))}
                      {investments.length === 0 && (
                        <tr>
                           <td colSpan={5} className="px-8 py-10 text-center text-text-dim font-bold uppercase tracking-widest italic opacity-50">
                              Waiting for initial capital flow...
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </section>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#050505] border border-white/10 p-10 rounded-2xl w-full max-w-md relative shadow-2xl"
            >
              <button onClick={() => setShowCreate(false)} className="absolute right-6 top-6 text-text-dim hover:text-white transition-colors"><X size={20} /></button>
              
              <div className="mb-10">
                <h3 className="text-2xl font-bold tracking-tight mb-1 uppercase text-white">New Investment Plan</h3>
                <p className="text-[10px] text-brand uppercase tracking-[0.3em] font-bold">Authorized Plan Creation</p>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-6 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim block mb-2">Plan Title</label>
                  <input 
                    type="text" required
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-xl px-6 py-4 text-sm font-bold tracking-tight focus:border-brand focus:outline-none transition-all placeholder:text-slate-800 text-white"
                    placeholder="e.g. Strategic Expansion Tier A"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim block mb-2">Min Amount (৳)</label>
                    <input 
                      type="number" required step="0.01"
                      value={newPlan.minAmount}
                      onChange={(e) => setNewPlan({ ...newPlan, minAmount: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-4 text-xs font-mono font-bold focus:border-brand focus:outline-none text-white text-center"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim block mb-2">Profit Target (%)</label>
                    <input 
                      type="number" required step="0.01"
                      value={newPlan.profitPercentage}
                      onChange={(e) => setNewPlan({ ...newPlan, profitPercentage: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-xl px-4 py-4 text-xs font-mono font-bold text-brand focus:border-brand focus:outline-none text-center"
                      placeholder="ROI"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim block mb-2">Duration (Days)</label>
                  <input 
                    type="number" required
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-xl px-4 py-4 text-xs font-mono font-bold focus:border-brand focus:outline-none text-white text-center"
                    placeholder="Lock Period"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim block mb-2">Venture Image (URL or Upload)</label>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="text"
                      value={newPlan.imageUrl}
                      onChange={(e) => setNewPlan({ ...newPlan, imageUrl: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-xl px-6 py-4 text-[10px] font-mono focus:border-brand focus:outline-none text-white"
                      placeholder="https://images.com/venture.jpg"
                    />
                    <div className="relative">
                      <input 
                        type="file" accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full py-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase font-black text-text-dim hover:bg-white/5 transition-colors">
                        {newPlan.imageUrl.startsWith("data:") ? "Image Uploaded Successfully" : "Click to Upload File (Max 2MB)"}
                      </div>
                    </div>
                  </div>
                  {newPlan.imageUrl && (
                    <div className="mt-4 h-24 w-full rounded-xl overflow-hidden border border-white/10">
                      <img src={newPlan.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>

                <button type="submit" className="glow-button w-full px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.3em] flex items-center justify-center gap-2">
                  PUBLISH INVESTMENT PLAN <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
