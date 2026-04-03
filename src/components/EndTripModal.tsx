import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Clock, Gauge } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { cn } from '../lib/utils';
import { Bike, ActiveTrip, TripRecord } from '../types';

interface EndTripModalProps {
  activeTrip: ActiveTrip;
  bike: Bike | null;
  setBike: React.Dispatch<React.SetStateAction<Bike | null>>;
  setTrips: React.Dispatch<React.SetStateAction<TripRecord[]>>;
  setActiveTrip: (trip: ActiveTrip | null) => void;
  setShowEndTripModal: (show: boolean) => void;
  isDarkMode: boolean;
}

export function EndTripModal({
  activeTrip,
  bike,
  setBike,
  setTrips,
  setActiveTrip,
  setShowEndTripModal,
  isDarkMode
}: EndTripModalProps) {
  const [inputMode, setInputMode] = useState<'odo' | 'km'>('km');
  const [odoValue, setOdoValue] = useState('');
  const [kmValue, setKmValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentOdo = bike?.odometer || 0;
  const odoStr = Math.floor(currentOdo).toString();
  const initialOdoPrefix = odoStr.slice(0, -2);
  
  useEffect(() => {
    if (inputMode === 'odo' && odoValue === '') {
      setOdoValue(initialOdoPrefix);
    }
  }, [inputMode, initialOdoPrefix, odoValue]);

  const handleOdoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,1}$/.test(val)) {
      setOdoValue(val);
    }
  };

  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,1}$/.test(val)) {
      setKmValue(val);
    }
  };

  const handleSave = () => {
    let finalEndOdo = currentOdo;
    if (inputMode === 'odo') {
      finalEndOdo = parseFloat(odoValue);
    } else {
      finalEndOdo = currentOdo + parseFloat(kmValue);
    }
    
    finalEndOdo = Math.round(finalEndOdo * 10) / 10;

    if (isNaN(finalEndOdo) || finalEndOdo < currentOdo) {
      alert(`Invalid reading. Must be at least ${currentOdo} KM.`);
      return;
    }

    const endTime = new Date().toISOString();
    const duration = differenceInMinutes(new Date(endTime), new Date(activeTrip.startTime));
    const distance = Math.round((finalEndOdo - activeTrip.startOdometer) * 10) / 10;

    const newTrip: TripRecord = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: activeTrip.startTime,
      endTime,
      startOdometer: activeTrip.startOdometer,
      endOdometer: finalEndOdo,
      distance,
      durationMinutes: duration
    };

    setTrips(prev => [...prev, newTrip]);
    setBike(prev => prev ? { ...prev, odometer: finalEndOdo } : null);
    setActiveTrip(null);
    setShowEndTripModal(false);
  };

  const duration = differenceInMinutes(new Date(), new Date(activeTrip.startTime));

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
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Trip Summary</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Complete your journey</p>
          </div>
          <button onClick={() => setShowEndTripModal(false)} className="p-2 rounded-full bg-black/5 dark:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={cn("p-4 rounded-3xl border", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Duration</span>
            </div>
            <p className="text-lg font-black italic">{duration} <span className="text-xs font-normal opacity-50">MIN</span></p>
          </div>
          <div className={cn("p-4 rounded-3xl border", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Start Odo</span>
            </div>
            <p className="text-lg font-black italic">{activeTrip.startOdometer} <span className="text-xs font-normal opacity-50">KM</span></p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
            <button
              onClick={() => setInputMode('odo')}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                inputMode === 'odo' ? "bg-orange-500 text-black shadow-lg" : "text-gray-500"
              )}
            >
              Odometer
            </button>
            <button
              onClick={() => setInputMode('km')}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                inputMode === 'km' ? "bg-orange-500 text-black shadow-lg" : "text-gray-500"
              )}
            >
              KM Traveled
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">
              {inputMode === 'odo' ? 'Current Odometer Reading (KM)' : 'Distance Traveled (KM)'}
            </label>
            <div className="relative">
              <input 
                ref={inputRef}
                type="number" 
                step="0.1"
                value={inputMode === 'odo' ? odoValue : kmValue}
                onChange={(e) => inputMode === 'odo' ? handleOdoChange(e) : handleKmChange(e)}
                placeholder={inputMode === 'odo' ? "0.0" : "0.0"}
                className={cn(
                  "w-full p-6 rounded-[2rem] text-2xl font-black italic border outline-none text-center",
                  isDarkMode ? "bg-white/5 border-white/5 text-orange-500" : "bg-gray-50 border-gray-100 text-orange-600"
                )}
              />
              {inputMode === 'odo' && (
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none opacity-20">
                  <span className="text-2xl font-black italic">KM</span>
                </div>
              )}
            </div>
            {inputMode === 'odo' && (
              <p className="text-[10px] text-center text-gray-500 font-bold uppercase mt-2">
                Previous: {currentOdo} KM
              </p>
            )}
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-orange-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
          >
            Finish Journey
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
                }
