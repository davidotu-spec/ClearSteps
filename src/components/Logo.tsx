import React from 'react';
import { Target } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", iconOnly = false }) => {
  const icon = (
    <div className={`${className} bg-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-white/20`}>
      <Target className="w-3/5 h-3/5 text-slate-950" />
    </div>
  );

  if (iconOnly) {
    return icon;
  }

  return (
    <div className="flex items-center gap-3">
      {icon}
      <h1 className="text-2xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">
        ExactPath <span className="text-cyan-400">AI</span>
      </h1>
    </div>
  );
};
