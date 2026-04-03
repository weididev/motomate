import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bike as BikeIcon, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Bike as BikeType } from '../types';

interface EditBikeModalProps {
  bike: BikeType;
  setBike: React.Dispatch<React.SetStateAction<BikeType | null>>;
  onClose: () => void;
  isDarkMode: boolean;
  bikeAge: string;
}

export function EditBikeModal({ bike, setBike, onClose, isDarkMode, bikeAge }: EditBikeModalProps) {
  const [formData, setFormData] = useState<Partial<BikeType>>(bike);
  const [odoInput, setOdoInput] = useState(bike.odometer.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBike({
      ...(formData as BikeType),
      odometer: parseFloat(odoInput) || 0,
      price: formData.price ? parseFloat(formData.price as any) : undefined,
      fuelCapacity: formData.fuelCapacity ? parseFloat(formData.fuelCapacity as any) : 10,
      manualServiceKm: formData.manualServiceKm ? parseFloat(formData.manualServiceKm as any) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl border max-h-[90vh] overflow-y-auto custom-scrollbar",
          isDarkMode ? "bg-[#1E1E24] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-xl">
              <BikeIcon className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="font-black italic uppercase tracking-wider">Edit Profile</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Clock className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{bikeAge}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Bike Nickname</label>
            <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Company</label>
              <input type="text" required value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Model</label>
              <input type="text" required value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Registration Number</label>
            <input type="text" value={formData.registrationNumber || ''} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Purchase Date</label>
              <input type="date" required value={formData.purchaseDate || ''} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Current ODO (KM)</label>
              <input 
                type="number" 
                step="0.1" 
                required 
                min="0" 
                value={odoInput} 
                onChange={e => {
                  const val = e.target.value;
                  if (/^\d*\.?\d{0,1}$/.test(val)) {
                    setOdoInput(val);
                  }
                }} 
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Bike Price (₹)</label>
              <input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || undefined})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Fuel Capacity (L)</label>
              <input type="number" step="0.1" required value={formData.fuelCapacity || ''} onChange={e => setFormData({...formData, fuelCapacity: parseFloat(e.target.value) || 0})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Reg. Validity</label>
              <input type="date" value={formData.registrationValidity || ''} onChange={e => setFormData({...formData, registrationValidity: e.target.value})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-4">Manual Service Reminder</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Next Service (KM)</label>
                <input type="number" placeholder="e.g. 5000" value={formData.manualServiceKm || ''} onChange={e => setFormData({...formData, manualServiceKm: parseFloat(e.target.value) || undefined})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Next Service Date</label>
                <input type="date" value={formData.manualServiceDate || ''} onChange={e => setFormData({...formData, manualServiceDate: e.target.value})} className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
              </div>
            </div>
            <p className="text-[9px] text-gray-500 mt-2 ml-2 leading-relaxed">Leave blank to use the default automated schedule (1k, 5k, 9k, 13k, 17k, 21k, 25k, 29k).</p>
          </div>

          <button type="submit" className="w-full py-4 rounded-2xl bg-orange-500 text-black font-black uppercase tracking-widest mt-6 hover:bg-orange-400 transition-colors">
            Save Profile
          </button>
        </form>
      </motion.div>
    </div>
  );
}

