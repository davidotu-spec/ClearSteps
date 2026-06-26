import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertTriangle,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { auth, signInWithEmailAndPassword } from '../firebase';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 pointer-events-none mix-blend-overlay"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Logo className="w-16 h-16" iconOnly />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">Admin Command</h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Restricted Access Area</p>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-2xl space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 dark:text-red-400 text-xs"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white outline-none focus:border-cyan-400/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 shadow-sm dark:shadow-none"
                  placeholder="admin@exactpath.ai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white outline-none focus:border-cyan-400/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 shadow-sm dark:shadow-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Authorize Access <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Secure Encrypted Channel
          </div>
        </div>

        <button 
          onClick={onBack}
          className="w-full py-4 text-slate-500 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Main Terminal
        </button>
      </motion.div>

      <div className="absolute bottom-8 text-[10px] font-mono text-slate-700 uppercase tracking-[0.5em]">
        ExactPath Precision Systems v2.4.0
      </div>
    </div>
  );
};
