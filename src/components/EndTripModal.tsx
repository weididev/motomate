import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { cn } from '../lib/utils';
import { Bike, ActiveTrip, TripRecord } from '../types';

interface EndTripModalProps {
  activeTrip: ActiveTrip; bike: Bike | null; setBike: any; setTrips: any; setActiveTrip: any; setShowEndTripModal: any; isDarkMode: boolean;
}

export function EndTripModal({ activeTrip, bike, setBike, setTrips, setActiveTrip, setShowEndTripModal, isDarkMode }: EndTripModalProps) {
  const [kmValue, setKmValue] = useState('');
  const handleSave = () => {
    const finalOdo = (bike?.odometer || 0) + parseFloat(kmValue);
    const newTrip: TripRecord = { id: Math.random().toString(36).substr(2, 9), startTime: activeTrip.startTime, endTime: new Date().toISOString(), startOdometer: activeTrip.startOdometer, endOdometer: finalOdo, distance: parseFloat(kmValue), durationMinutes: differenceInMinutes(new Date(), new Date(activeTrip.startTime)) };
    setTrips((prev: any) => [...prev, newTrip]); setBike((prev: any) => ({ ...prev, odometer: finalOdo })); setActiveTrip(null); setShowEndTripModal(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className={cn("w-full max-w-sm rounded-[2.5rem] p-8 border", isDarkMode ? "bg-[#1E1E24] border-white/10" : "bg-white border-gray-100")}>
        <div className="flex justify-between items-center mb-8"><h3 className="text-xl font-black uppercase italic">End Journey</h3><button onClick={() => setShowEndTripModal(false)}><X className="w-5 h-5" /></button></div>
        <input type="number" value={kmValue} onChange={e => setKmValue(e.target.value)} placeholder="KM Traveled" className="w-full p-6 rounded-[2rem] text-2xl font-black italic border outline-none text-center bg-white/5" />
        <button onClick={handleSave} className="w-full bg-orange-500 text-black py-5 rounded-[2rem] font-black uppercase mt-6">Finish</button>
      </motion.div>
    </div>
  );
}
