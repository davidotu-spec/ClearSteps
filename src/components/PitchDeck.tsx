import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  Users, 
  Brain, 
  Target, 
  TrendingUp, 
  Globe, 
  Mail,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Rocket,
  Stethoscope,
  Shield
} from 'lucide-react';

interface SlideProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const Slide: React.FC<SlideProps> = ({ children, title, subtitle }) => (
  <div className="h-full flex flex-col p-6 sm:p-8 md:p-16 space-y-6 md:space-y-8">
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Logo className="w-8 h-8" iconOnly />
        <h2 className="text-4xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">{title}</h2>
      </div>
      {subtitle && <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.3em]">{subtitle}</p>}
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

export const PitchDeck: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "ExactPath",
      subtitle: "High-Precision Execution Protocols",
      content: (
        <div className="h-full flex flex-col justify-center items-center text-center space-y-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 bg-cyan-400 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.4)] overflow-hidden"
          >
            <Logo className="w-full h-full" iconOnly />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">ExactPath <span className="text-cyan-400">AI</span></h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              The world's first AI-synthesized, real-time collaborative protocol engine for mission-critical execution.
            </p>
          </div>
          <div className="flex gap-4 pt-8">
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-mono uppercase tracking-widest text-slate-500 shadow-sm dark:shadow-none">v1.0.4 Release</div>
            <div className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-[10px] font-mono uppercase tracking-widest text-cyan-400">Seed Round Open</div>
          </div>
        </div>
      )
    },
    {
      title: "The Problem",
      subtitle: "The Cost of Human Error",
      content: (
        <div className="grid md:grid-cols-2 gap-12 items-center h-full">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">Knowledge is fragmented, and execution is inconsistent.</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Organizations lose billions annually due to "Execution Drift"—the gap between a perfect plan and real-world performance.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: AlertTriangle, text: "SOPs are static, outdated, and ignored." },
                { icon: Users, text: "Teams lack real-time synchronization during critical tasks." },
                { icon: Brain, text: "Expert knowledge is trapped in silos, not scalable." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none">
                  <item.icon className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square bg-slate-50 dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-inner dark:shadow-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05),transparent)] dark:bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent)]"></div>
            <div className="text-center space-y-2">
              <div className="text-7xl font-black text-slate-900 dark:text-white">$3.1T</div>
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Annual Loss Due to Poor Data & Execution</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Solution",
      subtitle: "Dynamic Protocol Synthesis",
      content: (
        <div className="grid md:grid-cols-3 gap-6 h-full">
          {[
            {
              icon: Brain,
              title: "AI Reasoning",
              desc: "Gemini 3.1 Pro synthesizes complex goals into high-precision, 10-step protocols instantly."
            },
            {
              icon: Users,
              title: "Real-time Sync",
              desc: "Multi-user collaboration ensures every team member is on the exact same step, at the same time."
            },
            {
              icon: ShieldCheck,
              title: "Verification",
              desc: "Every step includes specific verification criteria to ensure 100% compliance and zero drift."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-6 hover:border-cyan-400/50 transition-all group shadow-sm dark:shadow-none">
              <div className="w-14 h-14 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-cyan-400" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Market Traction",
      subtitle: "Niche Dominance Strategy",
      content: (
        <div className="space-y-12 h-full flex flex-col justify-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Startups", icon: Rocket, color: "text-purple-500 dark:text-purple-400" },
              { label: "Medical", icon: Stethoscope, color: "text-red-500 dark:text-red-400" },
              { label: "Aviation", icon: Shield, color: "text-blue-500 dark:text-blue-400" },
              { label: "Enterprise", icon: Briefcase, color: "text-amber-500 dark:text-amber-400" }
            ].map((market, i) => (
              <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-sm dark:shadow-none">
                <market.icon className={`w-10 h-10 mx-auto ${market.color}`} />
                <div className="text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white">{market.label}</div>
              </div>
            ))}
          </div>
          <div className="p-10 bg-cyan-400/5 border border-cyan-400/10 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="w-32 h-32 text-cyan-400" />
            </div>
            <div className="relative z-10 space-y-4">
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">The "ExactPath" Viral Loop</h4>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                Every shared protocol is a marketing asset. When a user shares a high-value path, 
                they invite collaborators who instantly experience the platform's value, 
                leading to a 22% organic conversion rate.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Business Model",
      subtitle: "Scalable Revenue Architecture",
      content: (
        <div className="grid md:grid-cols-2 gap-12 items-center h-full">
          <div className="space-y-8">
            <div className="p-8 bg-white dark:bg-slate-950 border-2 border-cyan-400 rounded-[3rem] space-y-6 relative shadow-xl dark:shadow-none">
              <div className="absolute -top-4 left-8 px-4 py-1 bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full">Elite Access</div>
              <div className="text-5xl font-black text-slate-900 dark:text-white">£12<span className="text-lg text-slate-400 dark:text-slate-500 font-normal">/mo</span></div>
              <ul className="space-y-3">
                {['Unlimited Protocols', 'Advanced Reasoning', 'PDF/CSV Export', 'Team Collaboration'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-none">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">85%</div>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gross Margin</div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-none">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">4.2x</div>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">LTV/CAC Ratio</div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Future Revenue Streams</h3>
            <div className="space-y-4">
              {[
                "Protocol Marketplace (Transaction Fee)",
                "Enterprise API Licensing",
                "Custom Industry Templates",
                "White-label Solutions"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl text-slate-500 dark:text-slate-400 text-sm italic">
                  <ArrowRight className="w-4 h-4 text-cyan-400" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Vision",
      subtitle: "Precision Systems",
      content: (
        <div className="h-full flex flex-col justify-center space-y-12">
          <div className="max-w-3xl space-y-6">
            <h3 className="text-5xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white leading-tight">
              To become the global standard for human execution.
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              We are building the "Operating System for Tasks." From surgery to startup launches, 
              ExactPath ensures that the world's most important work is done with absolute precision.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex items-center gap-6 shadow-sm dark:shadow-none">
              <div className="w-16 h-16 bg-cyan-400 rounded-2xl flex items-center justify-center shrink-0">
                <Globe className="w-8 h-8 text-slate-950" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">Global Scale</div>
                <div className="text-sm text-slate-500">Deploying to 12+ regions in Q4</div>
              </div>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex items-center gap-6 shadow-sm dark:shadow-none">
              <div className="w-16 h-16 bg-cyan-400 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="w-8 h-8 text-slate-950" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">Contact</div>
                <div className="text-sm text-slate-500">info@mixxd.org</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="fixed inset-0 z-[300] bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Slide 
              title={slides[currentSlide].title} 
              subtitle={slides[currentSlide].subtitle}
            >
              {slides[currentSlide].content}
            </Slide>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 md:p-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Slide {currentSlide + 1} of {slides.length}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={prevSlide}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-cyan-400/50 transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm dark:shadow-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="px-8 py-4 bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-all flex items-center gap-3 shadow-lg shadow-cyan-400/20"
          >
            {currentSlide === slides.length - 1 ? 'Restart' : 'Next Slide'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 brightness-100 contrast-150"></div>
      </div>
    </div>
  );
};
