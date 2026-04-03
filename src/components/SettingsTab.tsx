import { motion } from 'motion/react';
import { Settings, Sun, Moon, Database } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsTabProps {
  isDarkMode: boolean;
  setIsDarkMode: (mode: boolean) => void;
}

export function SettingsTab({ isDarkMode, setIsDarkMode }: SettingsTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Settings</h2>
        <div className="bg-gray-500/10 p-2 rounded-xl">
          <Settings className="w-6 h-6 text-gray-500" />
        </div>
      </div>

      <div className={cn("p-8 rounded-[2.5rem] border space-y-6", isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100")}>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">Appearance</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", isDarkMode ? "bg-white/5" : "bg-gray-100")}>
              {isDarkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-orange-500" />}
            </div>
            <div>
              <p className="text-sm font-bold">Dark Mode</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold">Switch theme</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn("w-14 h-8 rounded-full p-1 transition-all", isDarkMode ? "bg-orange-500" : "bg-gray-300")}
          >
            <div className={cn("w-6 h-6 rounded-full bg-white transition-all", isDarkMode ? "translate-x-6" : "translate-x-0")} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
