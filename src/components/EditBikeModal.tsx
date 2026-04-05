import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Bike } from '../types';

interface EditBikeModalProps {
  bike: Bike | null;
  setBike: React.Dispatch<React.SetStateAction<Bike | null>>;
  setShowEditBikeModal: (show: boolean) => void;
  isDarkMode: boolean;
}

export function EditBikeModal({ bike, setBike, setShowEditBikeModal, isDarkMode }: EditBikeModalProps) {
  const [formData, setFormData] = useState({
    name: bike?.name || '',
    company: bike?.company || '',
    model: bike?.model || '',
    year: bike?.year || new Date().getFullYear(),
    registrationNumber: bike?.registrationNumber || '',
    purchaseDate: bike?.purchaseDate || '',
    price: bike?.price || '',
    registrationValidity: bike?.registrationValidity || '',
    engineNumber: bike?.engineNumber || '',
    chassisNumber: bike?.chassisNumber || '',
    fuelCapacity: bike?.fuelCapacity || 10
  });

  const handleSave = () => {
    if (bike) {
      setBike({
        ...bike,
        ...formData,
        price: formData.price ? parseFloat(formData.price as string) : undefined,
      });
    }
    setShowEditBikeModal(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={cn(
          "w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border max-h-[85vh] overflow-y-auto custom-scrollbar",
          isDarkMode ? "bg-[#1E1E24] border-white/10" : "bg-white border-gray-100"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase">Edit Unit Details</h3>
          <button onClick={() => setShowEditBikeModal(false)} className="p-2 rounded-full bg-black/5 dark:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Bike Nickname</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Company</label>
              <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Model</label>
              <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Registration Number</label>
            <input type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Purchase Date</label>
              <input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Fuel Capacity (L)</label>
              <input type="number" step="0.1" value={formData.fuelCapacity} onChange={e => setFormData({...formData, fuelCapacity: parseFloat(e.target.value) || 0})}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Bike Price (₹)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Reg. Validity</label>
              <input type="date" value={formData.registrationValidity} onChange={e => setFormData({...formData, registrationValidity: e.target.value})}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-orange-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95 mt-4"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
                }
