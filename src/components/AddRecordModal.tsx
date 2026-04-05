import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { Bike, FuelRecord, MaintenanceRecord, AccessoryRecord } from '../types';

interface AddRecordModalProps {
  bike: Bike | null;
  setBike: React.Dispatch<React.SetStateAction<Bike | null>>;
  fuel: FuelRecord[];
  setFuel: React.Dispatch<React.SetStateAction<FuelRecord[]>>;
  maintenance: MaintenanceRecord[];
  setMaintenance: React.Dispatch<React.SetStateAction<MaintenanceRecord[]>>;
  accessories: AccessoryRecord[];
  setAccessories: React.Dispatch<React.SetStateAction<AccessoryRecord[]>>;
  setShowAddModal: (show: boolean) => void;
  isDarkMode: boolean;
  bikeAge: string;
}

export function AddRecordModal({
  bike, setBike, fuel, setFuel, maintenance, setMaintenance,
  accessories, setAccessories, setShowAddModal, isDarkMode, bikeAge
}: AddRecordModalProps) {
  const [type, setType] = useState<'fuel' | 'maintenance' | 'accessory'>('fuel');
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    cost: '',
    odometer: bike?.odometer.toString() || '',
    liters: '',
    name: '',
    stationName: '',
    notes: '',
    isDump: false
  });

  const petrolStations = ["Indian Oil", "HP Petrol Pump", "Bharat Petroleum", "Reliance", "Nayara"];

  const handleAdd = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const enteredOdo = Math.round(parseFloat(formData.odometer) * 10) / 10;
    
    if (!isNaN(enteredOdo) && enteredOdo > (bike?.odometer || 0)) {
      setBike(prev => prev ? { ...prev, odometer: enteredOdo } : null);
    }

    if (type === 'fuel') {
      const newRecord: FuelRecord = {
        id,
        date: formData.date,
        cost: formData.isDump ? 0 : parseFloat(formData.cost || '0'),
        liters: formData.isDump ? 0 : parseFloat(formData.liters || '0'),
        odometer: enteredOdo,
        stationName: formData.isDump ? 'Fuel Dump' : (formData.stationName || 'Unknown Station'),
        isDump: formData.isDump
      };
      setFuel([...fuel, newRecord]);
    } else if (type === 'maintenance') {
      const newRecord: MaintenanceRecord = {
        id, type: formData.name || 'General Service', date: formData.date,
        cost: parseFloat(formData.cost || '0'), odometer: enteredOdo, notes: formData.notes
      };
      setMaintenance([...maintenance, newRecord]);
    } else {
      const newRecord: AccessoryRecord = {
        id, name: formData.name || 'New Accessory', date: formData.date,
        cost: parseFloat(formData.cost || '0'), notes: formData.notes
      };
      setAccessories([...accessories, newRecord]);
    }
    setShowAddModal(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }}
        className={cn("w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border", isDarkMode ? "bg-[#1E1E24] border-white/10" : "bg-white border-gray-100")}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">New Entry</h3>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Unit Age: {bikeAge}</p>
          </div>
          <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full bg-black/5 dark:bg-white/5"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
          {(['fuel', 'maintenance', 'accessory'] as const).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                type === t ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}>{t}</button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Date & Time</label>
            <input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
          </div>

          {type === 'fuel' && (
            <div className="flex items-center gap-2 px-2 py-1">
              <input type="checkbox" id="isDump" checked={formData.isDump} onChange={e => setFormData({...formData, isDump: e.target.checked})} className="w-4 h-4 accent-red-500" />
              <label htmlFor="isDump" className="text-xs font-bold text-red-500 uppercase tracking-widest">Fuel Dump (Tank Emptied)</label>
            </div>
          )}

          {!formData.isDump && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Cost (₹)</label>
                <input type="number" placeholder="0.00" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
              </div>
              
              {type === 'fuel' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Liters</label>
                  <input type="number" placeholder="0.00" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})}
                    className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Name / Type</label>
                  <input type="text" placeholder={type === 'maintenance' ? "Service type" : "Item name"} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
                </div>
              )}
            </div>
          )}

          {type === 'fuel' && !formData.isDump && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Petrol Pump Name</label>
              <div className="relative">
                <input type="text" placeholder="Enter or select station" value={formData.stationName} onChange={e => setFormData({...formData, stationName: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {petrolStations.map(station => (
                    <button key={station} onClick={() => setFormData({...formData, stationName: station})}
                      className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all",
                        formData.stationName === station ? "bg-orange-500 border-orange-500 text-black" : isDarkMode ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-600"
                      )}>{station}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type !== 'accessory' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Odometer Reading (KM)</label>
              <input type="number" step="0.1" placeholder="0.0" value={formData.odometer}
                onChange={e => {
                  const val = e.target.value;
                  if (/^\d*\.?\d{0,1}$/.test(val)) setFormData({...formData, odometer: val});
                }}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")} />
            </div>
          )}

          <button onClick={handleAdd} className="w-full bg-orange-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95 mt-4">
            Save Entry
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
              }
