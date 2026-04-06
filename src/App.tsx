import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useMemo, useEffect } from 'react';
import { 
  Bike, Settings, Fuel, Wrench, Download, Github, Plus, ChevronRight, 
  Calendar, Activity, ShieldCheck, Bell, Smartphone, LayoutDashboard, 
  FileText, Calculator, History, PhoneCall, Info, Sun, Moon, Upload, 
  Database, Zap, Gauge, Droplets, Clock, MapPin, Share2, CheckCircle2, 
  AlertCircle, X, Search, Filter, TrendingUp, BarChart2, CalendarDays, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
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
  
  // App State
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showEditBikeModal, setShowEditBikeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [showDumpConfirm, setShowDumpConfirm] = useState(false);
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
  
  // User Data State
  const [bike, setBike] = useState<BikeType | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [fuel, setFuel] = useState<FuelRecord[]>([]);
  const [accessories, setAccessories] = useState<AccessoryRecord[]>([]);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [serviceIssues, setServiceIssues] = useState<{ id: string, text: string, date: string, resolved: boolean }[]>([]);
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [newIssueText, setNewIssueText] = useState('');

  const handleAddIssue = () => {
    if (newIssueText.trim()) {
      setServiceIssues(prev => [...prev, { 
        id: Math.random().toString(), 
        text: newIssueText.trim(), 
        date: new Date().toISOString(), 
        resolved: false 
      }]);
      setNewIssueText('');
      setIsAddingIssue(false);
    }
  };

  const startTrip = () => {
    setActiveTrip({
      startTime: new Date().toISOString(),
      startOdometer: bike?.odometer || 0
    });
  };

  const endTrip = () => {
    setShowEndTripModal(true);
  };
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
    let startDate = new Date(0); // All time

    if (chartTimeframe === '1m') {
      startDate = startOfMonth(now);
    } else if (chartTimeframe === '3m') {
      startDate = addMonths(now, -3);
    } else if (chartTimeframe === '6m') {
      startDate = addMonths(now, -6);
    } else if (chartTimeframe === '1y') {
      startDate = addMonths(now, -12);
    }
    
    const grouped: Record<string, { date: string, fullDate: Date, cost: number, liters: number, fuelCost: number, maintenanceCost: number, accessoriesCost: number, efficiency: number, efficiencyCount: number, distance: number, costPerKm: number, avgPricePerLiter: number }> = {};

    const addToGroup = (dateStr: string, cost: number, liters: number = 0, type: 'fuel' | 'maintenance' | 'accessory', distance: number = 0) => {
      const date = new Date(dateStr);
      if (date < startDate) return;
      
      let groupKey: string;
      if (chartTimeframe === '1m' || chartTimeframe === '3m') {
        groupKey = format(date, 'dd MMM'); // Daily
      } else {
        groupKey = format(date, 'MMM yy'); // Monthly
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = { 
          date: groupKey, fullDate: date, cost: 0, liters: 0, fuelCost: 0, 
          maintenanceCost: 0, accessoriesCost: 0, efficiency: 0, efficiencyCount: 0, 
          distance: 0, costPerKm: 0, avgPricePerLiter: 0
        };
      }
      
      grouped[groupKey].cost += cost;
      grouped[groupKey].liters += liters;
      grouped[groupKey].distance += distance;
      if (type === 'fuel') grouped[groupKey].fuelCost += cost;
      if (type === 'maintenance') grouped[groupKey].maintenanceCost += cost;
      if (type === 'accessory') grouped[groupKey].accessoriesCost += cost;
      
      if (date > grouped[groupKey].fullDate) {
        grouped[groupKey].fullDate = date;
      }
    };

    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sortedFuel.forEach((f, i) => {
      let distance = 0;
      if (i > 0) {
        distance = f.odometer - sortedFuel[i-1].odometer;
      }
      addToGroup(f.date, f.cost, f.liters, 'fuel', distance);
    });
    maintenance.forEach(m => addToGroup(m.date, m.cost, 0, 'maintenance'));
    accessories.forEach(a => addToGroup(a.date, a.cost, 0, 'accessory'));

    for (let i = 1; i < sortedFuel.length; i++) {
      const prev = sortedFuel[i-1];
      const curr = sortedFuel[i];
      const dist = curr.odometer - prev.odometer;
      const eff = curr.liters > 0 ? dist / curr.liters : 0;
      
      const date = new Date(curr.date);
      if (date >= startDate) {
        let groupKey: string;
        if (chartTimeframe === '1m' || chartTimeframe === '3m') {
          groupKey = format(date, 'dd MMM');
        } else {
          groupKey = format(date, 'MMM yy');
        }
        
        if (grouped[groupKey]) {
          grouped[groupKey].efficiency += eff;
          grouped[groupKey].efficiencyCount += 1;
        }
      }
    }

    return Object.values(grouped).map(g => ({
      ...g,
      efficiency: g.efficiencyCount > 0 ? parseFloat((g.efficiency / g.efficiencyCount).toFixed(2)) : 0,
      costPerKm: g.distance > 0 ? parseFloat((g.cost / g.distance).toFixed(2)) : 0,
      avgPricePerLiter: g.liters > 0 ? parseFloat((g.fuelCost / g.liters).toFixed(2)) : 0
    })).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [fuel, maintenance, accessories, chartTimeframe]);

  const lowestPriceLastMonth = useMemo(() => {
    const lastMonth = addMonths(new Date(), -1);
    const lastMonthFuel = fuel.filter(f => new Date(f.date) >= lastMonth);
    if (lastMonthFuel.length === 0) return 0;
    return Math.min(...lastMonthFuel.map(f => f.cost / f.liters));
  }, [fuel]);

  const allLogs = useMemo(() => {
    const combined = [
      ...fuel.map(f => ({ 
        ...f, category: 'fuel', title: f.isDump ? 'Fuel Dump' : 'Fuel Refill', 
        icon: f.isDump ? Droplets : Fuel, color: f.isDump ? 'text-red-500' : 'text-orange-500', 
        bg: f.isDump ? 'bg-red-500/10' : 'bg-orange-500/10' 
      })),
      ...maintenance.map(m => ({ ...m, category: 'maintenance', title: m.type, icon: Wrench, color: 'text-yellow-500', bg: 'bg-yellow-500/10' })),
      ...accessories.map(a => ({ ...a, category: 'accessory', title: a.name, icon: Plus, color: 'text-red-500', bg: 'bg-red-500/10' }))
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fuel, maintenance, accessories]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      return logFilter === 'all' || log.category === logFilter;
    });
  }, [allLogs, logFilter]);

  const totalFuelCost = useMemo(() => fuel.reduce((acc, curr) => acc + curr.cost, 0), [fuel]);
  const totalMaintenanceCost = useMemo(() => maintenance.reduce((acc, curr) => acc + curr.cost, 0), [maintenance]);
  const totalAccessoriesCost = useMemo(() => accessories.reduce((acc, curr) => acc + curr.cost, 0), [accessories]);
  const totalOverallCost = totalFuelCost + totalMaintenanceCost + totalAccessoriesCost;

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
    
    for (const record of sortedFuel) {
      if (fuelEfficiency > 0) {
        const dist = record.odometer - lastOdo;
        const consumed = dist / fuelEfficiency;
        current = Math.max(0, current - consumed);
      }
      
      if (record.isDump) {
        current = 0;
      } else {
        current = Math.min(bike.fuelCapacity || 10, current + record.liters);
      }
      lastOdo = record.odometer;
    }
    
    if (fuelEfficiency > 0) {
      const finalDist = bike.odometer - lastOdo;
      const finalConsumed = finalDist / fuelEfficiency;
      current = Math.max(0, current - finalConsumed);
    }
    
    return parseFloat(current.toFixed(2));
  }, [fuel, fuelEfficiency, bike]);

  const predictedRange = useMemo(() => {
    return Math.round(currentFuel * fuelEfficiency);
  }, [currentFuel, fuelEfficiency]);
  const stationEfficiency = useMemo(() => {
    const stations: Record<string, { totalDistance: number, totalLiters: number, count: number }> = {};
    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dataDurationDays = sortedFuel.length >= 2 
      ? differenceInDays(new Date(sortedFuel[sortedFuel.length - 1].date), new Date(sortedFuel[0].date)) 
      : 0;

    for (let i = 1; i < sortedFuel.length; i++) {
      const prev = sortedFuel[i - 1];
      const curr = sortedFuel[i];
      const station = prev.stationName || 'Unknown Station';
      const distance = curr.odometer - prev.odometer;
      const liters = curr.liters;

      if (distance > 0 && liters > 0) {
        if (!stations[station]) {
          stations[station] = { totalDistance: 0, totalLiters: 0, count: 0 };
        }
        stations[station].totalDistance += distance;
        stations[station].totalLiters += liters;
        stations[station].count += 1;
      }
    }

    const result = Object.entries(stations).map(([name, data]) => ({
      name,
      efficiency: parseFloat((data.totalDistance / data.totalLiters).toFixed(2)),
      count: data.count
    })).sort((a, b) => b.efficiency - a.efficiency);

    return {
      stats: result,
      isSixMonthMilestone: dataDurationDays >= 180,
      daysTracked: dataDurationDays
    };
  }, [fuel]);

  const healthScore = 85;
  
  const { daysRemaining, serviceDueKm } = useMemo(() => {
    if (!bike) return { daysRemaining: 0, serviceDueKm: 0 };

    const currentOdo = bike.odometer || 0;
    const purchaseDate = new Date(bike.purchaseDate);
    const daysSincePurchase = isNaN(purchaseDate.getTime()) ? 0 : differenceInDays(new Date(), purchaseDate);

    if (bike.manualServiceKm || bike.manualServiceDate) {
      const remainingKm = bike.manualServiceKm ? Math.max(0, bike.manualServiceKm - currentOdo) : 0;
      const remainingDays = bike.manualServiceDate ? Math.max(0, differenceInDays(new Date(bike.manualServiceDate), new Date())) : 0;
      return {
        daysRemaining: remainingDays,
        serviceDueKm: Math.round(remainingKm)
      };
    }

    const SERVICE_SCHEDULE = [
      { km: 1000, days: 30 }, { km: 5000, days: 150 }, { km: 9000, days: 270 },
      { km: 13000, days: 390 }, { km: 17000, days: 510 }, { km: 21000, days: 630 },
      { km: 25000, days: 750 }, { km: 29000, days: 870 },
    ];

    let nextMilestone = SERVICE_SCHEDULE.find(s => currentOdo < s.km && daysSincePurchase < s.days);
    
    if (!nextMilestone) {
       const overKm = currentOdo - 29000;
       const overDays = daysSincePurchase - 870;
       const intervalsKm = Math.floor(Math.max(0, overKm) / 4000) + 1;
       const intervalsDays = Math.floor(Math.max(0, overDays) / 120) + 1;
       const intervals = Math.max(intervalsKm, intervalsDays);
       nextMilestone = {
         km: 29000 + (intervals * 4000),
         days: 870 + (intervals * 120)
       };
    }

    return {
      daysRemaining: Math.max(0, nextMilestone.days - daysSincePurchase),
      serviceDueKm: Math.round(Math.max(0, nextMilestone.km - currentOdo))
    };
  }, [bike]);

  const bikeAge = useMemo(() => {
    if (!bike?.purchaseDate) return '';
    const purchaseDate = new Date(bike.purchaseDate);
    if (isNaN(purchaseDate.getTime())) return 'Invalid Date';
    const duration = intervalToDuration({ start: purchaseDate, end: new Date() });
    const parts = [];
    if (duration.years) parts.push(`${duration.years}y`);
    if (duration.months) parts.push(`${duration.months}m`);
    if (duration.days) parts.push(`${duration.days}d`);
    return parts.length > 0 ? parts.join(' ') : 'Brand New';
  }, [bike?.purchaseDate]);

  const bdayAlert = useMemo(() => {
    if (!bike?.purchaseDate) return null;
    const purchaseDate = new Date(bike.purchaseDate);
    if (isNaN(purchaseDate.getTime())) return null;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let nextBday = new Date(todayStart.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
    
    if (nextBday < todayStart) {
      nextBday.setFullYear(todayStart.getFullYear() + 1);
    }
    
    const daysToBday = differenceInDays(nextBday, todayStart);
    
    if (daysToBday <= 8 && daysToBday > 0) {
      return `Bike's birthday in ${daysToBday} days! 🎉`;
    } else if (daysToBday === 0) {
      return `Happy Birthday ${bike.name}! 🎂`;
    }
    return null;
  }, [bike?.purchaseDate]);

  const registrationAlert = useMemo(() => {
    if (!bike?.registrationValidity) return null;
    const expiryDate = new Date(bike.registrationValidity);
    const daysToExpiry = differenceInDays(expiryDate, new Date());
    
    if (daysToExpiry < 0) return { type: 'expired', msg: 'Registration Expired!' };
    if (daysToExpiry <= 30) return { type: 'critical', msg: `Reg. expires in ${daysToExpiry} days` };
    if (daysToExpiry <= 90) return { type: 'warning', msg: `Reg. expires in ${daysToExpiry} days` };
    if (daysToExpiry <= 180) return { type: 'info', msg: `Reg. expires in ${Math.floor(daysToExpiry/30)} months` };
    return null;
  }, [bike?.registrationValidity]);

  const dayWiseUsage = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const usage: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (let i = 1; i < sortedFuel.length; i++) {
      const prev = sortedFuel[i - 1];
      const curr = sortedFuel[i];
      const dist = curr.odometer - prev.odometer;
      const day = days[new Date(curr.date).getDay()];
      usage[day] += dist;
    }
    
    return Object.entries(usage).map(([day, km]) => ({ day, km }));
  }, [fuel]);

  const generateResaleReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(249, 115, 22);
      doc.text('MotoMate: Bike Health Report', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy')}`, 20, 30);
      
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Vehicle Information', 20, 45);
      doc.setFontSize(10);
      doc.text(`Model: ${bike?.model || 'N/A'}`, 20, 55);
      doc.text(`Registration: ${bike?.registrationNumber || 'N/A'}`, 20, 60);
      doc.text(`Current Odometer: ${bike?.odometer || 0} KM`, 20, 65);
      doc.text(`Average Efficiency: ${fuelEfficiency} KM/L`, 20, 70);
      
      doc.setFontSize(16);
      doc.text('Financial Summary', 20, 85);
      doc.setFontSize(10);
      doc.text(`Total Fuel Cost: INR ${totalFuelCost.toLocaleString()}`, 20, 95);
      doc.text(`Total Maintenance Cost: INR ${totalMaintenanceCost.toLocaleString()}`, 20, 100);
      doc.text(`Total Accessories Cost: INR ${totalAccessoriesCost.toLocaleString()}`, 20, 105);
      doc.text(`Overall Running Cost: INR ${totalOverallCost.toLocaleString()}`, 20, 110);
      
      doc.setFontSize(16);
      doc.text('Service History', 20, 125);
      autoTable(doc, {
        startY: 130,
        head: [['Date', 'Type', 'Cost', 'Odometer', 'Notes']],
        body: maintenance.map(m => [
          format(new Date(m.date), 'dd MMM yyyy'),
          m.type,
          `INR ${m.cost}`,
          `${m.odometer} KM`,
          m.notes || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [249, 115, 22] }
      });
      
      doc.save(`${bike?.model || 'bike'}_health_report.pdf`);
      showToast('Report generated successfully!', 'success');
    } catch (err) {
      console.error('Report generation failed:', err);
      showToast('Failed to generate report.', 'error');
    }
  };

  const lastFuelPrice = useMemo(() => {
    const regularFuel = fuel.filter(f => !f.isDump);
    if (regularFuel.length === 0) return 0;
    const lastRefill = [...regularFuel].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return lastRefill.cost / lastRefill.liters;
  }, [fuel]);

  const handleShareData = async () => {
    const data = { bike, maintenance, fuel, accessories, trips };
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = 'motomate_backup.json';
    
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], fileName, { type: 'application/json' });

      if (navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: 'MotoMate Backup',
            text: 'My MotoMate data backup file.'
          });
          showToast('Backup shared successfully!', 'success');
          return;
        } catch (shareError) {
          await navigator.share({
            title: 'MotoMate Backup',
            text: jsonString
          });
          showToast('Backup shared as text!', 'success');
          return;
        }
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Sharing not supported, file downloaded.', 'success');
    } catch (err: any) {
      console.error('Share failed:', err);
      if (err.name !== 'AbortError') {
        showToast('Failed to share backup.', 'error');
      }
    }
  };
  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-500 flex flex-col items-center justify-center py-0 sm:py-10",
      isDarkMode ? "bg-[#0A0A0C] text-white" : "bg-[#F4F7FA] text-gray-900"
    )}>
      <div className={cn(
        "w-full max-w-[430px] sm:rounded-[3.5rem] sm:shadow-2xl sm:border-[12px] h-[100dvh] sm:h-[880px] overflow-hidden flex flex-col relative transition-all duration-500",
        isDarkMode ? "bg-[#121216] border-[#1E1E24]" : "bg-white border-gray-900"
      )}>
        
        <div 
          className="absolute inset-0 z-0 opacity-[0.08] dark:opacity-[0.15] pointer-events-none bg-cover bg-center bg-no-repeat mix-blend-luminosity grayscale contrast-125"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1558981806-ec527fa842a9?q=80&w=2070&auto=format&fit=crop")' }}
        />

        <header className="relative z-10 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-lg opacity-50 animate-pulse" />
              <div className="relative bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/40">
                <Bike className="w-6 h-6 text-black" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">MotoMate</h1>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Online</span>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto px-8 pb-32">
          {showOnboarding ? (
            <Onboarding 
              setBike={setBike}
              setShowOnboarding={setShowOnboarding}
              isDarkMode={isDarkMode}
            />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col space-y-8 pb-10 pt-4"
                >
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
                  />

                  {bdayAlert && (
                    <div className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 animate-pulse">
                      <span className="text-xs font-bold italic">{bdayAlert}</span>
                    </div>
                  )}

                  {registrationAlert && (
                    <div className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border",
                      registrationAlert.type === 'expired' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                      registrationAlert.type === 'critical' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                      registrationAlert.type === 'warning' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                      "bg-blue-500/10 border-blue-500/20 text-blue-500"
                    )}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest">{registrationAlert.msg}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 mt-8">
                    <div className={cn(
                      "p-6 rounded-[2.5rem] border relative overflow-hidden backdrop-blur-md",
                      isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100"
                    )}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Total Expenses</p>
                          <h3 className="text-3xl font-black italic tracking-tighter">₹{totalOverallCost.toLocaleString()}</h3>
                        </div>
                        <div className="bg-orange-500/10 p-3 rounded-2xl">
                          <Calculator className="w-6 h-6 text-orange-500" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Fuel</p>
                          <p className="text-sm font-black text-orange-500">₹{totalFuelCost.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Service</p>
                          <p className="text-sm font-black text-yellow-500">₹{totalMaintenanceCost.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Extras</p>
                          <p className="text-sm font-black text-red-500">₹{totalAccessoriesCost.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'logs' && (
                  <LogsTab 
                    filteredLogs={filteredLogs}
                    logFilter={logFilter}
                    setLogFilter={setLogFilter}
                    chartTimeframe={chartTimeframe}
                    setChartTimeframe={setChartTimeframe}
                    chartMetric={chartMetric}
                    setChartMetric={setChartMetric}
                    fuelData={monthlyAnalytics}
                    refillEfficiencyData={refillEfficiencyData}
                    isDarkMode={isDarkMode}
                    totalOverallCost={totalOverallCost}
                    totalFuelCost={totalFuelCost}
                    totalMaintenanceCost={totalMaintenanceCost}
                    totalAccessoriesCost={totalAccessoriesCost}
                    lowestPriceLastMonth={lowestPriceLastMonth}
                    dayWiseUsage={dayWiseUsage}
                    stationEfficiency={stationEfficiency}
                  />
              )}

              {activeTab === 'trips' && (
                <TripsTab 
                  trips={trips}
                  isDarkMode={isDarkMode}
                  fuelEfficiency={fuelEfficiency}
                  lastFuelPrice={lastFuelPrice}
                />
              )}
              const stationEfficiency = useMemo(() => {
    const stations: Record<string, { totalDistance: number, totalLiters: number, count: number }> = {};
    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dataDurationDays = sortedFuel.length >= 2 
      ? differenceInDays(new Date(sortedFuel[sortedFuel.length - 1].date), new Date(sortedFuel[0].date)) 
      : 0;

    for (let i = 1; i < sortedFuel.length; i++) {
      const prev = sortedFuel[i - 1];
      const curr = sortedFuel[i];
      const station = prev.stationName || 'Unknown Station';
      const distance = curr.odometer - prev.odometer;
      const liters = curr.liters;

      if (distance > 0 && liters > 0) {
        if (!stations[station]) {
          stations[station] = { totalDistance: 0, totalLiters: 0, count: 0 };
        }
        stations[station].totalDistance += distance;
        stations[station].totalLiters += liters;
        stations[station].count += 1;
      }
    }

    const result = Object.entries(stations).map(([name, data]) => ({
      name,
      efficiency: parseFloat((data.totalDistance / data.totalLiters).toFixed(2)),
      count: data.count
    })).sort((a, b) => b.efficiency - a.efficiency);

    return {
      stats: result,
      isSixMonthMilestone: dataDurationDays >= 180,
      daysTracked: dataDurationDays
    };
  }, [fuel]);

  const healthScore = 85;
  
  const { daysRemaining, serviceDueKm } = useMemo(() => {
    if (!bike) return { daysRemaining: 0, serviceDueKm: 0 };

    const currentOdo = bike.odometer || 0;
    const purchaseDate = new Date(bike.purchaseDate);
    const daysSincePurchase = isNaN(purchaseDate.getTime()) ? 0 : differenceInDays(new Date(), purchaseDate);

    if (bike.manualServiceKm || bike.manualServiceDate) {
      const remainingKm = bike.manualServiceKm ? Math.max(0, bike.manualServiceKm - currentOdo) : 0;
      const remainingDays = bike.manualServiceDate ? Math.max(0, differenceInDays(new Date(bike.manualServiceDate), new Date())) : 0;
      return {
        daysRemaining: remainingDays,
        serviceDueKm: Math.round(remainingKm)
      };
    }

    const SERVICE_SCHEDULE = [
      { km: 1000, days: 30 }, { km: 5000, days: 150 }, { km: 9000, days: 270 },
      { km: 13000, days: 390 }, { km: 17000, days: 510 }, { km: 21000, days: 630 },
      { km: 25000, days: 750 }, { km: 29000, days: 870 },
    ];

    let nextMilestone = SERVICE_SCHEDULE.find(s => currentOdo < s.km && daysSincePurchase < s.days);
    
    if (!nextMilestone) {
       const overKm = currentOdo - 29000;
       const overDays = daysSincePurchase - 870;
       const intervalsKm = Math.floor(Math.max(0, overKm) / 4000) + 1;
       const intervalsDays = Math.floor(Math.max(0, overDays) / 120) + 1;
       const intervals = Math.max(intervalsKm, intervalsDays);
       nextMilestone = {
         km: 29000 + (intervals * 4000),
         days: 870 + (intervals * 120)
       };
    }

    return {
      daysRemaining: Math.max(0, nextMilestone.days - daysSincePurchase),
      serviceDueKm: Math.round(Math.max(0, nextMilestone.km - currentOdo))
    };
  }, [bike]);

  const bikeAge = useMemo(() => {
    if (!bike?.purchaseDate) return '';
    const purchaseDate = new Date(bike.purchaseDate);
    if (isNaN(purchaseDate.getTime())) return 'Invalid Date';
    const duration = intervalToDuration({ start: purchaseDate, end: new Date() });
    const parts = [];
    if (duration.years) parts.push(`${duration.years}y`);
    if (duration.months) parts.push(`${duration.months}m`);
    if (duration.days) parts.push(`${duration.days}d`);
    return parts.length > 0 ? parts.join(' ') : 'Brand New';
  }, [bike?.purchaseDate]);

  const bdayAlert = useMemo(() => {
    if (!bike?.purchaseDate) return null;
    const purchaseDate = new Date(bike.purchaseDate);
    if (isNaN(purchaseDate.getTime())) return null;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let nextBday = new Date(todayStart.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
    
    if (nextBday < todayStart) {
      nextBday.setFullYear(todayStart.getFullYear() + 1);
    }
    
    const daysToBday = differenceInDays(nextBday, todayStart);
    
    if (daysToBday <= 8 && daysToBday > 0) {
      return `Bike's birthday in ${daysToBday} days! 🎉`;
    } else if (daysToBday === 0) {
      return `Happy Birthday ${bike.name}! 🎂`;
    }
    return null;
  }, [bike?.purchaseDate]);

  const registrationAlert = useMemo(() => {
    if (!bike?.registrationValidity) return null;
    const expiryDate = new Date(bike.registrationValidity);
    const daysToExpiry = differenceInDays(expiryDate, new Date());
    
    if (daysToExpiry < 0) return { type: 'expired', msg: 'Registration Expired!' };
    if (daysToExpiry <= 30) return { type: 'critical', msg: `Reg. expires in ${daysToExpiry} days` };
    if (daysToExpiry <= 90) return { type: 'warning', msg: `Reg. expires in ${daysToExpiry} days` };
    if (daysToExpiry <= 180) return { type: 'info', msg: `Reg. expires in ${Math.floor(daysToExpiry/30)} months` };
    return null;
  }, [bike?.registrationValidity]);

  const dayWiseUsage = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const usage: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    const sortedFuel = [...fuel].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (let i = 1; i < sortedFuel.length; i++) {
      const prev = sortedFuel[i - 1];
      const curr = sortedFuel[i];
      const dist = curr.odometer - prev.odometer;
      const day = days[new Date(curr.date).getDay()];
      usage[day] += dist;
    }
    
    return Object.entries(usage).map(([day, km]) => ({ day, km }));
  }, [fuel]);

  const generateResaleReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(249, 115, 22);
      doc.text('MotoMate: Bike Health Report', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy')}`, 20, 30);
      
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Vehicle Information', 20, 45);
      doc.setFontSize(10);
      doc.text(`Model: ${bike?.model || 'N/A'}`, 20, 55);
      doc.text(`Registration: ${bike?.registrationNumber || 'N/A'}`, 20, 60);
      doc.text(`Current Odometer: ${bike?.odometer || 0} KM`, 20, 65);
      doc.text(`Average Efficiency: ${fuelEfficiency} KM/L`, 20, 70);
      
      doc.setFontSize(16);
      doc.text('Financial Summary', 20, 85);
      doc.setFontSize(10);
      doc.text(`Total Fuel Cost: INR ${totalFuelCost.toLocaleString()}`, 20, 95);
      doc.text(`Total Maintenance Cost: INR ${totalMaintenanceCost.toLocaleString()}`, 20, 100);
      doc.text(`Total Accessories Cost: INR ${totalAccessoriesCost.toLocaleString()}`, 20, 105);
      doc.text(`Overall Running Cost: INR ${totalOverallCost.toLocaleString()}`, 20, 110);
      
      doc.setFontSize(16);
      doc.text('Service History', 20, 125);
      autoTable(doc, {
        startY: 130,
        head: [['Date', 'Type', 'Cost', 'Odometer', 'Notes']],
        body: maintenance.map(m => [
          format(new Date(m.date), 'dd MMM yyyy'),
          m.type,
          `INR ${m.cost}`,
          `${m.odometer} KM`,
          m.notes || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [249, 115, 22] }
      });
      
      doc.save(`${bike?.model || 'bike'}_health_report.pdf`);
      showToast('Report generated successfully!', 'success');
    } catch (err) {
      console.error('Report generation failed:', err);
      showToast('Failed to generate report.', 'error');
    }
  };

  const lastFuelPrice = useMemo(() => {
    const regularFuel = fuel.filter(f => !f.isDump);
    if (regularFuel.length === 0) return 0;
    const lastRefill = [...regularFuel].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return lastRefill.cost / lastRefill.liters;
  }, [fuel]);

  const handleShareData = async () => {
    const data = { bike, maintenance, fuel, accessories, trips };
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = 'motomate_backup.json';
    
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], fileName, { type: 'application/json' });

      if (navigator.share) {
        try {
          await navigator.share({
            files: [file],
            title: 'MotoMate Backup',
            text: 'My MotoMate data backup file.'
          });
          showToast('Backup shared successfully!', 'success');
          return;
        } catch (shareError) {
          await navigator.share({
            title: 'MotoMate Backup',
            text: jsonString
          });
          showToast('Backup shared as text!', 'success');
          return;
        }
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Sharing not supported, file downloaded.', 'success');
    } catch (err: any) {
      console.error('Share failed:', err);
      if (err.name !== 'AbortError') {
        showToast('Failed to share backup.', 'error');
      }
    }
  };
              
