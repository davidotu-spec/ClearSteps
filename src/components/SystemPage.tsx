import React from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Layers, 
  TrendingUp, 
  Shield, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Brain, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Briefcase,
  Rocket,
  Stethoscope,
  AlertTriangle,
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { Logo } from './Logo';

interface SystemPageProps {
  onBack: () => void;
  onTryProtocol: (goal: string) => void;
  onToggleTheme?: () => void;
  theme?: 'dark' | 'light';
}

export const SystemPage: React.FC<SystemPageProps> = ({ 
  onBack, 
  onTryProtocol, 
  theme = 'dark',
  onToggleTheme
}) => {
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'} font-sans selection:bg-cyan-400 selection:text-slate-950 transition-colors duration-300`}>
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10"></div>
      </div>

      <nav className="relative z-10 border-b border-slate-200 dark:border-slate-800 p-4 md:px-6 lg:px-12 md:py-6 backdrop-blur-md bg-white/50 dark:bg-slate-950/50 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
              aria-label="Back to Landing"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
            </button>
            <Logo className="w-8 h-8" />
            <h1 className="text-sm font-black uppercase tracking-widest hidden md:block">System Configuration</h1>
          </div>
          <div className="flex items-center gap-4">
            {onToggleTheme && (
              <button 
                onClick={onToggleTheme}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              </button>
            )}
            <button 
              onClick={() => onTryProtocol("")}
              className="px-6 py-2 bg-cyan-400 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg"
            >
              New Objective
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20 space-y-20 md:space-y-32">
        {/* Engineered for Reliability */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic font-serif">Engineered for Reliability</h2>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">The ExactPath Advantage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Expert Logic",
                desc: "Protocols built on mission-critical logic to ensure flawless execution in any scenario. Eliminate human error with zero-fault tolerance."
              },
              {
                icon: ShieldCheck,
                title: "Verification",
                desc: "Specific criteria for every step. Confirm success with precision, not guesswork. Verify against objective outputs, not just checkboxes."
              },
              {
                icon: Zap,
                title: "Rapid Deployment",
                desc: "Instant generation of complex workflows. Move from objective to execution in seconds with expert-level technical accuracy."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-6 hover:border-cyan-400/30 transition-all group shadow-sm dark:shadow-none"
              >
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission Profiles */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic font-serif">Mission Profiles</h2>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">Precision protocols for high-stakes engineering, leadership, and safety-critical operations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                icon: Briefcase,
                title: "Prepare for a Job Interview",
                desc: "Systematic preparation for senior-level technical or leadership roles.",
                steps: ["Research company roadmap", "Prepare 3 STAR-method stories", "Verify technical environment"]
              },
              {
                icon: Rocket,
                title: "Launch a Product",
                desc: "Zero-error deployment protocol for software or physical products.",
                steps: ["Final QA sign-off", "Verify CDN propagation", "Enable monitoring alerts"]
              },
              {
                icon: Stethoscope,
                title: "Plan a Medical Procedure",
                desc: "Pre-operative checklists for patients and caregivers.",
                steps: ["Verify fasting window", "Confirm medication pause", "Arrange post-op transport"]
              },
              {
                icon: AlertTriangle,
                title: "Safety-Critical Task",
                desc: "Industrial or technical protocols where error is not an option.",
                steps: ["Lock-out/Tag-out verification", "PPE integrity check", "Secondary observer sync"]
              }
            ].map((profile, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 group hover:border-cyan-400 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <profile.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{profile.title}</h3>
                    <p className="text-xs text-slate-500">{profile.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {profile.steps.map((step, j) => (
                    <div key={j} className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-mono text-slate-400">
                      {step}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => onTryProtocol(profile.title)}
                  className="w-full py-4 border border-cyan-400/30 rounded-2xl text-[10px] font-mono uppercase tracking-widest text-cyan-400 hover:bg-cyan-400 hover:text-slate-950 transition-all flex items-center justify-center gap-2"
                >
                  Try this protocol <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* System Specifications */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">System Specifications</div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/30 backdrop-blur-sm shadow-sm dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Feature</th>
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">What It Means</th>
                    <th className="p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Why It Matters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {[
                    { f: 'Zero Mistakes', m: 'Step-by-step verification logic', w: 'Ensures tasks are completed correctly' },
                    { f: 'Gemini 3 Flash', m: 'AI generates expert-level checklists', w: 'Saves time and reduces cognitive load' },
                    { f: 'MVP Ready', m: 'Core functionality available now', w: 'Users can try it immediately' }
                  ].map((row, i) => (
                    <tr key={i} className="group hover:bg-cyan-400/5 transition-colors">
                      <td className="p-6 font-bold uppercase text-xs tracking-tight text-cyan-400">{row.f}</td>
                      <td className="p-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{row.m}</td>
                      <td className="p-6 text-sm text-slate-500 dark:text-slate-300 leading-relaxed">{row.w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* About & Roadmap */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-2 gap-20 py-20 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">About ExactPath</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                ExactPath was born from a simple observation: most failures in complex systems aren't caused by lack of knowledge, but by a failure in execution. Our mission is to provide a "Mission Control" for every individual and team, turning high-stakes goals into bulletproof protocols.
              </p>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                <Lock className="w-3 h-3" /> Data Integrity
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your goals are processed in real-time by Gemini 3 Flash. We do not store your mission-critical data on our servers beyond the current session. Your protocols are yours to keep.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center border border-blue-400/20 text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">System Roadmap</h3>
            </div>
            <div className="space-y-6">
              {[
                { v: 'v0.1.0', t: 'Core Engine Launch', s: 'Active', d: 'Real-time protocol generation and verification tracking.' },
                { v: 'v0.2.0', t: 'Audit Export', s: 'Upcoming', d: 'Generate signed PDF audit logs for compliance and review.' },
                { v: 'v0.3.0', t: 'Team Sync', s: 'In Development', d: 'Collaborative protocol execution with multi-user verification.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.s === 'Active' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    {i !== 2 && <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mt-2"></div>}
                  </div>
                  <div className="pb-8 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400">{item.v}</span>
                      <span className="text-sm font-bold uppercase tracking-tight">{item.t}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full border ${item.s === 'Active' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-slate-300 dark:border-slate-800 text-slate-500'}`}>{item.s}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Future Vision Section */}
        <section className="relative py-32 overflow-hidden rounded-[3rem] bg-slate-50 dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-400/5 -skew-x-12 transform translate-x-1/2"></div>
          <div className="max-w-4xl mx-auto px-6 relative text-center space-y-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
              The Horizon
            </div>
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic font-serif">
              Universal <br />
              <span className="text-cyan-400">Precision</span> <br />
              Task Engine.
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              ExactPath aims to become the world’s first universal precision task engine—reducing human error across industries from aviation to healthcare. We are building the infrastructure for a world where "mistake" is no longer a variable.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="text-4xl md:text-6xl font-black text-cyan-400 tracking-tighter italic">0%</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Error Tolerance</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-6xl font-black text-slate-400 tracking-tighter">∞</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Domain Scaling</div>
              </div>
            </div>

            <div className="relative mt-20 pt-16 border-t border-slate-200 dark:border-slate-800">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Autonomous Verification', status: 'In Development', progress: 65 },
                    { label: 'Biometric Sync', status: 'Research Phase', progress: 30 },
                    { label: 'Neural-Link Protocols', status: 'Conceptual', progress: 10 }
                  ].map((item, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] font-bold uppercase tracking-tight">{item.label}</div>
                        <div className="text-[8px] font-mono text-slate-500">{item.status}</div>
                      </div>
                      <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.progress}%` }}
                          viewport={{ once: true }}
                          className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        ></motion.div>
                      </div>
                    </div>
                  ))}
               </div>
               <div className="mt-12 text-[9px] font-mono text-slate-400 uppercase tracking-[0.4em] animate-pulse">
                &gt; Initializing Global Safety Layer...
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 py-16 md:py-20 px-4 sm:px-6 md:px-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo className="w-8 h-8" />
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-widest text-center">
            © 2026 ExactPath Precision Systems. Built for Flawless Execution.
          </div>
          <div className="flex gap-6 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <button onClick={onBack} className="hover:text-cyan-400 transition-colors underline decoration-cyan-400/30">Exit Systems</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
