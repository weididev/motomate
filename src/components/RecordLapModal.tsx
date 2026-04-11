import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ActiveTrip } from '../types';

interface RecordLapModalProps {
  activeTrip: ActiveTrip;
  liveOdometer: number;
  onRecord: (distance: number, type: 'Pickup' | 'Drop' | 'Free ride' | 'Regular') => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export function RecordLapModal({ activeTrip, liveOdometer, onRecord, onClose, isDarkMode }: RecordLapModalProps) {
  const lastOdo = activeTrip.laps.length > 0 
    ? activeTrip.laps[activeTrip.laps.length - 1].odometer 
    : activeTrip.startOdometer;
  
  const previousTotalDistance = Math.round((lastOdo - activeTrip.startOdometer) * 10) / 10;
  
  const [enteredDistance, setEnteredDistance] = useState('');

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
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Record Lap</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Start Odo: {activeTrip.startOdometer} KM</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-black/5 dark:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">
              Total Trip Distance (KM)
            </label>
            <input 
              type="number" 
              step="0.1"
              value={enteredDistance}
              onChange={(e) => setEnteredDistance(e.target.value)}
              placeholder="e.g. 1.5"
              className={cn(
                "w-full p-6 rounded-[2rem] text-2xl font-black italic border outline-none text-center",
                isDarkMode ? "bg-white/5 border-white/5 text-orange-500" : "bg-gray-50 border-gray-100 text-orange-600"
              )}
            />
            <p className="text-[10px] text-center text-gray-500 font-bold uppercase">
              Previous Lap Distance: {previousTotalDistance} KM
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Select Segment Type</p>
            <div className="grid grid-cols-3 gap-2">
              {(['Pickup', 'Drop', 'Free ride'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const totalDistVal = parseFloat(enteredDistance);
                    if (isNaN(totalDistVal) || totalDistVal <= previousTotalDistance) {
                      alert(`Please enter a total trip distance greater than ${previousTotalDistance} KM`);
                      return;
                    }
                    const segmentDist = Math.round((totalDistVal - previousTotalDistance) * 10) / 10;
                    onRecord(segmentDist, type);
                    onClose();
                  }}
                  className={cn(
                    "py-4 rounded-2xl text-[10px] font-bold uppercase tracking-tighter border transition-all active:scale-95",
                    isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
