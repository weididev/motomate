import { motion } from 'motion/react';
import { 
  Navigation, 
  Clock, 
  Gauge, 
  CalendarDays,
  ChevronRight,
  TrendingUp,
  MapPin,
  Droplets,
  Trash2,
  Flag,
  Edit2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { TripRecord } from '../types';

interface TripsTabProps {
  trips: TripRecord[];
  isDarkMode: boolean;
  fuelEfficiency: number;
  lastFuelPrice: number;
  deleteRecord: (id: string, category: 'fuel' | 'maintenance' | 'accessory' | 'trip') => void;
  editRecord: (id: string, category: 'fuel' | 'maintenance' | 'accessory' | 'trip', updatedData: any) => void;
}

export function TripsTab({ trips, isDarkMode, fuelEfficiency, lastFuelPrice, deleteRecord, editRecord }: TripsTabProps) {
  const sortedTrips = [...trips].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const totalDistance = trips.reduce((acc, trip) => acc + trip.distance, 0);
  const totalDuration = trips.reduce((acc, trip) => acc + trip.durationMinutes, 0);
  const avgDistance = trips.length > 0 ? (totalDistance / trips.length).toFixed(1) : 0;

  return (
    <motion.div
      key="trips"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-10"
    >
      <h2 className="text-3xl font-black italic tracking-tighter uppercase">Trip History</h2>

      {/* Trip Analytics Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-6 rounded-[2rem] border relative overflow-hidden",
          isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100 shadow-sm"
        )}>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/10 blur-2xl rounded-full" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Distance</p>
          <h3 className="text-2xl font-black italic text-orange-500">{totalDistance.toFixed(1)} <span className="text-xs font-normal opacity-50">KM</span></h3>
        </div>
        <div className={cn(
          "p-6 rounded-[2rem] border relative overflow-hidden",
          isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100 shadow-sm"
        )}>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 blur-2xl rounded-full" />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Time</p>
          <h3 className="text-2xl font-black italic text-blue-500">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</h3>
        </div>
      </div>

      <div className={cn(
        "p-6 rounded-[2.5rem] border backdrop-blur-md",
        isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100 shadow-sm"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-black uppercase tracking-widest">Recent Journeys</h3>
        </div>

        <div className="space-y-4">
          {sortedTrips.length > 0 ? (
            sortedTrips.map((trip) => {
              // Smart on-the-fly calculation for all trips
              const estimatedFuel = trip.fuelConsumed || (fuelEfficiency > 0 ? trip.distance / fuelEfficiency : 0);
              const estimatedCost = trip.cost || (estimatedFuel * lastFuelPrice);

              return (
                <div key={trip.id} className={cn(
                  "p-5 rounded-2xl border transition-all group",
                  isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/10 p-2.5 rounded-xl">
                        <Navigation className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{format(new Date(trip.startTime), 'dd MMM yyyy')}</p>
                          {trip.type && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-widest">
                              {trip.type}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {format(new Date(trip.startTime), 'hh:mm a')} - {format(new Date(trip.endTime), 'hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-black italic text-orange-500">{trip.distance} <span className="text-[10px] font-normal opacity-50">KM</span></p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{trip.durationMinutes} MINS</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => editRecord(trip.id, 'trip', trip)}
                          className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteRecord(trip.id, 'trip')}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {trip.laps && trip.laps.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                        <Flag className="w-3 h-3" /> Laps
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {trip.laps.map((lap, idx) => (
                          <div key={lap.id} className={cn(
                            "px-3 py-2 rounded-xl border flex flex-col min-w-[80px]",
                            isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-gray-200"
                          )}>
                            <span className="text-[8px] font-bold text-gray-500 uppercase">{lap.type || `Lap ${idx + 1}`}</span>
                            <span className="text-xs font-black italic">{lap.distance.toFixed(1)} KM</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Breakdown */}
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Segment Breakdown</p>
                        {Object.entries(
                          trip.laps.reduce((acc, lap) => {
                            const type = lap.type || 'Regular';
                            acc[type] = (acc[type] || 0) + lap.distance;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([type, dist]) => {
                          const fuel = fuelEfficiency > 0 ? dist / fuelEfficiency : 0;
                          const cost = fuel * lastFuelPrice;
                          return (
                            <div key={type} className="flex justify-between items-center text-xs">
                              <span className="font-bold">{type}</span>
                              <div className="text-right">
                                <span className="text-orange-500 font-black">{dist.toFixed(1)} KM</span>
                                <span className="text-gray-500 ml-2">₹{cost.toFixed(1)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "grid grid-cols-3 gap-4 pt-4 border-t",
                    isDarkMode ? "border-white/10" : "border-gray-100"
                  )}>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{trip.startOdometer} → {trip.endOdometer}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Droplets className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{estimatedFuel.toFixed(2)} L</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] font-bold text-green-500 uppercase">₹{estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold">No trips recorded yet.</p>
              <p className="text-[10px] uppercase tracking-widest mt-1">Start a trip from the dashboard</p>
            </div>
          )}
        </div>
      </div>

      {trips.length > 0 && (
        <div className={cn(
          "p-6 rounded-[2.5rem] bg-orange-500 text-black",
          "shadow-xl shadow-orange-500/20"
        )}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Average Insight</h3>
          <p className="text-lg font-black italic leading-tight">
            Your average trip is {avgDistance} KM long. 
            {parseFloat(String(avgDistance)) < 5 
              ? " Short trips are great for city commutes!" 
              : parseFloat(String(avgDistance)) < 50 
                ? " Perfect distance for maintaining engine health." 
                : " You're a true highway cruiser!"}
          </p>
        </div>
      )}
    </motion.div>
  );
}
