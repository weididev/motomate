import { useState } from 'react';
import { motion } from 'motion/react';
import { Bike } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { Bike as BikeType } from '../types';

interface OnboardingProps {
  setBike: React.Dispatch<React.SetStateAction<BikeType | null>>;
  setShowOnboarding: (show: boolean) => void;
  isDarkMode: boolean;
}

export function Onboarding({ setBike, setShowOnboarding, isDarkMode }: OnboardingProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNumber: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    odometer: 0,
    price: '',
    registrationValidity: '',
    insuranceExpiry: '',
    engineNumber: '',
    chassisNumber: '',
    fuelCapacity: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBike({ 
      ...formData, 
      id: '1',
      odometer: Math.round((formData.odometer || 0) * 10) / 10,
      price: formData.price ? parseFloat(formData.price) : undefined,
      fuelCapacity: formData.fuelCapacity,
      registrationValidity: formData.registrationValidity || undefined,
      insuranceExpiry: formData.insuranceExpiry || undefined
    });
    setShowOnboarding(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8 relative z-10"
    >
      <div className="text-center">
        <div className="inline-block bg-orange-500/10 p-4 rounded-3xl mb-4">
          <Bike className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Initialize Unit</h2>
        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-2">Setup your Bike Profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Bike Nickname</label>
          <input 
            type="text" 
            placeholder="e.g. Dark Knight"
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Company</label>
            <input 
              type="text" 
              placeholder="e.g. Yamaha"
              required
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Model</label>
            <input 
              type="text" 
              placeholder="e.g. MT-15"
              required
              value={formData.model}
              onChange={e => setFormData({...formData, model: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Registration Number</label>
          <input 
            type="text" 
            placeholder="WB-XX-XXXX"
            value={formData.registrationNumber}
            onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
            className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Purchase Date</label>
            <input 
              type="date" 
              required
              value={formData.purchaseDate}
              onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Current ODO (KM)</label>
            <input 
              type="number" 
              step="0.1"
              required
              min="0"
              placeholder="0.0"
              value={formData.odometer === 0 ? '' : formData.odometer}
              onChange={e => {
                const val = e.target.value;
                if (/^\d*\.?\d{0,1}$/.test(val)) {
                  setFormData({...formData, odometer: val as any});
                }
              }}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Bike Price (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 180000"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Fuel Capacity (L)</label>
            <input 
              type="number" 
              step="0.1"
              required
              placeholder="e.g. 10"
              value={formData.fuelCapacity || ''}
              onChange={e => setFormData({...formData, fuelCapacity: parseFloat(e.target.value) || 0})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Reg. Validity</label>
            <input 
              type="date" 
              value={formData.registrationValidity}
              onChange={e => setFormData({...formData, registrationValidity: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Insurance Expiry</label>
            <input 
              type="date" 
              value={formData.insuranceExpiry}
              onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-orange-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95 mt-4"
        >
          Activate System
        </button>
      </form>
    </motion.div>
  );
}
