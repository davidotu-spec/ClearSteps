import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { CheckCircle2, X, Zap, Loader2 } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isLoading?: boolean;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side: Info */}
              <div className="p-10 space-y-8 bg-slate-50 dark:bg-slate-950/50">
                <div className="space-y-4">
                  <Logo className="w-12 h-12" iconOnly />
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">Elite Access</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Unlock the full potential of the ExactPath engine. Engineered for professionals who demand absolute precision.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    'Unlimited Protocol Generation',
                    'Advanced Reasoning Engine',
                    'PDF & CSV Data Export',
                    'Elite Protocol Marketplace',
                    'Custom Template Library',
                    'Priority System Access'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: CTA */}
              <div className="p-10 flex flex-col justify-center items-center text-center space-y-8 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Monthly Subscription</div>
                  <div className="text-6xl font-black text-slate-900 dark:text-white">£12</div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Cancel Anytime</div>
                </div>

                <button 
                  onClick={onUpgrade}
                  disabled={isLoading}
                  className="w-full py-5 bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>Processing... <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Upgrade Now <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" /></>
                  )}
                </button>

                <div className="flex flex-col items-center gap-2">
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                    Secure checkout powered by Stripe.
                  </p>
                  <div className="flex gap-2 opacity-30 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
