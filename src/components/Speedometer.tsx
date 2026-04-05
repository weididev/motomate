import { cn } from '@/src/lib/utils';
import { Gauge, Play, Square, Timer, MapPin, Clock } from 'lucide-react';
import { Bike, ActiveTrip } from '../types';

interface SpeedometerProps {
  fuelEfficiency: number;
  daysRemaining: number;
  serviceDueKm: number;
  predictedRange: number;
  currentFuel: number;
  fuelCapacity: number;
  bike: Bike | null;
  isDarkMode: boolean;
  activeTrip: ActiveTrip | null;
  startTrip: () => void;
  endTrip: () => void;
  bikeAge: string;
}

export function Speedometer({ 
  fuelEfficiency, 
  daysRemaining, 
  serviceDueKm, 
  predictedRange,
  currentFuel,
  fuelCapacity,
  bike, 
  isDarkMode,
  activeTrip,
  startTrip,
  endTrip,
  bikeAge
}: SpeedometerProps) {
  const percentage = 75; // Mock speed/progress
  const strokeDasharray = 2 * Math.PI * 80;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * 0.75 * percentage) / 100;

  const odoValue = bike?.odometer || 0;
  const odoStr = odoValue.toFixed(1).padStart(8, '0'); // e.g. 007260.3

  // Fuel Bars: dynamic based on capacity
  const capacity = Math.round(fuelCapacity || 10);
  const fuelBars = Math.min(capacity, Math.ceil(currentFuel));

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Speedometer Ring */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-[225deg]">
          {/* Background Track */}
          <circle
            cx="128"
            cy="128"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={strokeDasharray * 0.75}
            strokeLinecap="round"
            className="text-gray-200 dark:text-gray-800"
          />
          {/* Progress Track */}
          <circle
            cx="128"
            cy="128"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={strokeDasharray * 0.75}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-orange-500 transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Inner Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="mb-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Mileage</p>
            <p className="text-3xl font-black italic tracking-tighter text-orange-500">{fuelEfficiency} <span className="text-xs font-normal opacity-50">KM/L</span></p>
          </div>
          <div className="w-12 h-[1px] bg-white/10 my-2" />
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Next Service</p>
            <p className="text-xl font-black italic tracking-tighter text-orange-500">{daysRemaining > 0 ? daysRemaining : 0} <span className="text-xs font-normal opacity-50">DAYS</span></p>
            <p className="text-[10px] font-bold text-gray-400">or {serviceDueKm} KM</p>
          </div>
        </div>

        {/* Fuel Bars Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(capacity)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-2 h-4 rounded-full transition-all duration-500", 
                i < fuelBars 
                  ? (fuelBars <= Math.max(1, Math.floor(capacity * 0.2)) ? "bg-red-500 animate-pulse" : "bg-orange-500") 
                  : (isDarkMode ? "bg-white/5" : "bg-gray-200")
              )} 
            />
          ))}
        </div>
      </div>

      {/* Odometer Display Below Meter */}
      <div className="mt-6 flex flex-col items-center">
        <div className={cn(
          "px-6 py-4 rounded-[2rem] border flex items-center gap-4 shadow-xl",
          isDarkMode ? "bg-black/60 border-white/10 shadow-black/50" : "bg-white border-gray-200 shadow-gray-200"
        )}>
          <Gauge className="w-5 h-5 text-orange-500" />
          <div className="flex gap-0.5 items-center">
            {odoStr.split('').map((digit, i) => (
              <span key={i} className={cn(
                "w-6 h-9 flex items-center justify-center font-mono font-black text-xl rounded shadow-inner",
                digit === '.' ? "w-2 bg-transparent text-orange-500" : (isDarkMode ? "bg-white/5 text-orange-400" : "bg-gray-100 text-gray-800")
              )}>{digit}</span>
            ))}
            <span className="ml-2 text-[10px] font-black text-gray-500 uppercase tracking-widest self-end mb-1">KM</span>
          </div>
        </div>

        {/* Predicted Range - Moved below Odometer */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-bold italic">Fuel might last for approx {predictedRange} km</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/10">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Age: {bikeAge}</span>
          </div>
        </div>
      </div>

      {/* Innovative Trip Controls - Below Odometer */}
      <div className="mt-10 flex items-center justify-center w-full px-8">
        {!activeTrip ? (
          <button 
            onClick={startTrip}
            className="relative group flex items-center justify-center"
          >
            {/* Pulsing background glow */}
            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity rounded-full" />
            
            <div className={cn(
              "relative flex items-center gap-4 px-8 py-4 rounded-full border-2 transition-all active:scale-95",
              isDarkMode 
                ? "bg-[#1E1E24] border-orange-500/30 hover:border-orange-500 text-white" 
                : "bg-white border-orange-500/20 hover:border-orange-500 text-gray-900 shadow-lg shadow-orange-500/10"
            )}>
              <div className="bg-orange-500 p-2 rounded-full shadow-lg shadow-orange-500/40">
                <Play className="w-4 h-4 text-black fill-black" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Ignition</p>
                <p className="text-sm font-black italic uppercase tracking-tight">Begin Journey</p>
              </div>
            </div>
          </button>
        ) : (
          <button 
            onClick={endTrip}
            className="relative group flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse rounded-full" />
            
            <div className={cn(
              "relative flex items-center gap-4 px-8 py-4 rounded-full border-2 border-red-500/50 transition-all active:scale-95",
              isDarkMode ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600 shadow-lg shadow-red-500/10"
            )}>
              <div className="bg-red-500 p-2 rounded-full shadow-lg shadow-red-500/40 animate-pulse">
                <Square className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Active Trip</p>
                <p className="text-sm font-black italic uppercase tracking-tight">End Journey</p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
            }
