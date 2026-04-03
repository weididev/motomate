import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import React, { useState, useMemo, useEffect } from 'react'; // React ko explicitly import kiya
import { 
  Bike, Settings, Fuel, Wrench, Download, Plus, ChevronRight, 
  LayoutDashboard, FileText, Calculator, History, Info, Sun, Moon, 
  Upload, Database, Zap, Gauge, Droplets, Clock, MapPin, Share2, 
  CheckCircle2, AlertCircle, X, TrendingUp, Navigation, Activity 
} from 'lucide-react';
// ... baki imports ...
import { motion, AnimatePresence } from 'motion/react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, differenceInDays, addMonths, startOfMonth, intervalToDuration } from 'date-fns';
import { cn } from './lib/utils';
import { MaintenanceRecord, FuelRecord, Bike as BikeType, AccessoryRecord, TripRecord, ActiveTrip } from './types';
import { Speedometer } from './components/Speedometer';
import { AddRecordModal } from './components/AddRecordModal';
import { EndTripModal } from './components/EndTripModal';
import { Onboarding } from './components/Onboarding';
import { EditBikeModal } from './components/EditBikeModal';
import { LogsTab } from './components/LogsTab';
import { VaultTab } from './components/VaultTab';
import { TripsTab } from './components/TripsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showEditBikeModal, setShowEditBikeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [showDumpConfirm, setShowDumpConfirm] = useState(false);
  const [logFilter, setLogFilter] = useState('all');
  const [chartTimeframe, setChartTimeframe] = useState('1y');
  const [chartMetric, setChartMetric] = useState('cost');
  const [bike, setBike] = useState<BikeType | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [fuel, setFuel] = useState<FuelRecord[]>([]);
  const [accessories, setAccessories] = useState<AccessoryRecord[]>([]);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [serviceIssues, setServiceIssues] = useState<{ id: string, text: string, date: string, resolved: boolean }[]>([]);

  const startTrip = () => setActiveTrip({ startTime: new Date().toISOString(), startOdometer: bike?.odometer || 0 });
  const endTrip = () => setShowEndTripModal(true);

  const refillEfficiencyData = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0);
    if (chartTimeframe === '1m') startDate = startOfMonth(now);
    else if (chartTimeframe === '3m') startDate = addMonths(now, -3);
    else if (chartTimeframe === '6m') startDate = addMonths(now, -6);
    else if (chartTimeframe === '1y') startDate = addMonths(now, -12);
    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const data = [];
    for (let i = 1; i < sortedFuel.length; i++) {
      const prev = sortedFuel[i-1];
      const curr = sortedFuel[i];
      if (new Date(curr.date) < startDate) continue;
      const dist = curr.odometer - prev.odometer;
      const efficiency = curr.liters > 0 ? parseFloat((dist / curr.liters).toFixed(2)) : 0;
      data.push({ id: curr.id, date: format(new Date(curr.date), 'dd MMM'), efficiency, cost: curr.cost, liters: curr.liters });
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
    const grouped: any = {};
    const addToGroup = (dateStr: string, cost: number, liters: number = 0, type: string, distance: number = 0) => {
      const date = new Date(dateStr);
      if (date < startDate) return;
      let groupKey = (chartTimeframe === '1m' || chartTimeframe === '3m') ? format(date, 'dd MMM') : format(date, 'MMM yy');
      if (!grouped[groupKey]) grouped[groupKey] = { date: groupKey, fullDate: date, cost: 0, liters: 0, fuelCost: 0, maintenanceCost: 0, accessoriesCost: 0, efficiency: 0, efficiencyCount: 0, distance: 0, costPerKm: 0, avgPricePerLiter: 0 };
      grouped[groupKey].cost += cost;
      grouped[groupKey].liters += liters;
      grouped[groupKey].distance += distance;
      if (type === 'fuel') grouped[groupKey].fuelCost += cost;
      if (type === 'maintenance') grouped[groupKey].maintenanceCost += cost;
      if (type === 'accessory') grouped[groupKey].accessoriesCost += cost;
      if (date > grouped[groupKey].fullDate) grouped[groupKey].fullDate = date;
    };
    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sortedFuel.forEach((f, i) => addToGroup(f.date, f.cost, f.liters, 'fuel', i > 0 ? f.odometer - sortedFuel[i-1].odometer : 0));
    maintenance.forEach(m => addToGroup(m.date, m.cost, 0, 'maintenance'));
    accessories.forEach(a => addToGroup(a.date, a.cost, 0, 'accessory'));
    for (let i = 1; i < sortedFuel.length; i++) {
      const dist = sortedFuel[i].odometer - sortedFuel[i-1].odometer;
      const eff = sortedFuel[i].liters > 0 ? dist / sortedFuel[i].liters : 0;
      const date = new Date(sortedFuel[i].date);
      if (date >= startDate) {
        let key = (chartTimeframe === '1m' || chartTimeframe === '3m') ? format(date, 'dd MMM') : format(date, 'MMM yy');
        if (grouped[key]) { grouped[key].efficiency += eff; grouped[key].efficiencyCount += 1; }
      }
    }
    return Object.values(grouped).map((g: any) => ({ ...g, efficiency: g.efficiencyCount > 0 ? parseFloat((g.efficiency / g.efficiencyCount).toFixed(2)) : 0, costPerKm: g.distance > 0 ? parseFloat((g.cost / g.distance).toFixed(2)) : 0, avgPricePerLiter: g.liters > 0 ? parseFloat((g.fuelCost / g.liters).toFixed(2)) : 0 })).sort((a: any, b: any) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [fuel, maintenance, accessories, chartTimeframe]);

  const fuelEfficiency = useMemo(() => {
    const regularFuel = fuel.filter(f => !f.isDump);
    if (regularFuel.length < 2) return 0;
    const sorted = [...regularFuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dist = sorted[sorted.length - 1].odometer - sorted[0].odometer;
    const liters = sorted.slice(1).reduce((acc, curr) => acc + curr.liters, 0);
    return liters > 0 ? parseFloat((dist / liters).toFixed(2)) : 0;
  }, [fuel]);

  const currentFuel = useMemo(() => {
    if (!bike || fuel.length === 0) return 0;
    const sorted = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let current = 0; let lastOdo = sorted[0].odometer;
    for (const record of sorted) {
      if (fuelEfficiency > 0) current = Math.max(0, current - (record.odometer - lastOdo) / fuelEfficiency);
      current = record.isDump ? 0 : Math.min(bike.fuelCapacity || 10, current + record.liters);
      lastOdo = record.odometer;
    }
    if (fuelEfficiency > 0) current = Math.max(0, current - (bike.odometer - lastOdo) / fuelEfficiency);
    return parseFloat(current.toFixed(2));
  }, [fuel, fuelEfficiency, bike]);

  const predictedRange = Math.round(currentFuel * fuelEfficiency);

  const bikeAge = useMemo(() => {
    if (!bike?.purchaseDate) return '';
    const d = intervalToDuration({ start: new Date(bike.purchaseDate), end: new Date() });
    const p = []; if (d.years) p.push(`${d.years}y`); if (d.months) p.push(`${d.months}m`); if (d.days) p.push(`${d.days}d`);
    return p.length > 0 ? p.join(' ') : 'Brand New';
  }, [bike?.purchaseDate]);

  const { daysRemaining, serviceDueKm } = useMemo(() => {
    if (!bike) return { daysRemaining: 0, serviceDueKm: 0 };
    const currentOdo = bike.odometer || 0;
    const daysSincePurchase = differenceInDays(new Date(), new Date(bike.purchaseDate));
    if (bike.manualServiceKm || bike.manualServiceDate) return { daysRemaining: bike.manualServiceDate ? Math.max(0, differenceInDays(new Date(bike.manualServiceDate), new Date())) : 0, serviceDueKm: bike.manualServiceKm ? Math.max(0, bike.manualServiceKm - currentOdo) : 0 };
    const schedule = [{ km: 1000, days: 30 }, { km: 5000, days: 150 }, { km: 9000, days: 270 }, { km: 13000, days: 390 }, { km: 17000, days: 510 }, { km: 21000, days: 630 }, { km: 25000, days: 750 }, { km: 29000, days: 870 }];
    let next = schedule.find(s => currentOdo < s.km && daysSincePurchase < s.days);
    if (!next) {
      const intervals = Math.max(Math.floor((currentOdo - 29000) / 4000) + 1, Math.floor((daysSincePurchase - 870) / 120) + 1);
      next = { km: 29000 + (intervals * 4000), days: 870 + (intervals * 120) };
    }
    return { daysRemaining: Math.max(0, next.days - daysSincePurchase), serviceDueKm: Math.max(0, next.km - currentOdo) };
  }, [bike]);

  const generateResaleReport = () => {
    const doc = new jsPDF(); doc.setFontSize(22); doc.setTextColor(249, 115, 22); doc.text('MotoMate Health Report', 20, 20);
    doc.setFontSize(10); doc.text(`Model: ${bike?.model || 'N/A'}`, 20, 55); doc.text(`ODO: ${bike?.odometer || 0} KM`, 20, 65);
    (doc as any).autoTable({ startY: 130, head: [['Date', 'Type', 'Cost']], body: maintenance.map(m => [format(new Date(m.date), 'dd MMM yyyy'), m.type, `INR ${m.cost}`]) });
    doc.save(`${bike?.model || 'bike'}_report.pdf`);
  };

  const handleShareData = async () => {
    const data = JSON.stringify({ bike, maintenance, fuel, accessories }, null, 2);
    const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `motomate_backup.json`; a.click();
  };
  return (
    <div className={cn("min-h-screen font-sans flex flex-col items-center justify-center", isDarkMode ? "bg-[#0A0A0C] text-white" : "bg-[#F4F7FA] text-gray-900")}>
      <div className={cn("w-full max-w-[430px] sm:rounded-[3.5rem] sm:shadow-2xl sm:border-[12px] h-[100dvh] sm:h-[880px] overflow-hidden flex flex-col relative", isDarkMode ? "bg-[#121216] border-[#1E1E24]" : "bg-white border-gray-900")}>
        <header className="relative z-10 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="bg-orange-500 p-2 rounded-xl"><Bike className="w-6 h-6 text-black" /></div><h1 className="text-xl font-black tracking-tighter uppercase italic">MotoMate</h1></div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl bg-white/5">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
        </header>
        <div className="relative z-10 flex-1 overflow-y-auto px-8 pb-32">
          {showOnboarding ? <Onboarding setBike={setBike} setShowOnboarding={setShowOnboarding} isDarkMode={isDarkMode} /> : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <Speedometer fuelEfficiency={fuelEfficiency} daysRemaining={daysRemaining} serviceDueKm={serviceDueKm} predictedRange={predictedRange} currentFuel={currentFuel} fuelCapacity={bike?.fuelCapacity || 10} bike={bike} isDarkMode={isDarkMode} activeTrip={activeTrip} startTrip={startTrip} endTrip={endTrip} bikeAge={bikeAge} />}
              {activeTab === 'logs' && <LogsTab filteredLogs={filteredLogs} logFilter={logFilter} setLogFilter={setLogFilter} chartTimeframe={chartTimeframe} setChartTimeframe={setChartTimeframe} chartMetric={chartMetric} setChartMetric={setChartMetric} fuelData={monthlyAnalytics} refillEfficiencyData={refillEfficiencyData} isDarkMode={isDarkMode} totalOverallCost={totalOverallCost} totalFuelCost={totalFuelCost} totalMaintenanceCost={totalMaintenanceCost} totalAccessoriesCost={totalAccessoriesCost} lowestPriceLastMonth={0} dayWiseUsage={[]} stationEfficiency={{stats: [], isSixMonthMilestone: false, daysTracked: 0}} />}
              {activeTab === 'trips' && <TripsTab trips={trips} isDarkMode={isDarkMode} />}
              {activeTab === 'about' && (
                <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">About Bike</h2>
                  <div className="relative p-8 rounded-[2.5rem] bg-[#1E1E24]/80 border border-white/5 backdrop-blur-md">
                    <div className="flex justify-between items-start mb-6">
                      <div><p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">Active Unit</p><div className="flex items-center gap-2"><h2 className="text-3xl font-black italic tracking-tighter">{bike?.name}</h2><div className="flex items-center gap-1.5"><button onClick={() => setShowEditBikeModal(true)} className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20"><Settings className="w-4 h-4" /></button><button onClick={() => setShowAddModal(true)} className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20"><Plus className="w-4 h-4" /></button></div></div><div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 w-fit"><Clock className="w-3 h-3 text-orange-500" /><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Age: {bikeAge}</span></div></div>
                      <div className="bg-orange-600/10 p-3 rounded-2xl"><Gauge className="w-6 h-6 text-orange-600" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-8"><div><p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Distance</p><p className="text-3xl font-black tracking-tighter">{bike?.odometer} <span className="text-sm font-normal opacity-50">KM</span></p></div><div><p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Reg No.</p><p className="text-xl font-black tracking-tighter opacity-80">{bike?.registrationNumber}</p></div></div>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-[#1E1E24]/80 space-y-6"><h3 className="text-xs font-bold text-orange-500 uppercase tracking-[0.3em]">Data Management</h3><button onClick={handleShareData} className="w-full p-5 rounded-2xl bg-white/5 flex items-center justify-between"><div className="flex items-center gap-4"><Share2 className="w-5 h-5 text-orange-500" /><div><p className="text-sm font-bold">Share Backup</p></div></div><ChevronRight className="w-5 h-5 opacity-30" /></button></div>
                </motion.div>
              )}
              {activeTab === 'garage' && <VaultTab isDarkMode={isDarkMode} serviceIssues={serviceIssues} setServiceIssues={setServiceIssues} />}
            </AnimatePresence>
          )}
        </div>
        <nav className="absolute bottom-0 left-0 right-0 h-24 border-t bg-[#121216]/80 backdrop-blur-xl border-white/5 flex items-center justify-around px-8 pb-4 z-20">
          <button onClick={() => setActiveTab('dashboard')} className={cn("flex flex-col items-center gap-1", activeTab === 'dashboard' ? "text-orange-600" : "text-gray-500")}><LayoutDashboard className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Core</span></button>
          <button onClick={() => setActiveTab('garage')} className={cn("flex flex-col items-center gap-1", activeTab === 'garage' ? "text-orange-600" : "text-gray-500")}><Database className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Vault</span></button>
          <button onClick={() => setActiveTab('trips')} className={cn("flex flex-col items-center gap-1", activeTab === 'trips' ? "text-orange-600" : "text-gray-500")}><Navigation className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Trips</span></button>
          <button onClick={() => setActiveTab('logs')} className={cn("flex flex-col items-center gap-1", activeTab === 'logs' ? "text-orange-600" : "text-gray-500")}><Activity className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Logs</span></button>
          <button onClick={() => setActiveTab('about')} className={cn("flex flex-col items-center gap-1", activeTab === 'about' ? "text-orange-600" : "text-gray-500")}><Info className="w-6 h-6" /><span className="text-[10px] font-black uppercase">About</span></button>
        </nav>
        <AnimatePresence>
          {showAddModal && <AddRecordModal bike={bike} setBike={setBike} fuel={fuel} setFuel={setFuel} maintenance={maintenance} setMaintenance={setMaintenance} accessories={accessories} setAccessories={setAccessories} setShowAddModal={setShowAddModal} isDarkMode={isDarkMode} bikeAge={bikeAge} />}
          {showEndTripModal && activeTrip && <EndTripModal activeTrip={activeTrip} bike={bike} setBike={setBike} setTrips={setTrips} setActiveTrip={setActiveTrip} setShowEndTripModal={setShowEndTripModal} isDarkMode={isDarkMode} />}
          {showEditBikeModal && bike && <EditBikeModal bike={bike} setBike={setBike} onClose={() => setShowEditBikeModal(false)} isDarkMode={isDarkMode} bikeAge={bikeAge} />}
        </AnimatePresence>
      </div>
    </div>
  );
                        }
