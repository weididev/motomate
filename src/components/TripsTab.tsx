import { motion } from 'motion/react';
import { Navigation, Clock, Gauge, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { TripRecord } from '../types';

interface TripsTabProps {
  trips: TripRecord[];
  isDarkMode: boolean;
}

export function TripsTab({ trips, isDarkMode }: TripsTabProps) {
  const totalDistance = trips.reduce((acc, curr) => acc + curr.distance, 0);
  const totalDuration = trips.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Trips</h2>
        <div className="bg-orange-500/10 p-2 rounded-xl">
          <Navigation className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className={cn("p-6 rounded-[2.5rem] border", isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100")}>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Total Distance</p>
          <h3 className="text-2xl font-black italic tracking-tighter">{totalDistance.toLocaleString()} <span className="text-sm font-normal opacity-50">KM</span></h3>
        </div>
        <div className={cn("p-6 rounded-[2.5rem] border", isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100")}>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Total Time</p>
          <h3 className="text-2xl font-black italic tracking-tighter">{Math.round(totalDuration / 60)} <span className="text-sm font-normal opacity-50">HRS</span></h3>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Navigation className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold">No trips recorded yet.</p>
          </div>
        ) : (
          trips.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).map((trip) => (
            <div key={trip.id} className={cn("p-6 rounded-[2rem] border transition-all", isDarkMode ? "bg-[#1E1E24]/50 border-white/5" : "bg-white border-gray-100")}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/10 p-2 rounded-lg"><MapPin className="w-4 h-4 text-orange-500" /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{new Date(trip.startTime).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <p className="text-lg font-black italic">{trip.distance} <span className="text-[10px] font-normal opacity-50">KM</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-current opacity-10">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 opacity-50" />
                  <span className="text-[10px] font-bold uppercase">{trip.durationMinutes} MIN</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-3 h-3 opacity-50" />
                  <span className="text-[10px] font-bold uppercase">{trip.endOdometer - trip.startOdometer} KM</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
