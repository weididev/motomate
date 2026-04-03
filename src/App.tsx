import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bike, LayoutDashboard, Database, Navigation, Activity, Info, Fuel, Wrench, Plus } from 'lucide-react';
import { cn } from './lib/utils';
import { Bike as BikeType, FuelRecord, MaintenanceRecord, AccessoryRecord, TripRecord, ActiveTrip } from './types';
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
  const [isDarkMode] = useState(true);
  
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('motomate_onboarded'));
  
  const [bike, setBike] = useState<BikeType | null>(() => {
    const saved = localStorage.getItem('motomate_bike');
    return saved ? JSON.parse(saved) : null;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [fuel, setFuel] = useState<FuelRecord[]>([]);
  const [accessories, setAccessories] = useState<AccessoryRecord[]>([]);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [serviceIssues, setServiceIssues] = useState<{ id: string, text: string, date: string, resolved: boolean }[]>([]);
  
  const [showEditBikeModal, setShowEditBikeModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [logFilter, setLogFilter] = useState('all');
  const [chartTimeframe, setChartTimeframe] = useState('1y');

  const handleFinishOnboarding = (bikeData: BikeType) => {
    setBike(bikeData);
    localStorage.setItem('motomate_bike', JSON.stringify(bikeData));
    localStorage.setItem('motomate_onboarded', 'true');
    setShowOnboarding(false);
  };
  const filteredLogs = useMemo(() => {
    let logs: any[] = [];
    fuel.forEach(f => logs.push({ ...f, type: 'fuel', title: `Fuel: ${f.liters}L`, icon: Fuel, bg: 'bg-blue-500/10', color: 'text-blue-500' }));
    maintenance.forEach(m => logs.push({ ...m, type: 'maintenance', title: m.type, icon: Wrench, bg: 'bg-red-500/10', color: 'text-red-500' }));
    accessories.forEach(a => logs.push({ ...a, type: 'accessory', title: a.name, icon: Plus, bg: 'bg-purple-500/10', color: 'text-purple-500' }));
    
    if (logFilter === 'all') return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return logs.filter(l => l.type === logFilter).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fuel, maintenance, accessories, logFilter]);

  const refillEfficiencyData = useMemo(() => {
    return fuel.map((f, i) => ({ date: new Date(f.date).toLocaleDateString(), efficiency: i > 0 ? (f.odometer - fuel[i-1].odometer) / f.liters : 0 }));
  }, [fuel]);
  return (
    <div className={cn("min-h-screen font-sans flex flex-col items-center justify-center bg-[#0A0A0C] text-white")}>
      <div className={cn("w-full max-w-[430px] h-[100dvh] overflow-hidden flex flex-col relative bg-[#121216]")}>
        <header className="px-8 py-6 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter uppercase italic">MotoMate</h1>
        </header>
        <div className="flex-1 overflow-y-auto px-8 pb-32">
          {showOnboarding ? <Onboarding setBike={handleFinishOnboarding} setShowOnboarding={setShowOnboarding} isDarkMode={true} /> : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <Speedometer bike={bike} isDarkMode={true} activeTrip={activeTrip} startTrip={() => setActiveTrip({ startTime: new Date().toISOString(), startOdometer: bike?.odometer || 0 })} endTrip={() => setShowEndTripModal(true)} />}
              {activeTab === 'logs' && <LogsTab filteredLogs={filteredLogs} logFilter={logFilter} setLogFilter={setLogFilter} chartTimeframe={chartTimeframe} setChartTimeframe={setChartTimeframe} refillEfficiencyData={refillEfficiencyData} isDarkMode={true} />}
              {activeTab === 'trips' && <TripsTab trips={trips} isDarkMode={true} />}
              {activeTab === 'vault' && <VaultTab isDarkMode={true} serviceIssues={serviceIssues} setServiceIssues={setServiceIssues} />}
              {activeTab === 'about' && (
                <div className="space-y-4 p-4">
                  <h2 className="text-2xl font-black italic">About Bike</h2>
                  <p>Name: {bike?.name}</p>
                  <p>Model: {bike?.model}</p>
                  <button onClick={() => setShowEditBikeModal(true)} className="bg-orange-500 p-3 rounded-xl">Edit Profile</button>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
        {!showOnboarding && (
          <nav className="absolute bottom-0 left-0 right-0 h-20 bg-[#121216] border-t border-white/5 flex items-center justify-around px-4 z-20">
            <button onClick={() => setActiveTab('dashboard')}><LayoutDashboard /></button>
            <button onClick={() => setActiveTab('vault')}><Database /></button>
            <button onClick={() => setActiveTab('trips')}><Navigation /></button>
            <button onClick={() => setActiveTab('logs')}><Activity /></button>
            <button onClick={() => setActiveTab('about')}><Info /></button>
          </nav>
        )}
        <AnimatePresence>
          {showAddModal && <AddRecordModal bike={bike} setBike={setBike} fuel={fuel} setFuel={setFuel} maintenance={maintenance} setMaintenance={setMaintenance} accessories={accessories} setAccessories={setAccessories} setShowAddModal={setShowAddModal} isDarkMode={true} bikeAge="" />}
          {showEndTripModal && activeTrip && <EndTripModal activeTrip={activeTrip} bike={bike} setBike={setBike} setTrips={setTrips} setActiveTrip={setActiveTrip} setShowEndTripModal={setShowEndTripModal} isDarkMode={true} />}
          {showEditBikeModal && bike && <EditBikeModal bike={bike} setBike={setBike} onClose={() => setShowEditBikeModal(false)} isDarkMode={true} bikeAge="" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
