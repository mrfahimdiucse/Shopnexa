import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../App";
import { formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Shield, CheckCircle, XCircle, Clock, Search, RefreshCw, Mail, User as UserIcon, BarChart3, TrendingUp as TrendingIcon, Activity, Users as UsersIcon, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

type AdminTab = "OVERVIEW" | "MONITOR";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("OVERVIEW");
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "OVERVIEW") {
        const [pendingRes, statsRes] = await Promise.all([
          axios.get("/transactions/pending"),
          axios.get("/transactions/stats")
        ]);
        setPendingTransactions(pendingRes.data);
        setStats(statsRes.data);
      } else {
        const [usersRes, logsRes, plansRes] = await Promise.all([
          axios.get("/admin/users"),
          axios.get("/admin/logs"),
          axios.get("/investments")
        ]);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
        setPlans(plansRes.data);
      }
    } catch (err) {
      toast.error("Nexus system synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApprove = async (tx: any) => {
    const actionName = tx.type === 'WITHDRAW' ? "Confirming payout..." : "Verifying and localizing funds...";
    const loadingToast = toast.loading(actionName);
    try {
      await axios.post(`/transactions/approve/${tx.id}`);
      const successMsg = tx.type === 'WITHDRAW' ? "Withdrawal confirmed successfully" : "Transaction successfully authenticated";
      toast.success(successMsg, { id: loadingToast });
      fetchData();
    } catch (err) {
      toast.error("Approval protocol failed", { id: loadingToast });
    }
  };

  const handleReject = async (tx: any) => {
    const actionName = tx.type === 'WITHDRAW' ? "Rejecting and refunding..." : "Discarding transaction...";
    const loadingToast = toast.loading(actionName);
    try {
      await axios.post(`/transactions/reject/${tx.id}`);
      const successMsg = tx.type === 'WITHDRAW' ? "Withdrawal rejected & Capital refunded" : "Transaction discarded successfully";
      toast.success(successMsg, { id: loadingToast });
      fetchData();
    } catch (err) {
      toast.error("Rejection protocol failed", { id: loadingToast });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const loadingToast = toast.loading("Updating user authority...");
    try {
      await axios.patch(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User access ${newStatus === 'ACTIVE' ? 'restored' : 'suspended'}`, { id: loadingToast });
      fetchData();
    } catch (err) {
      toast.error("Authority update failed", { id: loadingToast });
    }
  };

  const handleDeleteVenture = async (id: string) => {
    if (!confirm("Permanently destroy this venture node and all associated data mappings?")) return;
    const loadingToast = toast.loading("Executing deletion protocol...");
    try {
      await axios.delete(`/admin/ventures/${id}`);
      toast.success("Venture node successfully purged", { id: loadingToast });
      fetchData();
    } catch (err) {
      toast.error("Purge protocol failed. Node may have active dependencies.", { id: loadingToast });
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center bg-red-500/10 border border-red-500/20 p-12 rounded-3xl max-w-md">
          <XCircle size={48} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Access Restricted</h2>
          <p className="text-text-dim text-sm italic font-medium leading-relaxed">
            Your authorization level is insufficient for this terminal. Only Shopnexa Nexus Administrators may access this portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-12 gap-6 bg-background-dark border border-border-glass p-6 sm:p-8 rounded-[2rem] relative overflow-hidden backdrop-blur-xl">
        <div className="z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] border border-brand/20">Admin Panel</span>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">System Online</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-white italic">Nexus <span className="text-brand">Command</span></h1>
          <div className="flex items-center gap-4 mt-4">
             <button 
              onClick={() => setActiveTab("OVERVIEW")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-brand text-background-dark' : 'text-text-dim hover:text-white bg-white/5'}`}
             >
               Overview
             </button>
             <button 
              onClick={() => setActiveTab("MONITOR")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MONITOR' ? 'bg-brand text-background-dark' : 'text-text-dim hover:text-white bg-white/5'}`}
             >
               System Monitor
             </button>
          </div>
        </div>
        
        <button 
          onClick={fetchData}
          className="z-10 flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-text-dim hover:text-white"
        >
          {loading ? <RefreshCw className="animate-spin text-brand" size={16} /> : <RefreshCw size={16} className="text-brand" />}
          Re-Sync Node
        </button>

        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield size={200} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "OVERVIEW" ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8"
          >
            {/* Overview Content (Existing) */}
            <div className="w-full lg:col-span-4 space-y-6 order-2 lg:order-1">
              <div className="bg-slate-900/40 border border-border-glass p-6 sm:p-8 rounded-3xl backdrop-blur-xl">
                <h3 className="text-[10px] uppercase font-black tracking-widest text-text-dim mb-6 flex items-center gap-2">
                  <BarChart3 size={14} className="text-brand" /> Market Liquidity
                </h3>
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-dim font-bold uppercase tracking-widest mb-1">Total Deployed Capital</span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-white italic tracking-tighter">{formatCurrency(stats?.totalCapital || 0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Total ROI Distributed</span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-500 italic tracking-tighter">{formatCurrency(stats?.totalROI || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-border-glass p-6 sm:p-8 rounded-3xl backdrop-blur-xl h-[350px] sm:h-[500px]">
                <h3 className="text-[10px] uppercase font-black tracking-widest text-text-dim mb-6 flex items-center gap-2">
                  <TrendingIcon size={14} className="text-brand" /> Capital Deployment By Venture
                </h3>
                <div className="h-full pb-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical"
                      data={stats?.plans || []}
                      margin={{ left: 20, right: 30, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="title" 
                        type="category"
                        stroke="#ffffff20" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#64748b' }}
                        width={80}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                        formatter={(value: any) => [formatCurrency(value), "Deployed Capital"]}
                      />
                      <Bar dataKey="totalCapital" radius={[0, 4, 4, 0]} barSize={20}>
                        {stats?.plans?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill="#00C853" fillOpacity={0.8 - (index * 0.1)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="w-full lg:col-span-8 order-1 lg:order-2">
              <div className="bg-slate-900/40 border border-border-glass rounded-[2rem] overflow-hidden backdrop-blur-xl">
                <div className="px-6 sm:px-8 py-6 border-b border-border-glass flex items-center justify-between">
                  <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-white flex items-center gap-2">
                    <CheckCircle size={14} className="text-brand" /> Verification Queue
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] lg:min-w-0">
                    <thead>
                      <tr className="bg-white/[0.02]">
                        <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">Origin Node</th>
                        <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">Type</th>
                        <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">Value</th>
                        <th className="px-8 py-4 text-right text-[8px] font-black uppercase tracking-widest text-text-dim">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-12 text-center text-white/20 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Syncing Cryptographic Data...</td>
                        </tr>
                      ) : pendingTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <CheckCircle size={48} className="text-emerald-500/20 mx-auto mb-4" />
                            <p className="text-text-dim text-xs font-bold uppercase tracking-widest">Queue Clear. No pending authorizations.</p>
                          </td>
                        </tr>
                      ) : (
                        pendingTransactions.map((tx) => (
                          <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center">
                                  <UserIcon size={14} className="text-text-dim" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-white font-black text-[10px] uppercase tracking-tighter">{tx.user?.name}</span>
                                  <span className="text-text-dim text-[8px] font-bold lowercase tracking-widest">{tx.user?.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 uppercase tracking-widest text-[8px] font-black">
                               <span className={tx.type === 'DEPOSIT' ? 'text-emerald-500' : 'text-red-500'}>{tx.type}</span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-white font-black font-mono text-sm italic">{formatCurrency(tx.amount)}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleReject(tx)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">
                                  REJECT
                                </button>
                                <button onClick={() => handleApprove(tx)} className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">
                                  APPROVE
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="monitor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* System Monitor Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* User Management */}
               <div className="bg-slate-900/40 border border-border-glass rounded-[2rem] overflow-hidden backdrop-blur-xl">
                  <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                     <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-white flex items-center gap-2">
                        <UsersIcon size={14} className="text-brand" /> User Management
                     </h2>
                  </div>
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                     <table className="w-full">
                        <thead className="sticky top-0 bg-background-dark z-10">
                           <tr className="bg-white/[0.02]">
                              <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">Identity</th>
                              <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">Balance</th>
                              <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">Status</th>
                              <th className="px-8 py-4 text-right text-[8px] font-black uppercase tracking-widest text-text-dim">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {users.map(u => (
                              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                 <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                       <span className="text-white font-black text-[10px] uppercase tracking-tighter">{u.name}</span>
                                       <span className="text-text-dim text-[8px] font-bold lowercase tracking-widest">{u.email}</span>
                                       <span className="text-brand/60 text-[7px] font-black uppercase tracking-widest">[{u.role}]</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 font-mono text-white text-[10px] font-bold">
                                    {formatCurrency(u.walletBalance)}
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded inline-block ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                       {u.status}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <button 
                                      onClick={() => toggleUserStatus(u.id, u.status)}
                                      className={`p-2 rounded-lg transition-all ${u.status === 'ACTIVE' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                    >
                                       {u.status === 'ACTIVE' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Activity Logs */}
               <div className="bg-slate-900/40 border border-border-glass rounded-[2rem] overflow-hidden backdrop-blur-xl">
                  <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                     <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-white flex items-center gap-2">
                        <Activity size={14} className="text-brand" /> System Activity Logs
                     </h2>
                  </div>
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                     <div className="p-8 space-y-4">
                        {logs.map(log => (
                           <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                              <div className="w-10 h-10 rounded-lg bg-background-dark border border-white/5 flex items-center justify-center shrink-0">
                                 <Activity size={14} className="text-brand opacity-50 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white">{log.action}</span>
                                    <span className="text-[7px] font-bold text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                                 </div>
                                 <p className="text-[10px] text-text-dim leading-relaxed font-medium">{log.details}</p>
                              </div>
                           </div>
                        ))}
                        {logs.length === 0 && (
                           <div className="text-center py-12 text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
                              No Activity Logged Yet
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Venture Management */}
            <div className="bg-slate-900/40 border border-border-glass rounded-[2rem] overflow-hidden backdrop-blur-xl">
               <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-white flex items-center gap-2">
                     <TrendingIcon size={14} className="text-brand" /> Active Ventures Management
                  </h2>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="bg-white/[0.02]">
                           <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">Venture</th>
                           <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">Vendor</th>
                           <th className="px-8 py-4 text-left text-[8px] font-black uppercase tracking-widest text-text-dim">ROI</th>
                           <th className="px-8 py-4 text-right text-[8px] font-black uppercase tracking-widest text-text-dim">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {plans.map(p => (
                           <tr key={p.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                       <img src={p.imageUrl} alt="" className="w-full h-full object-cover grayscale" />
                                    </div>
                                    <span className="text-white font-black text-[10px] uppercase tracking-tighter">{p.title}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-[8px] font-bold text-text-dim uppercase tracking-widest">
                                 {p.vendor?.name}
                              </td>
                              <td className="px-8 py-5 font-mono text-brand text-[10px] font-black italic">
                                 +{p.profitPercentage}%
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <button 
                                   onClick={() => handleDeleteVenture(p.id)}
                                   className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
