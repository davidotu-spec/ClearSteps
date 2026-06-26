import React, { useMemo } from 'react';
import { Logo } from './Logo';
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  MoreVertical,
  X,
  Plus,
  Download,
  Edit2,
  Trash2,
  Zap,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  createdAt: number;
  isPro?: boolean;
  generationCount?: number;
  lastGenerationMonth?: string;
}

interface Checklist {
  id: string;
  goal: string;
  steps: any[];
  createdAt: number;
  criticality: 'low' | 'medium' | 'high';
  createdBy: string;
}

interface AdminDashboardProps {
  allUsers: UserProfile[];
  allChecklists: Checklist[];
  onUpdateRole: (uid: string, role: 'admin' | 'user') => void;
  onUpdatePro: (uid: string, isPro: boolean) => void;
  onClose: () => void;
  currentUserUid?: string;
}

const COLORS = ['#22d3ee', '#3b82f6', '#ef4444', '#f59e0b'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  allUsers, 
  allChecklists, 
  onUpdateRole, 
  onUpdatePro,
  onClose,
  currentUserUid 
}) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'marketplace'>('overview');
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const totalUsers = allUsers.length;
    const proUsers = allUsers.filter(u => u.isPro).length;
    const totalProtocols = allChecklists.length;
    const highRiskProtocols = allChecklists.filter(c => c.criticality === 'high').length;
    const completedSteps = allChecklists.reduce((acc, c) => acc + c.steps.filter(s => s.isCompleted).length, 0);
    const totalSteps = allChecklists.reduce((acc, c) => acc + c.steps.length, 0);
    const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Criticality Distribution
    const criticalityData = [
      { name: 'High', value: allChecklists.filter(c => c.criticality === 'high').length },
      { name: 'Medium', value: allChecklists.filter(c => c.criticality === 'medium' || !c.criticality).length },
      { name: 'Low', value: allChecklists.filter(c => c.criticality === 'low').length },
    ];

    // Activity over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = allChecklists.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate.toDateString() === date.toDateString();
      }).length;
      return { name: dateStr, count };
    }).reverse();

    return {
      totalUsers,
      totalProtocols,
      highRiskProtocols,
      completionRate,
      criticalityData,
      last7Days
    };
  }, [allUsers, allChecklists]);

  return (
    <div className="fixed inset-0 z-[150] bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Logo className="w-10 h-10" iconOnly />
            <div>
              <h2 className="text-xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">Admin Command Center</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System-wide Analytics & Control</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'users', label: 'Operatives', icon: Users },
              { id: 'marketplace', label: 'Marketplace', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-cyan-400 text-slate-950 font-bold' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const isTestMode = localStorage.getItem('exactpath_test_limit') === 'true';
              localStorage.setItem('exactpath_test_limit', (!isTestMode).toString());
              window.location.reload();
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all border ${
              localStorage.getItem('exactpath_test_limit') === 'true' 
                ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {localStorage.getItem('exactpath_test_limit') === 'true' ? 'Disable Limit Test' : 'Enable Limit Test (3/3)'}
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Operatives', value: stats.totalUsers, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                { label: 'Elite (Pro) Tier', value: stats.proUsers, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { label: 'Active Protocols', value: stats.totalProtocols, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Execution Rate', value: `${stats.completionRate}%`, icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
              ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 group hover:border-cyan-400/30 transition-all shadow-sm dark:shadow-none"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-3 ${stat.bg} rounded-2xl`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                    </div>
                  </motion.div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm dark:shadow-none">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Protocol Generation Activity
                  </div>
                </div>
                <div className="h-[300px] w-full min-h-[300px]">
                  {isReady && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.last7Days}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" vertical={false} opacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                          itemStyle={{ color: '#22d3ee', fontSize: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#22d3ee" 
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Criticality Distribution */}
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm dark:shadow-none">
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-cyan-400" /> Risk Distribution
                </div>
                <div className="h-[300px] w-full min-h-[300px] flex items-center">
                  {isReady && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.criticalityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.criticalityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="space-y-4 pr-8">
                    {stats.criticalityData.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.name}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white ml-auto">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Operative Directory</div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="text" 
                    placeholder="Search operatives..."
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-cyan-400/50 transition-all w-64"
                  />
                </div>
                <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Operative</th>
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Access Level</th>
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Tier</th>
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Usage</th>
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Status</th>
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {allUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={u.photoURL} alt="" className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-800" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{u.displayName}</div>
                            <div className="text-[10px] font-mono text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[8px] px-3 py-1 rounded-full border uppercase tracking-widest font-mono ${
                          u.role === 'admin' ? 'border-cyan-400/30 text-cyan-400 bg-cyan-400/5' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`text-[8px] px-3 py-1 rounded-full border uppercase tracking-widest font-mono ${
                          u.isPro ? 'border-amber-400/30 text-amber-400 bg-amber-400/5' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}>
                          {u.isPro ? 'Pro' : 'Free'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                            {u.lastGenerationMonth === new Date().toISOString().slice(0, 7) ? (u.generationCount || 0) : 0}/3
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{u.lastGenerationMonth || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        {u.uid !== currentUserUid && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => onUpdateRole(u.uid, u.role === 'admin' ? 'user' : 'admin')}
                              className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
                            >
                              Toggle Access
                            </button>
                            <button 
                              onClick={() => onUpdatePro(u.uid, !u.isPro)}
                              className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-amber-400 hover:border-amber-400/30 transition-all"
                            >
                              Toggle Tier
                            </button>
                            <button className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Marketplace Management</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Control industry-standard templates</p>
              </div>
              <button 
                onClick={() => alert("Marketplace Template Management: This feature is currently in development. Soon, administrators will be able to upload and manage industry-standard protocols directly from this console.")}
                className="px-6 py-3 bg-cyan-400 text-slate-950 rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'ISO 9001 Audit', status: 'Active', downloads: 1240, type: 'Pro' },
                { title: 'Fire Safety', status: 'Active', downloads: 850, type: 'Free' },
                { title: 'DevOps Deploy', status: 'Active', downloads: 2100, type: 'Pro' },
              ].map((t, i) => (
                <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{t.type}</div>
                    <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full">{t.status}</div>
                  </div>
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">{t.title}</h4>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Download className="w-3 h-3" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">{t.downloads}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert("Edit Template: This feature is coming soon. You will be able to modify the steps, title, and category of this template.")}
                        className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => alert("Delete Template: This feature is coming soon. You will be able to remove this template from the marketplace.")}
                        className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;