import { cn } from '@/src/lib/utils';
import { Gauge, Play, Square, MapPin, Clock } from 'lucide-react';
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
  liveOdometer?: number | null;
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
  bikeAge,
  liveOdometer
}: SpeedometerProps) {
  const percentage = 75; 
  const strokeDasharray = 2 * Math.PI * 80;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * 0.75 * percentage) / 100;

  const odoValue = liveOdometer || bike?.odometer || 0;
  const odoStr = odoValue.toFixed(1).padStart(8, '0');

  // Fuel Bars: 1 bar per Liter (Aapki demand ke hisab se)
  const capacity = Math.round(fuelCapacity || 10);
  const fuelBars = Math.min(capacity, Math.ceil(currentFuel));

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-[225deg]">
          <circle cx="128" cy="128" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={strokeDasharray * 0.75} strokeLinecap="round" className="text-gray-200 dark:text-gray-800" />
          <circle cx="128" cy="128" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={strokeDasharray * 0.75} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="text-orange-500 transition-all duration-1000 ease-out" />
        </svg>
        
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

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(capacity)].map((_, i) => (
            <div key={i} className={cn("w-2 h-4 rounded-full transition-all duration-500", i < fuelBars ? (fuelBars <= Math.max(1, Math.floor(capacity * 0.2)) ? "bg-red-500 animate-pulse" : "bg-orange-500") : (isDarkMode ? "bg-white/5" : "bg-gray-200"))} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className={cn("px-6 py-4 rounded-[2rem] border flex items-center gap-4 shadow-xl relative", isDarkMode ? "bg-black/60 border-white/10 shadow-black/50" : "bg-white border-gray-200 shadow-gray-200")}>
          {liveOdometer && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">Live</div>
          )}
          <Gauge className="w-5 h-5 text-orange-500" />
          <div className="flex gap-0.5 items-center">
            {odoStr.split('').map((digit, i) => (
              <span key={i} className={cn("w-6 h-9 flex items-center justify-center font-mono font-black text-xl rounded shadow-inner", digit === '.' ? "w-2 bg-transparent text-orange-500" : (isDarkMode ? "bg-white/5 text-orange-400" : "bg-gray-100 text-gray-800"))}>{digit}</span>
            ))}
            <span className="ml-2 text-[10px] font-black text-gray-500 uppercase tracking-widest self-end mb-1">KM</span>
          </div>
        </div>

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

      <div className="mt-10 flex items-center justify-center w-full px-8">
        {!activeTrip ? (
          <button onClick={startTrip} className="relative group flex items-center justify-center">
            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity rounded-full" />
            <div className={cn("relative flex items-center gap-4 px-8 py-4 rounded-full border-2 transition-all active:scale-95", isDarkMode ? "bg-[#1E1E24] border-orange-500/30 hover:border-orange-500 text-white" : "bg-white border-orange-500/20 hover:border-orange-500 text-gray-900 shadow-lg shadow-orange-500/10")}>
              <div className="bg-orange-500 p-2 rounded-full shadow-lg shadow-orange-500/40"><Play className="w-4 h-4 text-black fill-black" /></div>
              <div className="text-left">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Ignition</p>
                <p className="text-sm font-black italic uppercase tracking-tight">Begin Journey</p>
              </div>
            </div>
          </button>
        ) : (
          <button onClick={endTrip} className="relative group flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse rounded-full" />
            <div className={cn("relative flex items-center gap-4 px-8 py-4 rounded-full border-2 border-red-500/50 transition-all active:scale-95", isDarkMode ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600 shadow-lg shadow-red-500/10")}>
              <div className="bg-red-500 p-2 rounded-full shadow-lg shadow-red-500/40 animate-pulse"><Square className="w-4 h-4 text-white fill-white" /></div>
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
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  History, 
  Settings, 
  LayoutDashboard, 
  Moon, 
  Sun, 
  Trash2, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
  Map,
  PlusCircle
} from 'lucide-react';
import { format, differenceInDays, addMonths, differenceInMinutes, startOfMonth, intervalToDuration } from 'date-fns';
import { MaintenanceRecord, FuelRecord, Bike as BikeType, AccessoryRecord, TripRecord, ActiveTrip } from './types';
import { Speedometer } from './components/Speedometer';
import { AddRecordModal } from './components/AddRecordModal';
import { EndTripModal } from './components/EndTripModal';
import { Onboarding } from './components/Onboarding';
import { EditBikeModal } from './components/EditBikeModal';
import { LogsTab } from './components/LogsTab';
import { TripsTab } from './components/TripsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // User Data State
  const [bike, setBike] = useState<BikeType | null>(() => {
    const saved = localStorage.getItem('motomate_bike');
    return saved ? JSON.parse(saved) : null;
  });
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('motomate_maintenance');
    return saved ? JSON.parse(saved) : [];
  });
  const [fuel, setFuel] = useState<FuelRecord[]>(() => {
    const saved = localStorage.getItem('motomate_fuel');
    return saved ? JSON.parse(saved) : [];
  });
  const [accessories, setAccessories] = useState<AccessoryRecord[]>(() => {
    const saved = localStorage.getItem('motomate_accessories');
    return saved ? JSON.parse(saved) : [];
  });
  const [trips, setTrips] = useState<TripRecord[]>(() => {
    const saved = localStorage.getItem('motomate_trips');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(() => {
    const saved = localStorage.getItem('motomate_activeTrip');
    return saved ? JSON.parse(saved) : null;
  });
  const [serviceIssues, setServiceIssues] = useState<{ id: string, text: string, date: string, resolved: boolean }[]>(() => {
    const saved = localStorage.getItem('motomate_issues');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [newIssueText, setNewIssueText] = useState('');

  // App State
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const savedOnboarding = localStorage.getItem('motomate_onboarding');
    const savedBike = localStorage.getItem('motomate_bike');
    if (savedBike) return false; // Fix onboarding loop
    return savedOnboarding ? JSON.parse(savedOnboarding) : true;
  });
  const [showEditBikeModal, setShowEditBikeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [showInsuranceAlert, setShowInsuranceAlert] = useState(false);
  const [showDumpConfirm, setShowDumpConfirm] = useState(false);

  // Live Trip Automation
  const [liveOdometer, setLiveOdometer] = useState<number | null>(null);
  
  useEffect(() => {
    if (!activeTrip) {
      setLiveOdometer(null);
      return;
    }
    
    const interval = setInterval(() => {
      const elapsedMinutes = differenceInMinutes(new Date(), new Date(activeTrip.startTime));
      const simulatedDistance = (elapsedMinutes / 60) * 40; // 40km/h average
      setLiveOdometer(activeTrip.startOdometer + simulatedDistance);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeTrip]);

  // Insurance Expiry Alert
  useEffect(() => {
    if (bike?.insuranceExpiry) {
      const expiryDate = new Date(bike.insuranceExpiry);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays <= 30) {
        setShowInsuranceAlert(true);
      }
    }
  }, [bike]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Persistence Effects
  useEffect(() => {
    if (bike) localStorage.setItem('motomate_bike', JSON.stringify(bike));
    localStorage.setItem('motomate_maintenance', JSON.stringify(maintenance));
    localStorage.setItem('motomate_fuel', JSON.stringify(fuel));
    localStorage.setItem('motomate_accessories', JSON.stringify(accessories));
    localStorage.setItem('motomate_trips', JSON.stringify(trips));
    localStorage.setItem('motomate_activeTrip', JSON.stringify(activeTrip));
    localStorage.setItem('motomate_issues', JSON.stringify(serviceIssues));
  }, [bike, maintenance, fuel, accessories, trips, activeTrip, serviceIssues]);

  // Derived Stats
  const fuelEfficiency = useMemo(() => {
    if (fuel.length < 2) return 0;
    const sorted = [...fuel].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0];
    const previous = sorted[1];
    const dist = latest.odometer - previous.odometer;
    return dist > 0 ? parseFloat((dist / latest.liters).toFixed(1)) : 0;
  }, [fuel]);

  const currentFuel = useMemo(() => {
    if (!bike) return 0;
    const sortedFuel = [...fuel].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedFuel.length === 0) return 0;
    
    const lastFuel = sortedFuel[0];
    let current = lastFuel.liters;
    const lastOdo = lastFuel.odometer;
    const effectiveEfficiency = fuelEfficiency > 0 ? fuelEfficiency : 40;
    
    const finalDist = (liveOdometer || bike.odometer) - lastOdo;
    const finalConsumed = finalDist / effectiveEfficiency;
    current = Math.max(0, current - finalConsumed);
    
    return parseFloat(current.toFixed(2));
  }, [fuel, fuelEfficiency, bike, liveOdometer]);

  const serviceDueKm = useMemo(() => {
    if (!bike) return 0;
    const lastServiceOdo = maintenance.length > 0 
      ? Math.max(...maintenance.map(m => m.odometer)) 
      : bike.odometer;
    const due = lastServiceOdo + (bike.serviceIntervalKm || 3000);
    return Math.max(0, due - bike.odometer);
  }, [bike, maintenance]);

  const daysRemaining = useMemo(() => {
    if (!bike) return 0;
    const lastServiceDate = maintenance.length > 0 
      ? new Date(Math.max(...maintenance.map(m => new Date(m.date).getTime()))) 
      : new Date(bike.purchaseDate);
    const dueDate = addMonths(lastServiceDate, bike.serviceIntervalMonths || 6);
    return differenceInDays(dueDate, new Date());
  }, [bike, maintenance]);
  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-500 pb-24",
      isDarkMode ? "bg-[#0A0A0B] text-white" : "bg-gray-50 text-gray-900"
    )}>
      {showOnboarding ? (
        <Onboarding onComplete={(data) => {
          setBike(data);
          setShowOnboarding(false);
          localStorage.setItem('motomate_onboarding', 'false');
          showToast("Welcome to MotoMate! 🏍️");
        }} />
      ) : (
        <>
          <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <LayoutDashboard className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">MotoMate</h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{bike?.name || 'My Bike'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                {isDarkMode ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </header>

          <main className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col space-y-8 pb-10 pt-4">
                  {showInsuranceAlert && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mx-4 bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex items-center gap-4">
                      <div className="bg-red-500 p-2 rounded-xl"><ShieldAlert className="w-5 h-5 text-white" /></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Insurance Alert</p>
                        <p className="text-sm font-bold">Your insurance is expiring soon!</p>
                      </div>
                      <button onClick={() => setShowInsuranceAlert(false)} className="p-2 hover:bg-red-500/10 rounded-full"><X className="w-4 h-4 text-red-500" /></button>
                    </motion.div>
                  )}

                  <Speedometer 
                    fuelEfficiency={fuelEfficiency}
                    daysRemaining={daysRemaining}
                    serviceDueKm={serviceDueKm}
                    predictedRange={predictedRange}
                    currentFuel={currentFuel}
                    fuelCapacity={bike?.fuelCapacity || 10}
                    bike={bike}
                    isDarkMode={isDarkMode}
                    activeTrip={activeTrip}
                    startTrip={startTrip}
                    endTrip={endTrip}
                    bikeAge={bikeAge}
                    liveOdometer={liveOdometer}
                  />
                </motion.div>
              )}
              {/* ... Other Tabs ... */}
            </AnimatePresence>
          </main>
        </>
      )}
    </div>
  );
  
