import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Navigation } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { TripRecord } from '../types';

interface EditTripModalProps {
  trip: TripRecord;
  onSave: (id: string, updatedData: Partial<TripRecord>) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export function EditTripModal({ trip, onSave, onClose, isDarkMode }: EditTripModalProps) {
  const [distance, setDistance] = useState(trip.distance.toString());
  const [duration, setDuration] = useState(trip.durationMinutes.toString());
  const [cost, setCost] = useState(trip.cost.toString());

  const handleSave = () => {
    const updatedDistance = parseFloat(distance);
    const updatedDuration = parseInt(duration, 10);
    const updatedCost = parseFloat(cost);

    if (isNaN(updatedDistance) || isNaN(updatedDuration) || isNaN(updatedCost)) {
      alert("Please enter valid numbers");
      return;
    }

    onSave(trip.id, {
      distance: updatedDistance,
      durationMinutes: updatedDuration,
      cost: updatedCost,
      endOdometer: trip.startOdometer + updatedDistance
    });
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
          "w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border",
          isDarkMode ? "bg-[#1E1E24] border-white/10" : "bg-white border-gray-100"
        )}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Edit Trip</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Update journey details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-black/5 dark:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Distance (KM)</label>
            <input 
              type="number" 
              step="0.1"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Duration (Mins)</label>
            <input 
              type="number" 
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Total Cost (₹)</label>
            <input 
              type="number" 
              step="0.1"
              value={cost}
              onChange={e => setCost(e.target.value)}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
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
