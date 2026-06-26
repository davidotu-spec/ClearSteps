import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { 
  Zap, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Activity,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Shield,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Globe,
  Cpu,
  Factory,
  Stethoscope,
  Cloud,
  Plane,
  Building,
  Landmark,
  Bitcoin,
  Sun,
  Moon,
  Menu,
  X,
  QrCode
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onTryDemo: () => void;
  onContact: () => void;
  onPitchDeck: () => void;
  onViewSystem: () => void;
  onUpgradePro?: () => void;
  isAuthenticated?: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onGetStarted, 
  onTryDemo, 
  onContact, 
  onPitchDeck, 
  onViewSystem,
  onUpgradePro, 
  isAuthenticated = false,
  theme = 'dark',
  onToggleTheme
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAppQR, setShowAppQR] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-cyan-400/30 transition-colors duration-300">
      {/* Background Grid & Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none w-full max-w-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 dark:opacity-20"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] max-w-[200vw] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full opacity-50"></div>
      </div>

      <nav className="relative z-50 border-b border-slate-200 dark:border-slate-800/50 backdrop-blur-xl bg-white/50 dark:bg-slate-950/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
          <Logo className="w-10 h-10" />
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-4 lg:gap-8 text-[10px] font-mono uppercase tracking-widest text-slate-400">
            <button 
              onClick={() => {
                onViewSystem();
                setTimeout(() => {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} 
              className="hover:text-cyan-400 transition-colors"
            >
              About
            </button>
            <button 
              onClick={onViewSystem}
              className="hover:text-cyan-400 transition-colors uppercase"
            >
              Vision
            </button>
            <a href="#features" className="hover:text-cyan-400 transition-colors">Protocols</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            {onToggleTheme && (
              <button 
                onClick={onToggleTheme}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              </button>
            )}
            <button 
              onClick={onGetStarted}
              className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-full font-black hover:bg-cyan-400 dark:hover:bg-cyan-400 transition-all"
            >
              {isAuthenticated ? 'Return to App' : 'Access System'}
            </button>
          </div>

          {/* Mobile/Tablet Toggle */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 transition-colors border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
            >
              <div className="p-6 space-y-6 flex flex-col text-[10px] font-mono uppercase tracking-widest text-slate-400">
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    onViewSystem();
                    setTimeout(() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="text-left hover:text-cyan-400 transition-colors"
                >
                  About
                </button>
                <button 
                  onClick={() => { setShowMobileMenu(false); onViewSystem(); }}
                  className="text-left hover:text-cyan-400 transition-colors"
                >
                  Vision
                </button>
                <a href="#features" onClick={() => setShowMobileMenu(false)} className="hover:text-cyan-400 transition-colors">Protocols</a>
                <a href="#pricing" onClick={() => setShowMobileMenu(false)} className="hover:text-cyan-400 transition-colors">Pricing</a>
                <div className="h-px bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Theme</span>
                  {onToggleTheme && (
                    <button 
                      onClick={onToggleTheme}
                      className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => { setShowMobileMenu(false); onGetStarted(); }}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black transition-all"
                >
                  {isAuthenticated ? 'Return to App' : 'Access System'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 md:pt-32 pb-16 md:pb-20 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-[10px] font-mono text-cyan-400 uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" /> System v2.4 Now Operational
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic font-serif leading-[0.9]"
          >
            Precision <span className="text-cyan-400">Execution</span> <br />
            Without Error.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg md:text-xl font-light leading-relaxed"
          >
            ExactPath generates structured, step-by-step verification protocols for high-stakes environments. Reduce human error, ensure compliance, and execute with absolute confidence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <button 
              onClick={onTryDemo}
              className="w-full sm:w-auto px-10 py-5 bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center justify-center gap-3"
            >
              {isAuthenticated ? 'Return to Dashboard' : 'New Objective'} <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-10 py-5 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
              {isAuthenticated ? 'View Console' : 'Try the Precision Engine'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="relative z-10 py-16 md:py-20 border-y border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {[
              { label: 'Protocols Generated', value: '12,000+' },
              { label: 'Industries Served', value: '10+' },
              { label: 'Error Reduction', value: '99.8%' },
              { label: 'System Uptime', value: '99.99%' },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Trusted by operators in zero-error environments</p>
          </div>
        </div>
      </section>


      {/* Why ExactPath Narrative */}
      <section className="relative z-10 py-20 lg:py-32 px-4 sm:px-6 md:px-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic font-serif leading-tight text-slate-900 dark:text-white">
                The Execution Layer for <br />
                <span className="text-cyan-400">AI-Driven Operations.</span>
              </h2>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Why ExactPath Exists</p>
            </div>
            
            <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              <p>
                As AI transforms how we work, the gap between "knowing what to do" and "executing it perfectly" has never been more dangerous. Human error costs enterprises billions annually in compliance failures, safety incidents, and operational downtime.
              </p>
              <p>
                ExactPath is the execution layer. We translate complex operational goals into verifiable, atomic steps that leave no room for ambiguity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: AlertTriangle, title: "Eliminate Error", desc: "Remove the 'human factor' in critical paths." },
                { icon: ShieldCheck, title: "Verifiable Steps", desc: "Every action requires proof of execution." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-cyan-400/20 blur-3xl rounded-full opacity-20"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Protocol Preview: Server Migration</div>
              </div>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Snapshot Source Volume", status: "Verified", color: "text-green-500 dark:text-green-400" },
                  { step: "02", title: "Verify MD5 Integrity", status: "Active", color: "text-cyan-500 dark:text-cyan-400" },
                  { step: "03", title: "Initialize Target Node", status: "Pending", color: "text-slate-300 dark:text-slate-600" }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-700">{s.step}</span>
                      <span className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white">{s.title}</span>
                    </div>
                    <span className={`text-[8px] font-mono uppercase tracking-widest ${s.color}`}>{s.status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <button onClick={onTryDemo} className="text-[10px] font-mono text-cyan-500 dark:text-cyan-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
                  See How It Works →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="relative z-10 py-20 lg:py-32 px-4 sm:px-6 md:px-12 bg-slate-50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">Built for High-Stakes Teams</h2>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Mission Critical Industries</p>
          </div>
 
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: Shield, label: "Compliance & QA" },
              { icon: Factory, label: "Manufacturing" },
              { icon: Stethoscope, label: "Healthcare" },
              { icon: Cloud, label: "Cloud & DevOps" },
              { icon: Plane, label: "Aviation" },
              { icon: Building, label: "Real Estate" },
              { icon: Landmark, label: "Banking" },
              { icon: Bitcoin, label: "Blockchain" },
              { icon: Globe, label: "Government" },
              { icon: Cpu, label: "Hardware" }
            ].map((industry, i) => (
              <div key={i} className="p-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-cyan-400/30 transition-all group shadow-sm dark:shadow-none">
                <industry.icon className="w-8 h-8 text-slate-400 dark:text-slate-600 group-hover:text-cyan-400 transition-colors" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{industry.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Now a CTA to System Page */}
      <section id="features" className="relative z-10 py-20 lg:py-32 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic font-serif">Engineered for Flawless Execution</h2>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em] max-w-2xl mx-auto">Discover the mission-critical logic that powers the ExactPath engine.</p>
          </div>
          <button 
            onClick={onGetStarted}
            className="group inline-flex items-center gap-4 px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400 transition-all shadow-sm"
          >
            Inside the Engine <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-20 lg:py-32 px-4 sm:px-6 md:px-12 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4 cursor-pointer" onClick={onGetStarted}>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white hover:text-cyan-400 transition-colors">System Access Tiers</h2>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Choose your operational level</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              onClick={onGetStarted}
              className="p-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[3rem] space-y-8 flex flex-col cursor-pointer hover:border-cyan-400/50 transition-all group shadow-sm dark:shadow-none"
            >
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Base Operative</div>
                <div className="text-5xl font-black text-slate-900 dark:text-white">£0<span className="text-lg text-slate-500 dark:text-slate-600 font-normal">/mo</span></div>
              </div>
              <ul className="space-y-4 flex-1">
                {[
                  '3 ExactPaths per month',
                  'Standard AI Engine',
                  'Web Access Only',
                  'Basic Templates'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={(e) => { e.stopPropagation(); onGetStarted(); }}
                className="w-full py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all"
              >
                Start Free
              </button>
            </motion.div>

            {/* Pro Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              onClick={onUpgradePro || onGetStarted}
              className="p-10 bg-white dark:bg-slate-950 border-2 border-cyan-400 rounded-[3rem] space-y-8 flex flex-col relative overflow-hidden cursor-pointer hover:shadow-[0_0_50px_rgba(34,211,238,0.1)] transition-all group shadow-sm dark:shadow-none"
            >
              <div className="absolute top-6 right-6 px-3 py-1 bg-cyan-400 text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full">Recommended</div>
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Elite Specialist</div>
                <div className="text-5xl font-black text-slate-900 dark:text-white">£12<span className="text-lg text-slate-500 dark:text-slate-600 font-normal">/mo</span></div>
              </div>
              <ul className="space-y-4 flex-1">
                {[
                  'Unlimited ExactPaths',
                  'Advanced Reasoning Engine',
                  'PDF & CSV Export',
                  'Elite Protocol Marketplace',
                  'Custom Template Library',
                  'Priority Generation',
                  'Team Collaboration'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={(e) => { e.stopPropagation(); (onUpgradePro || onGetStarted)(); }}
                className="w-full py-4 bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-white dark:hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]"
              >
                Upgrade to Pro
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 md:py-20 px-4 sm:px-6 md:px-12 border-t border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
            <Logo className="w-8 h-8" />
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <button 
                onClick={() => setShowAppQR(!showAppQR)}
                className={`flex items-center gap-2 transition-colors ${showAppQR ? 'text-cyan-400' : 'hover:text-cyan-400'}`}
              >
                <QrCode className="w-4 h-4" /> Go Mobile
              </button>
              <button onClick={onPitchDeck} className="hover:text-cyan-400 transition-colors">Pitch Deck</button>
              <button onClick={onContact} className="hover:text-cyan-400 transition-colors">Contact</button>
              <button onClick={onViewSystem} className="hover:text-cyan-400 transition-colors uppercase">Vision</button>
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Security</a>
            </div>
          </div>

          <AnimatePresence>
            {showAppQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="flex flex-col items-center gap-6 p-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] text-center"
              >
                <div className="space-y-2">
                  <h4 className="text-xl font-black uppercase tracking-tighter italic font-serif text-slate-900 dark:text-white">Mission Critical Access</h4>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Scan to access the engine on any device</p>
                </div>
                <div className="p-6 bg-white rounded-3xl shadow-2xl">
                  <QRCodeSVG 
                    value={window.location.origin} 
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="w-full h-full"
                  />
                </div>
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.2em]">exactpath.ai // secure_link</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-widest text-center">
            © 2026 ExactPath Protocol. Optimized for Professional Execution.
          </div>
        </div>
      </footer>
    </div>
  );
};
