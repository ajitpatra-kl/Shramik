import React from 'react';
import { Sparkles } from 'lucide-react';

const Logo = ({ className = "w-10 h-10", textClass = "text-xl" }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className={`rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform ${className}`}>
      <Sparkles className="w-1/2 h-1/2 text-white" />
    </div>
    <span className={`font-black tracking-tight text-white ${textClass}`}>
      Shramik<span className="text-indigo-400">Pro</span>
    </span>
  </div>
);

export default Logo;