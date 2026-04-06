import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useMemo, useEffect } from 'react';
import { 
  Bike, Settings, Fuel, Wrench, Download, Github, Plus, ChevronRight, Calendar, Activity,
  ShieldCheck, ShieldAlert, Bell, Smartphone, LayoutDashboard, FileText, Calculator, History,
  PhoneCall, Info, Sun, Moon, Upload, Database, Zap, Gauge, Droplets, Clock, MapPin, Share2,
  CheckCircle2, AlertCircle, X, Search, Filter, TrendingUp, BarChart2, CalendarDays, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { format, differenceInDays, addMonths, differenceInMinutes, startOfMonth, intervalToDuration } from 'date-fns';
import { cn } from '@/src/lib/utils';
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

  const [showOnboarding, setShowOnboarding] = useState(() => {
    const savedOnboarding = localStorage.getItem('motomate_onboarding');
    const savedBike = localStorage.getItem('motomate_bike');
    if (savedBike) return false;
    return savedOnboarding ? JSON.parse(savedOnboarding) : true;
  });
  const [showEditBikeModal, setShowEditBikeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [showInsuranceAlert, setShowInsuranceAlert] = useState(false);
  const [showDumpConfirm, setShowDumpConfirm] = useState(false);
  const [liveOdometer, setLiveOdometer] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (bike) localStorage.setItem('motomate_bike', JSON.stringify(bike));
    localStorage.setItem('motomate_maintenance', JSON.stringify(maintenance));
    localStorage.setItem('motomate_fuel', JSON.stringify(fuel));
    localStorage.setItem('motomate_accessories', JSON.stringify(accessories));
    localStorage.setItem('motomate_trips', JSON.stringify(trips));
    localStorage.setItem('motomate_activeTrip', JSON.stringify(activeTrip));
    localStorage.setItem('motomate_issues', JSON.stringify(serviceIssues));
  }, [bike, maintenance, fuel, accessories, trips, activeTrip, serviceIssues]);

  useEffect(() => {
    if (!activeTrip) { setLiveOdometer(null); return; }
    const interval = setInterval(() => {
      const elapsed = differenceInMinutes(new Date(), new Date(activeTrip.startTime));
      setLiveOdometer(activeTrip.startOdometer + (elapsed / 60) * 40);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTrip]);

  useEffect(() => {
    if (bike?.insuranceExpiry) {
      const expiry = new Date(bike.insuranceExpiry);
      const diff = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0 && diff <= 30) setShowInsuranceAlert(true);
    }
  }, [bike]);
  const fuelEfficiency = useMemo(() => {
    const regular = fuel.filter(f => !f.isDump);
    if (regular.length < 2) return 0;
    const sorted = [...regular].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dist = sorted[sorted.length - 1].odometer - sorted[0].odometer;
    const ltrs = sorted.slice(1).reduce((acc, curr) => acc + curr.liters, 0);
    return ltrs > 0 ? parseFloat((dist / ltrs).toFixed(2)) : 0;
  }, [fuel]);

  const currentFuel = useMemo(() => {
    if (!bike || fuel.length === 0) return 0;
    const sorted = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let current = 0;
    let lastOdo = sorted[0].odometer;
    const eff = fuelEfficiency > 0 ? fuelEfficiency : 40;
    for (const r of sorted) {
      current = Math.max(0, current - (r.odometer - lastOdo) / eff);
      current = r.isDump ? 0 : Math.min(bike.fuelCapacity || 10, current + r.liters);
      lastOdo = r.odometer;
    }
    current = Math.max(0, current - ((liveOdometer || bike.odometer) - lastOdo) / eff);
    return parseFloat(current.toFixed(2));
  }, [fuel, fuelEfficiency, bike, liveOdometer]);

  const predictedRange = useMemo(() => Math.round(currentFuel * (fuelEfficiency || 40)), [currentFuel, fuelEfficiency]);

  const bikeAge = useMemo(() => {
    if (!bike?.purchaseDate) return '';
    const duration = intervalToDuration({ start: new Date(bike.purchaseDate), end: new Date() });
    return `${duration.years || 0}y ${duration.months || 0}m ${duration.days || 0}d`;
  }, [bike?.purchaseDate]);

  const startTrip = () => setActiveTrip({ startTime: new Date().toISOString(), startOdometer: bike?.odometer || 0 });
  const endTrip = () => setShowEndTripModal(true);

  const handleShareData = async () => {
    const data = JSON.stringify({ bike, maintenance, fuel, accessories, trips, serviceIssues }, null, 2);
    if (navigator.share) {
      try {
        const file = new File([new Blob([data], { type: 'application/json' })], 'motomate_backup.json', { type: 'application/json' });
        await navigator.share({ files: [file], title: 'MotoMate Backup' });
      } catch (e) { showToast('Sharing failed, downloading...'); }
    } else {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'motomate_backup.json'; a.click();
    }
  };

  const totalOverallCost = useMemo(() => 
    fuel.reduce((a, c) => a + c.cost, 0) + 
    maintenance.reduce((a, c) => a + c.cost, 0) + 
    accessories.reduce((a, c) => a + c.cost, 0), 
  [fuel, maintenance, accessories]);
  return (
    <div className={cn("min-h-screen font-sans transition-colors duration-500 flex flex-col items-center justify-center", isDarkMode ? "bg-[#0A0A0C] text-white" : "bg-[#F4F7FA] text-gray-900")}>
      <div className={cn("w-full max-w-[430px] sm:rounded-[3.5rem] sm:shadow-2xl sm:border-[12px] h-[100dvh] sm:h-[880px] overflow-hidden flex flex-col relative", isDarkMode ? "bg-[#121216] border-[#1E1E24]" : "bg-white border-gray-900")}>
        <header className="relative z-10 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/40"><Bike className="w-6 h-6 text-black" /></div>
            <div><h1 className="text-xl font-black tracking-tighter uppercase italic">MotoMate</h1></div>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 rounded-2xl bg-white/5 border border-white/10">{isDarkMode ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-gray-600" />}</button>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto px-8 pb-32">
          {showOnboarding ? (
            <Onboarding setBike={setBike} setShowOnboarding={setShowOnboarding} isDarkMode={isDarkMode} />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pt-4">
                  {showInsuranceAlert && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex items-center gap-4">
                      <div className="bg-red-500 p-2 rounded-xl"><ShieldAlert className="w-5 h-5 text-white" /></div>
                      <div className="flex-1"><p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Insurance Alert</p><p className="text-sm font-bold">Expiring soon!</p></div>
                      <button onClick={() => setShowInsuranceAlert(false)} className="p-2 hover:bg-red-500/10 rounded-full"><X className="w-4 h-4 text-red-500" /></button>
                    </div>
                  )}
                  <Speedometer fuelEfficiency={fuelEfficiency} daysRemaining={30} serviceDueKm={500} predictedRange={predictedRange} currentFuel={currentFuel} fuelCapacity={bike?.fuelCapacity || 10} bike={bike} isDarkMode={isDarkMode} activeTrip={activeTrip} startTrip={startTrip} endTrip={endTrip} bikeAge={bikeAge} liveOdometer={liveOdometer} />
                  <div className={cn("p-6 rounded-[2.5rem] border", isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100 shadow-xl")}>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Expenses</p>
                    <h3 className="text-3xl font-black italic tracking-tighter">₹{totalOverallCost.toLocaleString()}</h3>
                  </div>
                </motion.div>
              )}
              {activeTab === 'trips' && <TripsTab trips={trips} isDarkMode={isDarkMode} fuelEfficiency={fuelEfficiency} lastFuelPrice={106} />}
              {activeTab === 'logs' && <LogsTab filteredLogs={[]} logFilter="all" setLogFilter={() => {}} chartTimeframe="1y" setChartTimeframe={() => {}} fuelData={[]} refillEfficiencyData={[]} isDarkMode={isDarkMode} totalOverallCost={totalOverallCost} />}
              {activeTab === 'about' && (
                <div className="space-y-8">
                  <div className={cn("p-8 rounded-[2.5rem] border", isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100 shadow-xl")}>
                    <div className="flex justify-between items-center mb-6">
                      <div><h2 className="text-2xl font-black italic">{bike?.name}</h2><p className="text-xs text-gray-500 uppercase tracking-widest">{bikeAge} Old</p></div>
                      <button onClick={() => setShowEditBikeModal(true)} className="p-2 bg-orange-500 rounded-xl text-black"><Settings className="w-5 h-5" /></button>
                    </div>
                    <p className="text-3xl font-black italic">{bike?.odometer} KM</p>
                  </div>
                  <div className="space-y-4">
                    <button onClick={handleShareData} className="w-full p-5 rounded-2xl bg-white/5 flex items-center gap-4 hover:bg-white/10 transition-all"><Share2 className="w-5 h-5 text-orange-500" /> Share Backup</button>
                    <button onClick={() => setShowDumpConfirm(true)} className="w-full p-5 rounded-2xl bg-red-500/10 flex items-center gap-4 hover:bg-red-500/20 transition-all"><Droplets className="w-5 h-5 text-red-500" /> Fuel Tank Dump</button>
                  </div>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        <nav className={cn("absolute bottom-0 left-0 right-0 h-24 border-t flex items-center justify-around px-8 pb-4 transition-all z-20", isDarkMode ? "bg-[#121216]/80 backdrop-blur-xl border-white/5" : "bg-white/80 border-gray-100")}>
          <button onClick={() => setActiveTab('dashboard')} className={cn(activeTab === 'dashboard' ? "text-orange-600" : "text-gray-500")}><LayoutDashboard className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('trips')} className={cn(activeTab === 'trips' ? "text-orange-600" : "text-gray-500")}><Navigation className="w-6 h-6" /></button>
          <button onClick={() => setShowAddModal(true)} className="w-14 h-14 bg-orange-500 text-black rounded-full flex items-center justify-center -translate-y-6 shadow-xl active:scale-90 transition-transform"><Plus className="w-8 h-8" /></button>
          <button onClick={() => setActiveTab('logs')} className={cn(activeTab === 'logs' ? "text-orange-600" : "text-gray-500")}><Activity className="w-6 h-6" /></button>
          <button onClick={() => setActiveTab('about')} className={cn(activeTab === 'about' ? "text-orange-600" : "text-gray-500")}><Info className="w-6 h-6" /></button>
        </nav>

        <AnimatePresence>
          {showAddModal && <AddRecordModal bike={bike} setBike={setBike} fuel={fuel} setFuel={setFuel} maintenance={maintenance} setMaintenance={setMaintenance} accessories={accessories} setAccessories={setAccessories} setShowAddModal={setShowAddModal} isDarkMode={isDarkMode} bikeAge={bikeAge} />}
          {showEndTripModal && activeTrip && <EndTripModal activeTrip={activeTrip} bike={bike} setBike={setBike} setTrips={setTrips} setActiveTrip={setActiveTrip} setShowEndTripModal={setShowEndTripModal} isDarkMode={isDarkMode} fuelEfficiency={fuelEfficiency} lastFuelPrice={106} />}
          {showEditBikeModal && bike && <EditBikeModal bike={bike} setBike={setBike} onClose={() => setShowEditBikeModal(false)} isDarkMode={isDarkMode} bikeAge={bikeAge} />}
        </AnimatePresence>

        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={cn("fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3", toast.type === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
