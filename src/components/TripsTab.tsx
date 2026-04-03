import { motion } from 'motion/react';
import { Navigation, Clock, Gauge, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { TripRecord } from '../types';

export function TripsTab({ trips, isDarkMode }: { trips: TripRecord[], isDarkMode: boolean }) {
  const totalDistance = trips.reduce((acc, curr) => acc + curr.distance, 0);
  const totalDuration = trips.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      <h2 className="text-3xl font-black italic uppercase">Trips</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-[2.5rem] bg-[#1E1E24]/80 border border-white/5">
          <p className="text-[10px] font-black text-gray-500 uppercase">Total Distance</p>
          <h3 className="text-2xl font-black italic">{totalDistance.toFixed(1)} KM</h3>
        </div>
        <div className="p-6 rounded-[2.5rem] bg-[#1E1E24]/80 border border-white/5">
          <p className="text-[10px] font-black text-gray-500 uppercase">Total Time</p>
          <h3 className="text-2xl font-black italic">{Math.round(totalDuration / 60)} HRS</h3>
        </div>
      </div>
      {/* ... Trips List ... */}
    </motion.div>
  );
}
