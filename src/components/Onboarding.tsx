import { useState } from 'react';
import { motion } from 'motion/react';
import { Bike, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  setBike: any;
  setShowOnboarding: (show: boolean) => void;
  isDarkMode: boolean;
}

export function Onboarding({ setBike, setShowOnboarding, isDarkMode }: OnboardingProps) {
  const [formData, setFormData] = useState({
    name: '', company: '', model: '', registrationNumber: '', purchaseDate: '', odometer: '', fuelCapacity: '10'
  });

  const handleFinish = () => {
    if (!formData.name || !formData.model) return;
    setBike({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      odometer: parseFloat(formData.odometer) || 0,
      fuelCapacity: parseFloat(formData.fuelCapacity) || 10,
      year: new Date().getFullYear()
    });
    setShowOnboarding(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 py-10"
    >
      <div className="text-center space-y-2">
        <div className="bg-orange-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/20">
          <Bike className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase">Welcome</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Let's setup your bike</p>
      </div>

      <div className="space-y-4">
        <input 
          type="text" placeholder="Bike Name (e.g., My Beast)"
          value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
          className={cn("w-full p-5 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100")}
        />
        <input 
          type="text" placeholder="Model (e.g., MT-15)"
          value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}
          className={cn("w-full p-5 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100")}
        />
        <input 
          type="number" placeholder="Current Odometer (KM)"
          value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})}
          className={cn("w-full p-5 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100")}
        />
        <input 
          type="date"
          value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
          className={cn("w-full p-5 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100")}
        />
      </div>

      <button 
        onClick={handleFinish}
        className="w-full bg-orange-500 text-black py-6 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
      >
        Get Started <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
