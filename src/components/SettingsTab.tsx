import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Gauge, 
  Download, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Bike as BikeType } from '../types';

interface SettingsTabProps {
  bike: BikeType | null;
  isDarkMode: boolean;
  handleShareData: () => void;
  handleReset: () => void;
}

export function SettingsTab({
  bike,
  isDarkMode,
  handleShareData,
  handleReset
}: SettingsTabProps) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-3xl font-black italic tracking-tighter uppercase">System Config</h2>
      
      {/* Main Odometer Card Moved Here */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className={cn(
          "relative p-8 rounded-[2.5rem] overflow-hidden border transition-all backdrop-blur-md",
          isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100"
        )}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">Active Unit</p>
              <h2 className="text-3xl font-black italic tracking-tighter">{bike?.name}</h2>
            </div>
            <div className="bg-orange-600/10 p-3 rounded-2xl">
              <Gauge className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Distance</p>
              <p className="text-3xl font-black tracking-tighter">{bike?.odometer} <span className="text-sm font-normal opacity-50">KM</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Reg No.</p>
              <p className="text-xl font-black tracking-tighter opacity-80">{bike?.registrationNumber}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-current opacity-10 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest">{bike?.company} {bike?.model}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Purchased: {bike?.purchaseDate}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] ml-4">Data Management</h3>
        
        <button 
          onClick={handleShareData}
          className={cn(
            "w-full p-6 rounded-3xl flex items-center justify-between border group transition-all",
            isDarkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-white border-gray-100 hover:bg-gray-50 shadow-sm"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold">Export Data</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Share or save backup</p>
            </div>
          </div>
        </button>

        <button 
          onClick={handleReset}
          className={cn(
            "w-full p-6 rounded-3xl flex items-center justify-between border group transition-all",
            isDarkMode ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20" : "bg-red-50 border-red-100 hover:bg-red-100"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-red-500">Factory Reset</p>
              <p className="text-[10px] text-red-400 uppercase tracking-widest">Clear all data</p>
            </div>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-500 opacity-50" />
        </button>
      </div>

      <div className={cn(
        "p-8 rounded-[2.5rem] border backdrop-blur-md",
        isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100"
      )}>
        <h3 className="text-xs font-bold text-orange-500 uppercase tracking-[0.3em] mb-4">App Info</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Version</span>
          <span className="font-bold">v5.0.0-MT15</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Build Mode</span>
          <span className="font-bold text-orange-500">NATIVE OFFLINE</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Developer</span>
          <span className="font-bold">weididev</span>
        </div>
      </div>
    </motion.div>
  );
                            }
