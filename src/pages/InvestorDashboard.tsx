import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../App";
import { formatCurrency } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Wallet, Plus, TrendingUp, History, List, X, Loader2, ArrowRight, CheckCircle, Menu } from "lucide-react";
import { toast } from "react-hot-toast";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts";

export default function InvestorDashboard() {
  const { user, login } = useAuth();
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState<any>({ transactions: [], investments: [] });
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: "", method: "bKash", trxID: "" });
  const [investingPlan, setInvestingPlan] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "bKash", address: "" });
  const [liveProfits, setLiveProfits] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
    
    // Notify about matured investments
    if (user?.maturedResults?.length > 0) {
      user.maturedResults.forEach((res: any) => {
        toast.success(`Success: Your investment in ${res.planTitle} has matured. ${formatCurrency(res.totalReturn)} added to your balance.`, { duration: 6000 });
      });
    }

    // Live profit update interval
    const interval = setInterval(() => {
      if (history.investments?.length > 0) {
        const newProfits: Record<string, number> = {};
        history.investments.forEach((inv: any) => {
          newProfits[inv.id] = calculateLiveProfit(inv);
        });
        setLiveProfits(newProfits);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.maturedResults]);

  const calculateLiveProfit = (investment: any) => {
    if (investment.status !== "ACTIVE") return 0;
    const start = new Date(investment.startDate).getTime();
    const end = new Date(investment.endDate).getTime();
    const now = Date.now();
    
    const totalDuration = end - start;
    const elapsed = now - start;
    
    if (elapsed >= totalDuration) return (Number(investment.amount) * Number(investment.plan?.profitPercentage || 0)) / 100;
    const progress = Math.max(0, elapsed / totalDuration);
    
    return (Number(investment.amount) * Number(investment.plan?.profitPercentage || 0) / 100) * progress;
  };

  const getProgress = (investment: any) => {
    if (investment.status === "MATURED") return 100;
    const start = new Date(investment.startDate).getTime();
    const end = new Date(investment.endDate).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const fetchData = async () => {
    try {
      const [plansRes, historyRes] = await Promise.all([
        axios.get("/investments"),
        axios.get("/transactions/history")
      ]);
      setPlans(plansRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!history.transactions || history.transactions.length === 0) return [];
    
    // Process successful transactions to show real portfolio growth
    const successfulTx = history.transactions
      .filter((tx: any) => tx.status === "SUCCESS" || tx.status === "MATURED")
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    let cumulativePortfolioValue = 0;
    
    // Group transactions by date to avoid spikes for multiple transactions on same day
    const dailyData: Record<string, number> = {};
    
    successfulTx.forEach((tx: any) => {
      const amount = Number(tx.amount);
      const date = new Date(tx.createdAt).toLocaleDateString("en-BD", { 
        month: "short", 
        day: "numeric" 
      });

      if (tx.type === 'DEPOSIT') {
        cumulativePortfolioValue += amount;
      } else if (tx.type === 'WITHDRAW') {
        cumulativePortfolioValue -= amount;
      } else if (tx.type === 'SYSTEM_CREDIT') {
        // SYSTEM_CREDIT usually represents maturity return
        // We find the corresponding investment to extract the profit portion
        const matchingInvestment = history.investments.find((inv: any) => 
          new Date(inv.endDate).getTime() <= new Date(tx.createdAt).getTime() + 10000 &&
          inv.status === "MATURED" &&
          // Approximate check if amount equals principal + profit
          Math.abs(Number(inv.amount) * (1 + Number(inv.plan?.profitPercentage || 0) / 100) - amount) < 1
        );

        if (matchingInvestment) {
          const profit = amount - Number(matchingInvestment.amount);
          cumulativePortfolioValue += profit; // Add only the appreciation
        } else {
          // Fallback: If we can't map it, assume it's external credit (like a bonus)
          // or if it's the first time maturity is recorded let's just treat it as new value
          // But for strict portfolio growth, we should be careful about double counting principal
          // If we can't find investment, it might be a manual admin credit
          cumulativePortfolioValue += amount;
        }
      }
      // Note: 'INVEST' is neutral for portfolio value (wallet -> asset)
      
      dailyData[date] = cumulativePortfolioValue;
    });

    const data = Object.entries(dailyData).map(([date, value]) => ({
      date,
      value: Math.round(value)
    }));

    // Add immediate zero point if no history
    if (data.length === 0) return [{ date: 'Today', value: 0 }];
    if (data.length === 1) {
      const firstDate = new Date(successfulTx[0].createdAt);
      const prevDate = new Date(firstDate);
      prevDate.setDate(firstDate.getDate() - 1);
      return [
        { date: prevDate.toLocaleDateString("en-BD", { month: "short", day: "numeric" }), value: 0 },
        ...data
      ];
    }

    return data;
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing deposit request...");
    try {
      await axios.post("/transactions/deposit", depositForm);
      setShowDeposit(false);
      setDepositForm({ amount: "", method: "bKash", trxID: "" });
      fetchData();
      toast.success("Deposit request PENDING", { id: loadingToast });
    } catch (err) {
      toast.error("Deposit failed", { id: loadingToast });
    }
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Starting investment...");
    try {
      await axios.post("/transactions/invest", { planId: investingPlan.id, amount: investAmount });
      setInvestingPlan(null);
      setInvestAmount("");
      fetchData();
      const userRes = await axios.get("/auth/me");
      login(userRes.data);
      toast.success("Investment started successfully", { id: loadingToast });
    } catch (err: any) {
      const message = err.response?.data?.message || "Investment failed";
      toast.error(message, { id: loadingToast });
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Submitting withdrawal request...");
    try {
      await axios.post("/transactions/withdraw", withdrawForm);
      setShowWithdraw(false);
      setWithdrawForm({ amount: "", method: "bKash", address: "" });
      fetchData();
      const userRes = await axios.get("/auth/me");
      login(userRes.data);
      toast.success("Withdrawal request PENDING", { id: loadingToast });
    } catch (err: any) {
      const message = err.response?.data?.message || "Withdrawal failed";
      toast.error(message, { id: loadingToast });
    }
  };

  if (loading) return <div className="p-12 text-center text-white/20 font-black uppercase tracking-widest animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8 pb-24">
      {/* Sidebar Column */}
      <div className="w-full lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
        <div className="bg-gradient-to-br from-brand to-brand-alt text-white p-6 sm:p-10 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-brand/20">
          <div className="z-10">
            <h2 className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mb-1">Digital Balance</h2>
            <div className="flex flex-col">
              <span className="text-3xl font-black italic tracking-tighter font-mono">{formatCurrency(user.walletBalance)}</span>
              <span className="text-white/80 text-[10px] font-black mt-1 uppercase tracking-[0.2em] italic">Available Liquidity</span>
            </div>
          </div>
          <div className="z-10 grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowDeposit(true)}
              className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all uppercase tracking-[0.2em] shadow-xl"
            >
              <Plus size={14} /> Deposit
            </button>
            <button 
              onClick={() => setShowWithdraw(true)}
              className="w-full py-4 bg-black text-white border border-white/20 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-[0.2em] backdrop-blur-sm shadow-xl"
            >
              <ArrowRight size={14} className="rotate-180" /> Withdraw
            </button>
          </div>
          <Wallet size={120} className="absolute -right-10 -bottom-10 opacity-20 rotate-12" />
        </div>

        <div className="glass-card p-8 flex flex-col gap-6">
          <h2 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em]">Portfolio Metrics</h2>
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-4xl font-black italic tracking-tighter text-white">{history.investments.length}</span>
              <span className="text-brand text-[10px] font-black uppercase tracking-[0.2em]">Active Ventures</span>
            </div>
            <div className="h-[2px] w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-brand w-[65%]" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-[8px] text-text-dim uppercase font-black tracking-[0.3em]">Deployed Capital</p>
                <p className="font-mono text-lg font-black text-white italic tracking-tighter">{formatCurrency(history.investments.reduce((acc: number, i: any) => acc + Number(i.amount), 0))}</p>
              </div>
              <div>
                <p className="text-[8px] text-emerald-500 uppercase font-black tracking-[0.3em]">Live Earnings</p>
                <p className="font-mono text-lg font-black text-emerald-500 italic tracking-tighter">
                  {formatCurrency(Object.values(liveProfits).reduce((a: number, b: number) => a + b, 0))}
                </p>
              </div>
              <div>
                <p className="text-[8px] text-text-dim uppercase font-black tracking-[0.3em]">Projected Total Return</p>
                <p className="font-mono text-lg font-black text-white italic tracking-tighter">
                  {formatCurrency(history.investments.reduce((acc: number, i: any) => acc + (Number(i.amount) * (1 + Number(i.plan?.profitPercentage || 0) / 100)), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full lg:col-span-9 flex flex-col gap-6 sm:gap-8 order-1 lg:order-2">
        {/* Growth Chart */}
        <section className="glass-card p-4 sm:p-8 min-h-[350px] sm:min-h-[400px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tighter uppercase text-white italic">Portfolio <span className="text-brand">Growth</span></h3>
              <p className="text-[8px] text-text-dim font-black uppercase tracking-[0.2em] mt-1">Real-time asset appreciation</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand/5 border border-brand/20 rounded-full">
               <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
               <span className="text-[9px] text-brand font-black uppercase tracking-widest">Live Ledger</span>
            </div>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(val) => `৳${val > 1000 ? (val/1000).toFixed(0)+'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#00C853', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00C853" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Active Nodes Grid */}
        {history.investments?.some((i: any) => i.status === "ACTIVE") && (
          <section className="flex flex-col gap-8">
            <div className="flex justify-between items-end border-b border-border-glass pb-4">
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white italic">Active <span className="text-brand">Nodes</span></h3>
              <span className="text-[8px] text-brand font-black uppercase tracking-[0.4em] px-4 py-1 bg-brand/5 border border-brand/20 rounded-full animate-pulse">
                 Harvesting Profits...
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {history.investments.filter((i: any) => i.status === "ACTIVE").map((inv: any) => (
                <div key={inv.id} className="bg-slate-900/40 border border-border-glass p-6 sm:p-8 rounded-[2rem] relative overflow-hidden backdrop-blur-xl">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                         <span className="text-brand font-black text-[10px] uppercase tracking-[0.3em]">{inv.plan?.title}</span>
                         <span className="text-text-dim text-[8px] font-bold tracking-widest uppercase">Node ID: {inv.id.slice(-8)}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] text-text-dim uppercase font-black tracking-[0.3em]">Initial Venture</p>
                         <p className="font-mono text-lg font-black text-white italic tracking-tighter">{formatCurrency(inv.amount)}</p>
                      </div>
                   </div>

                   <div className="space-y-4 mb-4">
                      <div className="flex justify-between items-end">
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-dim italic">Live Yield</span>
                         <span className="text-brand font-black italic text-xl tracking-tighter font-mono">+{formatCurrency(liveProfits[inv.id] || 0)}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${getProgress(inv)}%` }}
                           className="h-full bg-gradient-to-r from-brand to-brand-alt"
                         />
                      </div>
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-text-dim">
                         <span>SECURED: {formatCurrency(inv.amount)}</span>
                         <span>TARGET: {formatCurrency(Number(inv.amount) * (1 + Number(inv.plan?.profitPercentage || 0) / 100))}</span>
                      </div>
                   </div>

                   <div className="flex justify-between items-center pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></div>
                         <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest leading-none">Multiplying...</span>
                      </div>
                      <span className="text-[8px] text-text-dim font-bold uppercase tracking-widest">
                        Maturity: {new Date(inv.endDate).toLocaleDateString("en-BD", { month: "short", day: "numeric" })}
                      </span>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Matured Ventures */}
        {history.investments?.some((i: any) => i.status === "MATURED") && (
          <section className="flex flex-col gap-8">
            <div className="flex justify-between items-end border-b border-border-glass pb-4">
              <h3 className="text-2xl font-black tracking-tighter uppercase text-white italic">Matured <span className="text-emerald-500">Ventures</span></h3>
              <span className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.4em] px-4 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                 Cycle Complete
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {history.investments.filter((i: any) => i.status === "MATURED").map((inv: any) => (
                <div key={inv.id} className="bg-emerald-500/[0.02] border border-emerald-500/10 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden backdrop-blur-xl">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                         <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">{inv.plan?.title}</span>
                         <span className="text-text-dim text-[8px] font-bold tracking-widest uppercase">Node ID: {inv.id.slice(-8)}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] text-text-dim uppercase font-black tracking-[0.3em]">Total Yield</p>
                         <p className="font-mono text-lg font-black text-emerald-500 italic tracking-tighter">
                           {formatCurrency(Number(inv.amount) * (1 + Number(inv.plan?.profitPercentage || 0) / 100))}
                         </p>
                      </div>
                   </div>

                   <div className="flex justify-between items-center pt-6 border-t border-emerald-500/10">
                      <div className="flex items-center gap-2">
                         <CheckCircle size={14} className="text-emerald-500" />
                         <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Asset Localized</span>
                      </div>
                      <span className="text-[8px] text-text-dim font-bold uppercase tracking-widest">
                        Closed: {new Date(inv.endDate).toLocaleDateString("en-BD", { month: "short", day: "numeric" })}
                      </span>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Investment Plans */}
        <section className="flex flex-col gap-8">
          <div className="flex justify-between items-end border-b border-border-glass pb-4">
            <h3 className="text-2xl font-black tracking-tighter uppercase text-white">Venture Pipeline</h3>
            <span className="text-[10px] text-brand font-black uppercase tracking-[0.4em] px-4 py-1 bg-brand/5 border border-brand/20 rounded-full">
              Growth Opportunities
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((plan: any) => (
              <motion.div 
                key={plan.id} 
                whileHover={{ y: -8, rotateX: 2, rotateY: 2 }}
                className="glass-card group cursor-pointer relative overflow-hidden flex flex-col justify-between"
                onClick={() => setInvestingPlan(plan)}
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

                <div className="z-10 p-6 pt-0 mt-[-10px]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-brand/10 text-brand text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.3em] border border-brand/20">VNT-{plan.id.slice(-4)}</span>
                    <TrendingUp size={14} className="text-brand opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-black text-lg leading-none mb-1 uppercase tracking-tighter text-white">{plan.title}</h4>
                  <p className="text-text-dim text-[8px] font-black uppercase tracking-[0.2em] mb-4">Authorized By {plan.vendor?.name}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <span className="text-[7px] uppercase text-text-dim font-black tracking-[0.3em] italic">Threshold</span>
                      <span className="text-[10px] font-mono font-black text-white italic">{formatCurrency(plan.minAmount)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] uppercase text-text-dim font-black tracking-[0.3em] italic">Backers</span>
                      <span className="text-[10px] font-mono font-black text-brand italic">+{plan.backers || 0}</span>
                    </div>
                  </div>
                </div>
                
                  <div className="flex justify-between items-end pt-4 mx-6 pb-6 border-t border-border-glass z-10">
                  <div className="flex flex-col">
                    <span className="text-[7px] uppercase text-text-dim font-black tracking-[0.3em] italic">ROI POTENTIAL</span>
                    <span className="text-brand font-black text-xl leading-none italic tracking-tighter">+{plan.profitPercentage}%</span>
                  </div>
                  <button 
                    className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand text-[8px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-brand hover:text-white transition-all shadow-lg hover:shadow-brand/20"
                  >
                    INVEST NOW
                  </button>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Activity Table */}
        <section className="flex flex-col gap-8">
          <h3 className="text-2xl font-black tracking-tighter uppercase text-white">Ledger History</h3>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0a0a0a] text-text-dim text-[10px] uppercase tracking-[0.3em] font-black border-b border-border-glass">
                  <tr>
                    <th className="px-8 py-6">Venture ID</th>
                    <th className="px-8 py-6">Protocol</th>
                    <th className="px-8 py-6">Capital</th>
                    <th className="px-8 py-6">Gateway</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-glass">
                  {history.transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-brand/[0.02] transition-colors border-none">
                      <td className="px-8 py-5 font-mono text-[10px] text-text-dim uppercase tracking-widest">{tx.trxID}</td>
                      <td className="px-8 py-5">
                         <span className={`text-[10px] font-black tracking-[0.2em] ${
                           tx.type === "DEPOSIT" ? "text-brand" : 
                           tx.type === "WITHDRAW" ? "text-red-500" : 
                           tx.type === "SYSTEM_CREDIT" ? "text-emerald-500" :
                           "text-blue-400"
                         }`}>
                           {tx.type}
                         </span>
                      </td>
                      <td className="px-8 py-5 font-mono font-black text-white italic tracking-tighter text-lg">{formatCurrency(tx.amount)}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${tx.method === 'bKash' ? 'bg-pink-500' : 'bg-orange-500'}`} />
                          <span className="text-text-dim text-[10px] font-black uppercase tracking-[0.2em]">{tx.method}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-[0.2em] border ${
                            tx.status === "SUCCESS" 
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                            : tx.status === "REJECTED"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : tx.status === "MATURED"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {tx.status === "SUCCESS" ? "AUTHENTICATED" : tx.status === "REJECTED" ? "REJECTED" : tx.status === "MATURED" ? "MATURED" : "PENDING"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-text-dim text-[10px] font-black uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDeposit && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#050505] border border-white/10 p-10 rounded-2xl w-full max-w-md relative shadow-2xl"
            >
              <button onClick={() => setShowDeposit(false)} className="absolute right-6 top-6 text-text-dim hover:text-white transition-colors"><X size={20} /></button>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight mb-1 uppercase text-white">Deposit Funds</h3>
                <p className="text-[10px] text-brand uppercase tracking-[0.3em] font-bold italic">Secure Payment Portal</p>
              </div>

              <div className="bg-brand/5 border border-brand/20 p-4 rounded-xl mb-8">
                <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest mb-2">Instructions</p>
                <p className="text-sm text-white/90 leading-relaxed italic">
                  Send Money (Personal) to: <br/>
                  <span className="text-brand font-bold font-mono">01700-000000</span> ({depositForm.method})
                </p>
              </div>
              
              <form onSubmit={handleDeposit} className="space-y-6 text-left">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim block">Select Gateway</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "bKash", color: "hover:border-[#D8205F] hover:bg-[#D8205F]/5", active: "border-[#D8205F] bg-[#D8205F]/10 text-[#D8205F]" },
                      { id: "Nagad", color: "hover:border-[#F27224] hover:bg-[#F27224]/5", active: "border-[#F27224] bg-[#F27224]/10 text-[#F27224]" }
                    ].map(m => (
                      <button 
                        key={m.id}
                        type="button"
                        onClick={() => setDepositForm({ ...depositForm, method: m.id })}
                        className={`py-4 px-4 border rounded-xl transition-all flex flex-col items-center gap-2 ${depositForm.method === m.id ? m.active : "border-white/5 bg-white/5 " + m.color}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold italic text-sm ${m.id === 'bKash' ? 'bg-[#D8205F] text-white' : 'bg-[#F27224] text-white'}`}>
                          {m.id[0]}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{m.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim">Amount (৳)</label>
                    <input 
                      type="number" required placeholder="0.00" step="0.01"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-xl px-6 py-4 text-xl font-bold font-mono tracking-tighter italic focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim">Transaction ID (TrxID)</label>
                    <input 
                      type="text" required placeholder="X7Y8Z9..."
                      value={depositForm.trxID}
                      onChange={(e) => setDepositForm({ ...depositForm, trxID: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-xl px-6 py-4 text-sm font-mono tracking-widest uppercase focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={!depositForm.amount || !depositForm.trxID || Number(depositForm.amount) <= 0}
                  className="glow-button w-full px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  SUBMIT FOR VERIFICATION <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {investingPlan && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#050505] border border-white/10 p-10 rounded-xl w-full max-w-md relative shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
              <button onClick={() => setInvestingPlan(null)} className="absolute right-6 top-6 text-text-dim hover:text-white transition-colors"><X size={20} /></button>
              
              <div className="mb-10">
                <h3 className="text-2xl font-bold tracking-tight mb-1 uppercase text-white">Investment</h3>
                <p className="text-[10px] text-brand uppercase tracking-[0.3em] font-bold italic">{investingPlan.title}</p>
              </div>
              
              <form onSubmit={handleInvest} className="space-y-8 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim block mb-3">Investment Amount (Min: {formatCurrency(investingPlan.minAmount)})</label>
                  <input 
                    type="number" required step="0.01"
                    min={investingPlan.minAmount}
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-xl px-6 py-4 text-xl font-bold font-mono tracking-tighter italic focus:border-brand focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-dim">Projected ROI</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-brand" />
                      <span className="text-brand font-bold italic">{investingPlan.profitPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-dim">Final Return</span>
                    <span className="text-white font-bold italic text-lg tracking-tighter font-mono">{formatCurrency((Number(investAmount) || 0) * (1 + Number(investingPlan.profitPercentage) / 100))}</span>
                  </div>
                </div>

                {Number(investAmount) > Number(user.walletBalance) && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                       Insufficient Balance. Please Add Funds.
                    </p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={Number(investAmount) > Number(user.walletBalance) || !investAmount || Number(investAmount) <= 0}
                  className="glow-button w-full px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale transition-all"
                >
                  CONFIRM INVESTMENT <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showWithdraw && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#050505] border border-white/10 p-10 rounded-2xl w-full max-w-md relative shadow-2xl"
            >
              <button onClick={() => setShowWithdraw(false)} className="absolute right-6 top-6 text-text-dim hover:text-white transition-colors"><X size={20} /></button>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight mb-1 uppercase text-white">Withdraw Funds</h3>
                <p className="text-[10px] text-red-500 uppercase tracking-[0.3em] font-bold italic">Capital Extraction Portal</p>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl mb-8">
                <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest mb-1">Max Available</p>
                <p className="text-xl font-mono font-black text-white">{formatCurrency(user.walletBalance)}</p>
              </div>
              
              <form onSubmit={handleWithdraw} className="space-y-6 text-left">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim block">Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "bKash", active: "border-[#D8205F] bg-[#D8205F]/10 text-[#D8205F]" },
                      { id: "Nagad", active: "border-[#F27224] bg-[#F27224]/10 text-[#F27224]" }
                    ].map(m => (
                      <button 
                        key={m.id}
                        type="button"
                        onClick={() => setWithdrawForm({ ...withdrawForm, method: m.id })}
                        className={`py-4 border rounded-xl transition-all ${withdrawForm.method === m.id ? m.active : "border-white/5 bg-white/5 text-text-dim"}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">{m.id}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim">Withdrawal Amount (৳)</label>
                    <input 
                      type="number" required placeholder="0.00" step="0.01"
                      max={Number(user.walletBalance)}
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-xl px-6 py-4 text-xl font-bold font-mono tracking-tighter italic focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-dim">{withdrawForm.method} Phone Number</label>
                    <input 
                      type="text" required placeholder="01XXX XXXXXX"
                      value={withdrawForm.address}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, address: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-xl px-6 py-4 text-sm font-mono tracking-widest focus:border-brand focus:outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={!withdrawForm.amount || !withdrawForm.address || Number(withdrawForm.amount) <= 0 || Number(withdrawForm.amount) > Number(user.walletBalance)}
                  className="bg-red-500 hover:bg-red-600 w-full px-6 py-3 rounded-xl text-[10px] font-black tracking-[0.3em] flex items-center justify-center gap-3 text-white disabled:opacity-50 disabled:grayscale transition-all"
                >
                  INITIALIZE CASHOUT <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
