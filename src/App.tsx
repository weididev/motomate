import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useMemo, useEffect } from 'react';
import { 
  Bike, 
  Settings, 
  Fuel, 
  Wrench, 
  Download, 
  Github, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Activity,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Smartphone,
  LayoutDashboard,
  FileText,
  Calculator,
  History,
  PhoneCall,
  Info,
  Sun,
  Moon,
  Upload,
  Database,
  Zap,
  Gauge,
  Droplets,
  Clock,
  MapPin,
  Share2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  TrendingUp,
  BarChart2,
  CalendarDays,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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
  
  // User Data State (LocalStorage Persistence)
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

  // App UI State
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
      // Assume 40km/h average speed for simulation
      const simulatedDistance = (elapsedMinutes / 60) * 40;
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
  
  // Log Filters & Chart State
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all');
  const [chartTimeframe, setChartTimeframe] = useState('1y');
  const [chartMetric, setChartMetric] = useState('cost');

  // Persistence Sync
  useEffect(() => {
    if (bike) localStorage.setItem('motomate_bike', JSON.stringify(bike));
    localStorage.setItem('motomate_maintenance', JSON.stringify(maintenance));
    localStorage.setItem('motomate_fuel', JSON.stringify(fuel));
    localStorage.setItem('motomate_accessories', JSON.stringify(accessories));
    localStorage.setItem('motomate_trips', JSON.stringify(trips));
    localStorage.setItem('motomate_activeTrip', JSON.stringify(activeTrip));
    localStorage.setItem('motomate_issues', JSON.stringify(serviceIssues));
    localStorage.setItem('motomate_onboarding', JSON.stringify(showOnboarding));
  }, [bike, maintenance, fuel, accessories, trips, activeTrip, serviceIssues, showOnboarding]);
  const refillEfficiencyData = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0);
    if (chartTimeframe === '1m') startDate = startOfMonth(now);
    else if (chartTimeframe === '3m') startDate = addMonths(now, -3);
    else if (chartTimeframe === '6m') startDate = addMonths(now, -6);
    else if (chartTimeframe === '1y') startDate = addMonths(now, -12);

    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const data: { id: string, date: string, efficiency: number, cost: number, liters: number }[] = [];
    
    for (let i = 1; i < sortedFuel.length; i++) {
      const prev = sortedFuel[i-1];
      const curr = sortedFuel[i];
      
      if (new Date(curr.date) < startDate) continue;

      const dist = curr.odometer - prev.odometer;
      const efficiency = curr.liters > 0 ? parseFloat((dist / curr.liters).toFixed(2)) : 0;
      
      data.push({
        id: curr.id,
        date: format(new Date(curr.date), 'dd MMM'),
        efficiency,
        cost: curr.cost,
        liters: curr.liters
      });
    }
    return data;
  }, [fuel, chartTimeframe]);

  const monthlyAnalytics = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0);

    if (chartTimeframe === '1m') startDate = startOfMonth(now);
    else if (chartTimeframe === '3m') startDate = addMonths(now, -3);
    else if (chartTimeframe === '6m') startDate = addMonths(now, -6);
    else if (chartTimeframe === '1y') startDate = addMonths(now, -12);
    
    const grouped: Record<string, any> = {};

    const addToGroup = (dateStr: string, cost: number, liters: number = 0, type: 'fuel' | 'maintenance' | 'accessory', distance: number = 0) => {
      const date = new Date(dateStr);
      if (date < startDate) return;
      
      let groupKey = (chartTimeframe === '1m' || chartTimeframe === '3m') ? format(date, 'dd MMM') : format(date, 'MMM yy');

      if (!grouped[groupKey]) {
        grouped[groupKey] = { 
          date: groupKey, 
          fullDate: date,
          cost: 0, 
          liters: 0, 
          fuelCost: 0, 
          maintenanceCost: 0, 
          accessoriesCost: 0,
          efficiency: 0,
          efficiencyCount: 0,
          distance: 0,
          costPerKm: 0,
          avgPricePerLiter: 0
        };
      }
      
      grouped[groupKey].cost += cost;
      grouped[groupKey].liters += liters;
      grouped[groupKey].distance += distance;
      if (type === 'fuel') grouped[groupKey].fuelCost += cost;
      if (type === 'maintenance') grouped[groupKey].maintenanceCost += cost;
      if (type === 'accessory') grouped[groupKey].accessoriesCost += cost;
    };

    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sortedFuel.forEach((f, i) => {
      let distance = i > 0 ? f.odometer - sortedFuel[i-1].odometer : 0;
      addToGroup(f.date, f.cost, f.liters, 'fuel', distance);
    });
    maintenance.forEach(m => addToGroup(m.date, m.cost, 0, 'maintenance'));
    accessories.forEach(a => addToGroup(a.date, a.cost, 0, 'accessory'));

    return Object.values(grouped).map((g: any) => ({
      ...g,
      efficiency: g.efficiencyCount > 0 ? parseFloat((g.efficiency / g.efficiencyCount).toFixed(2)) : 0,
      costPerKm: g.distance > 0 ? parseFloat((g.cost / g.distance).toFixed(2)) : 0,
      avgPricePerLiter: g.liters > 0 ? parseFloat((g.fuelCost / g.liters).toFixed(2)) : 0
    })).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [fuel, maintenance, accessories, chartTimeframe]);

  const allLogs = useMemo(() => {
    const combined = [
      ...fuel.map(f => ({ 
        ...f, 
        category: 'fuel', 
        title: f.isDump ? 'Fuel Dump' : 'Fuel Refill', 
        icon: f.isDump ? Droplets : Fuel, 
        color: f.isDump ? 'text-red-500' : 'text-orange-500', 
        bg: f.isDump ? 'bg-red-500/10' : 'bg-orange-500/10' 
      })),
      ...maintenance.map(m => ({ ...m, category: 'maintenance', title: m.type, icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-500/10' })),
      ...accessories.map(a => ({ ...a, category: 'accessory', title: a.name, icon: Plus, color: 'text-red-500', bg: 'bg-red-500/10' }))
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fuel, maintenance, accessories]);

  const filteredLogs = useMemo(() => allLogs.filter(log => logFilter === 'all' || log.category === logFilter), [allLogs, logFilter]);

  const totalFuelCost = useMemo(() => fuel.reduce((acc, curr) => acc + curr.cost, 0), [fuel]);
  const totalMaintenanceCost = useMemo(() => maintenance.reduce((acc, curr) => acc + curr.cost, 0), [maintenance]);
  const totalAccessoriesCost = useMemo(() => accessories.reduce((acc, curr) => acc + curr.cost, 0), [accessories]);
  const totalOverallCost = totalFuelCost + totalMaintenanceCost + totalAccessoriesCost;

  // Smart Mileage Calculation (Full-to-Full method)
  const fuelEfficiency = useMemo(() => {
    const regularFuel = fuel.filter(f => !f.isDump);
    if (regularFuel.length < 2) return 0;
    const sortedFuel = [...regularFuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const totalDistance = sortedFuel[sortedFuel.length - 1].odometer - sortedFuel[0].odometer;
    const totalLiters = sortedFuel.slice(1).reduce((acc, curr) => acc + curr.liters, 0);
    return totalLiters > 0 ? parseFloat((totalDistance / totalLiters).toFixed(2)) : 0;
  }, [fuel]);

  const currentFuel = useMemo(() => {
    if (!bike || fuel.length === 0) return 0;
    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let current = 0;
    let lastOdo = sortedFuel[0].odometer;
    const effectiveEfficiency = fuelEfficiency > 0 ? fuelEfficiency : 40;
    
    for (const record of sortedFuel) {
      const dist = record.odometer - lastOdo;
      const consumed = dist / effectiveEfficiency;
      current = Math.max(0, current - consumed);
      
      if (record.isDump) current = 0;
      else current = Math.min(bike.fuelCapacity || 10, current + record.liters);
      lastOdo = record.odometer;
    }
    
    const finalDist = (liveOdometer || bike.odometer) - lastOdo;
    const finalConsumed = finalDist / effectiveEfficiency;
    current = Math.max(0, current - finalConsumed);
    
    return parseFloat(current.toFixed(2));
  }, [fuel, fuelEfficiency, bike, liveOdometer]);

  const predictedRange = useMemo(() => {
    const effectiveEfficiency = fuelEfficiency > 0 ? fuelEfficiency : 40;
    return Math.round(currentFuel * effectiveEfficiency);
  }, [currentFuel, fuelEfficiency]);
  const { daysRemaining, serviceDueKm } = useMemo(() => {
    if (!bike) return { daysRemaining: 0, serviceDueKm: 0 };
    const currentOdo = bike.odometer || 0;
    const purchaseDate = new Date(bike.purchaseDate);
    const daysSincePurchase = isNaN(purchaseDate.getTime()) ? 0 : differenceInDays(new Date(), purchaseDate);

    if (bike.manualServiceKm || bike.manualServiceDate) {
      const remainingKm = bike.manualServiceKm ? Math.max(0, bike.manualServiceKm - currentOdo) : 0;
      const remainingDays = bike.manualServiceDate ? Math.max(0, differenceInDays(new Date(bike.manualServiceDate), new Date())) : 0;
      return { daysRemaining: remainingDays, serviceDueKm: Math.round(remainingKm) };
    }

    const SERVICE_SCHEDULE = [{ km: 1000, days: 30 }, { km: 5000, days: 150 }, { km: 9000, days: 270 }, { km: 13000, days: 390 }];
    let nextMilestone = SERVICE_SCHEDULE.find(s => currentOdo < s.km && daysSincePurchase < s.days);
    if (!nextMilestone) nextMilestone = { km: currentOdo + 4000, days: daysSincePurchase + 120 };

    return { daysRemaining: Math.max(0, nextMilestone.days - daysSincePurchase), serviceDueKm: Math.round(Math.max(0, nextMilestone.km - currentOdo)) };
  }, [bike]);

  const bikeAge = useMemo(() => {
    if (!bike?.purchaseDate) return '';
    const duration = intervalToDuration({ start: new Date(bike.purchaseDate), end: new Date() });
    const parts = [];
    if (duration.years) parts.push(`${duration.years}y`);
    if (duration.months) parts.push(`${duration.months}m`);
    if (duration.days) parts.push(`${duration.days}d`);
    return parts.length > 0 ? parts.join(' ') : 'Brand New';
  }, [bike?.purchaseDate]);

  const generateResaleReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setTextColor(249, 115, 22); doc.text('MotoMate: Bike Health Report', 20, 20);
      doc.setFontSize(12); doc.setTextColor(100); doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy')}`, 20, 30);
      doc.setFontSize(16); doc.setTextColor(0); doc.text('Vehicle Information', 20, 45);
      doc.setFontSize(10); doc.text(`Model: ${bike?.model || 'N/A'}`, 20, 55);
      doc.text(`Current Odometer: ${bike?.odometer || 0} KM`, 20, 65);
      doc.text(`Average Efficiency: ${fuelEfficiency} KM/L`, 20, 70);
      
      autoTable(doc, {
        startY: 130,
        head: [['Date', 'Type', 'Cost', 'Odometer']],
        body: maintenance.map(m => [format(new Date(m.date), 'dd MMM yyyy'), m.type, `INR ${m.cost}`, `${m.odometer} KM`]),
        theme: 'striped', headStyles: { fillColor: [249, 115, 22] }
      });
      
      doc.save(`${bike?.model || 'bike'}_health_report.pdf`);
      showToast('Report generated successfully!', 'success');
    } catch (err) { showToast('Failed to generate report.', 'error'); }
  };

  const handleShareData = async () => {
    const data = { bike, maintenance, fuel, accessories, trips, serviceIssues };
    const jsonString = JSON.stringify(data, null, 2);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MotoMate Backup', text: 'My MotoMate data backup.', files: [new File([new Blob([jsonString], { type: 'application/json' })], 'motomate_backup.json', { type: 'application/json' })] });
        showToast('Backup shared successfully!', 'success');
      } catch (err) { showToast('Sharing failed, downloading instead.', 'success'); }
    } else {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'motomate_backup.json'; a.click();
    }
  };

  const startTrip = () => {
    setActiveTrip({ startTime: new Date().toISOString(), startOdometer: bike?.odometer || 0 });
    showToast("Trip started! Drive safe 🏍️");
  };

  const endTrip = (endOdometer: number, note: string) => {
    if (!activeTrip || !bike) return;
    const distance = endOdometer - activeTrip.startOdometer;
    const fuelConsumed = distance / (fuelEfficiency || 40);
    const cost = fuelConsumed * 106;
    const newTrip: TripRecord = { id: Date.now().toString(), startTime: activeTrip.startTime, endTime: new Date().toISOString(), startOdometer: activeTrip.startOdometer, endOdometer, distance, fuelConsumed, cost, note };
    setTrips([newTrip, ...trips]);
    setBike({ ...bike, odometer: endOdometer });
    setActiveTrip(null);
    showToast("Trip recorded successfully!");
  };

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
            <Onboarding onComplete={(data) => { setBike(data); setShowOnboarding(false); localStorage.setItem('motomate_onboarding', 'false'); }} />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col space-y-8 pb-10 pt-4">
                  {showInsuranceAlert && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex items-center gap-4">
                      <div className="bg-red-500 p-2 rounded-xl"><ShieldAlert className="w-5 h-5 text-white" /></div>
                      <div className="flex-1"><p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Insurance Alert</p><p className="text-sm font-bold">Expiring soon!</p></div>
                      <button onClick={() => setShowInsuranceAlert(false)} className="p-2 rounded-full"><X className="w-4 h-4 text-red-500" /></button>
                    </div>
                  )}
                  <Speedometer fuelEfficiency={fuelEfficiency} daysRemaining={daysRemaining} serviceDueKm={serviceDueKm} predictedRange={predictedRange} currentFuel={currentFuel} fuelCapacity={bike?.fuelCapacity || 10} bike={bike} isDarkMode={isDarkMode} activeTrip={activeTrip} startTrip={startTrip} endTrip={() => setShowEndTripModal(true)} bikeAge={bikeAge} liveOdometer={liveOdometer} />
                  <div className={cn("p-6 rounded-[2.5rem] border", isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100 shadow-xl")}>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Expenses</p>
                    <h3 className="text-3xl font-black italic tracking-tighter">₹{totalOverallCost.toLocaleString()}</h3>
                  </div>
                </motion.div>
              )}
              {activeTab === 'logs' && <LogsTab filteredLogs={filteredLogs} logFilter={logFilter} setLogFilter={setLogFilter} chartTimeframe={chartTimeframe} setChartTimeframe={setChartTimeframe} fuelData={monthlyAnalytics} refillEfficiencyData={refillEfficiencyData} isDarkMode={isDarkMode} totalOverallCost={totalOverallCost} />}
              {activeTab === 'trips' && <TripsTab trips={trips} isDarkMode={isDarkMode} fuelEfficiency={fuelEfficiency} lastFuelPrice={106} onDeleteTrip={(id) => setTrips(trips.filter(t => t.id !== id))} />}
              {activeTab === 'about' && (
                <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">About Bike</h2>
                  <div className={cn("p-8 rounded-[2.5rem] border", isDarkMode ? "bg-[#1E1E24] border-white/5" : "bg-white border-gray-100 shadow-xl")}>
                    <div className="flex justify-between items-center mb-6">
                      <div><h2 className="text-2xl font-black italic">{bike?.name}</h2><p className="text-xs text-gray-500 uppercase tracking-widest">{bikeAge} Old</p></div>
                      <button onClick={() => setShowEditBikeModal(true)} className="p-2 bg-orange-500 rounded-xl text-black"><Settings className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div><p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Odometer</p><p className="text-2xl font-black italic">{bike?.odometer} KM</p></div>
                      <div><p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Reg No.</p><p className="text-xl font-black italic opacity-80">{bike?.registrationNumber || 'N/A'}</p></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button onClick={handleShareData} className="w-full p-5 rounded-2xl bg-white/5 flex items-center gap-4 hover:bg-white/10 transition-all"><Share2 className="w-5 h-5 text-orange-500" /> Share Backup</button>
                    <button onClick={generateResaleReport} className="w-full p-5 rounded-2xl bg-white/5 flex items-center gap-4 hover:bg-white/10 transition-all"><FileText className="w-5 h-5 text-green-500" /> Health Report</button>
                    <button onClick={() => setShowDumpConfirm(true)} className="w-full p-5 rounded-2xl bg-red-500/10 flex items-center gap-4 hover:bg-red-500/20 transition-all"><Droplets className="w-5 h-5 text-red-500" /> Fuel Dump</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <nav className={cn("absolute bottom-0 left-0 right-0 h-24 border-t flex items-center justify-around px-8 pb-4 transition-all z-20", isDarkMode ? "bg-[#121216]/80 backdrop-blur-xl border-white/5" : "bg-white/80 border-gray-100")}>
          <button onClick={() => setActiveTab('dashboard')} className={cn("flex flex-col items-center gap-1", activeTab === 'dashboard' ? "text-orange-600 scale-110" : "text-gray-500")}><LayoutDashboard className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Core</span></button>
          <button onClick={() => setActiveTab('trips')} className={cn("flex flex-col items-center gap-1", activeTab === 'trips' ? "text-orange-600 scale-110" : "text-gray-500")}><Navigation className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Trips</span></button>
          <button onClick={() => setShowAddModal(true)} className="w-16 h-16 bg-orange-500 text-black rounded-full flex items-center justify-center -translate-y-8 shadow-2xl active:scale-90 transition-transform"><Plus className="w-8 h-8" /></button>
          <button onClick={() => setActiveTab('logs')} className={cn("flex flex-col items-center gap-1", activeTab === 'logs' ? "text-orange-600 scale-110" : "text-gray-500")}><Activity className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Logs</span></button>
          <button onClick={() => setActiveTab('about')} className={cn("flex flex-col items-center gap-1", activeTab === 'about' ? "text-orange-600 scale-110" : "text-gray-500")}><Info className="w-6 h-6" /><span className="text-[10px] font-black uppercase">About</span></button>
        </nav>

        <AnimatePresence>
          {showAddModal && <AddRecordModal bike={bike} setBike={setBike} fuel={fuel} setFuel={setFuel} maintenance={maintenance} setMaintenance={setMaintenance} accessories={accessories} setAccessories={setAccessories} setShowAddModal={setShowAddModal} isDarkMode={isDarkMode} bikeAge={bikeAge} />}
          {showEndTripModal && activeTrip && <EndTripModal activeTrip={activeTrip} bike={bike} setBike={setBike} setTrips={setTrips} setActiveTrip={setActiveTrip} setShowEndTripModal={setShowEndTripModal} isDarkMode={isDarkMode} fuelEfficiency={fuelEfficiency} lastFuelPrice={106} onConfirm={endTrip} />}
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
