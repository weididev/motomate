import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Bike } from '../types';

interface EditBikeModalProps {
  bike: Bike;
  setBike: React.Dispatch<React.SetStateAction<Bike | null>>;
  onClose: () => void;
  isDarkMode: boolean;
  bikeAge: string;
}

export function EditBikeModal({ bike, setBike, onClose, isDarkMode, bikeAge }: EditBikeModalProps) {
  const [formData, setFormData] = useState({ ...bike });

  const handleSave = () => {
    setBike(formData);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={cn(
          "w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border",
          isDarkMode ? "bg-[#1E1E24] border-white/10" : "bg-white border-gray-100"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Edit Bike</h3>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Unit Age: {bikeAge}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-black/5 dark:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Bike Name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
          />
          <input 
            type="text" 
            placeholder="Registration Number"
            value={formData.registrationNumber}
            onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
            className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
          />
          <input 
            type="number" 
            placeholder="Odometer"
            value={formData.odometer}
            onChange={e => setFormData({...formData, odometer: parseFloat(e.target.value)})}
            className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
          />
          
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
