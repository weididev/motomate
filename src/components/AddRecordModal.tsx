import { useState } from 'react';
import { motion } from 'motion/react';
import { Fuel, Wrench, Plus, X } from 'lucide-react';
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
  editMode?: {
    id: string;
    category: 'fuel' | 'maintenance' | 'accessory';
    data: any;
  };
}

export function AddRecordModal({
  bike, setBike,
  fuel, setFuel,
  maintenance, setMaintenance,
  accessories, setAccessories,
  setShowAddModal,
  isDarkMode,
  bikeAge,
  editMode
}: AddRecordModalProps) {
  const [type, setType] = useState<'fuel' | 'maintenance' | 'accessory'>(editMode?.category || 'fuel');
  const [formData, setFormData] = useState({
    date: editMode?.data.date || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    cost: editMode?.data.cost?.toString() || '',
    odometer: editMode?.data.odometer?.toString() || bike?.odometer.toString() || '',
    liters: editMode?.data.liters?.toString() || '',
    name: editMode?.data.name || editMode?.data.type || '',
    stationName: editMode?.data.stationName || '',
    notes: editMode?.data.notes || '',
    isFullTank: editMode?.data.isFullTank ?? true,
    partChanged: editMode?.data.partChanged ?? false,
    nextReplacementOdometer: editMode?.data.nextReplacementOdometer?.toString() || ''
  });
  const [maintenanceItems, setMaintenanceItems] = useState<{name: string, cost: string}[]>([]);

  const petrolStations = [
    "Indian Oil", "HP Petrol Pump", "Bharat Petroleum", "Reliance", "Nayara"
  ];

  const mt15MaintenancePresets = [
    "Engine Oil (Yamalube)", "Oil Filter", "Chain Lube & Clean",
    "Brake Pads (F/R)", "Air Filter", "Coolant", "Spark Plug", "General Service"
  ];

  const mt15AccessoryPresets = [
    "Visor", "Frame Sliders", "Tank Pad", "Seat Cover",
    "Mobile Holder", "Radiator Guard", "Lever Guards"
  ];

  const handleAdd = () => {
    const id = editMode?.id || Math.random().toString(36).substr(2, 9);
    
    // Update global odometer if a higher value is entered
    const enteredOdo = Math.round(parseFloat(formData.odometer) * 10) / 10;
    if (!isNaN(enteredOdo) && enteredOdo > (bike?.odometer || 0)) {
      setBike(prev => prev ? { ...prev, odometer: enteredOdo } : null);
    }

    if (type === 'fuel') {
      const newRecord: FuelRecord = {
        id,
        date: formData.date,
        cost: parseFloat(formData.cost),
        liters: parseFloat(formData.liters),
        odometer: enteredOdo,
        stationName: formData.stationName || 'Unknown Station',
        isFullTank: formData.isFullTank
      };
      if (editMode) {
        setFuel(prev => prev.map(r => r.id === id ? newRecord : r));
      } else {
        setFuel([...fuel, newRecord]);
      }
    } else if (type === 'maintenance') {
      const newRecord: MaintenanceRecord = {
        id,
        type: formData.name || 'General Service',
        date: formData.date,
        cost: parseFloat(formData.cost),
        odometer: enteredOdo,
        notes: formData.notes,
        partChanged: maintenanceItems.length > 0 || formData.partChanged,
        nextReplacementOdometer: formData.nextReplacementOdometer ? parseFloat(formData.nextReplacementOdometer) : undefined
      };
      if (editMode) {
        setMaintenance(prev => prev.map(r => r.id === id ? newRecord : r));
      } else {
        setMaintenance([...maintenance, newRecord]);
      }

      // Auto-add to accessories if a part was changed (only on new entries)
      if (!editMode) {
        const newAccessories: AccessoryRecord[] = [];
        
        if (maintenanceItems.length > 0) {
          maintenanceItems.forEach(item => {
            if (item.name && item.cost) {
              newAccessories.push({
                id: Math.random().toString(36).substr(2, 9),
                name: item.name,
                date: formData.date,
                cost: parseFloat(item.cost),
                notes: `Added during maintenance: ${formData.name || 'General Service'}`,
                isMaintenancePart: true
              });
            }
          });
        } else if (formData.partChanged) {
          newAccessories.push({
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name || 'Maintenance Part',
            date: formData.date,
            cost: parseFloat(formData.cost),
            notes: `Auto-added from maintenance: ${formData.notes || ''}`,
            isMaintenancePart: true
          });
        }

        if (newAccessories.length > 0) {
          setAccessories([...accessories, ...newAccessories]);
        }
      }
    } else {
      const newRecord: AccessoryRecord = {
        id,
        name: formData.name || 'New Accessory',
        date: formData.date,
        cost: parseFloat(formData.cost),
        notes: formData.notes
      };
      if (editMode) {
        setAccessories(prev => prev.map(r => r.id === id ? newRecord : r));
      } else {
        setAccessories([...accessories, newRecord]);
      }
    }
    setShowAddModal(false);
  };

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
          "w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border",
          isDarkMode ? "bg-[#1E1E24] border-white/10" : "bg-white border-gray-100"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">{editMode ? 'Edit Entry' : 'New Entry'}</h3>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Unit Age: {bikeAge}</p>
          </div>
          <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full bg-black/5 dark:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
          {(['fuel', 'maintenance', 'accessory'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                type === t 
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Date & Time</label>
            <input 
              type="datetime-local" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">
                {type === 'maintenance' ? 'Labor / Extra Cost (₹)' : 'Cost (₹)'}
              </label>
              <input 
                type="number" 
                placeholder="0.00"
                value={formData.cost}
                onChange={e => setFormData({...formData, cost: e.target.value})}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
              />
            </div>
            
            {type === 'fuel' ? (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Liters</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={formData.liters}
                  onChange={e => setFormData({...formData, liters: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Name / Type</label>
                <input 
                  type="text" 
                  placeholder={type === 'maintenance' ? "Service type" : "Item name"}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
                />
              </div>
            )}
          </div>

          {type !== 'fuel' && (
            <div className="flex flex-wrap gap-2">
              {(type === 'maintenance' ? mt15MaintenancePresets : mt15AccessoryPresets).map(preset => (
                <button
                  key={preset}
                  onClick={() => setFormData(prev => ({ ...prev, name: preset }))}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                    formData.name === preset 
                      ? "bg-orange-500 text-black border-orange-500" 
                      : isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}

          {type === 'fuel' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Petrol Pump Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter or select station"
                    value={formData.stationName}
                    onChange={e => setFormData({...formData, stationName: e.target.value})}
                    className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {petrolStations.map(station => (
                      <button
                        key={station}
                        onClick={() => setFormData({...formData, stationName: station})}
                        className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all",
                          formData.stationName === station 
                            ? "bg-orange-500 border-orange-500 text-black" 
                            : isDarkMode ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-600"
                        )}
                      >
                        {station}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl border bg-black/5 dark:bg-white/5 dark:border-white/10">
                <div>
                  <p className="text-sm font-bold">Full Tank Refill</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Required for accurate mileage</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, isFullTank: !formData.isFullTank})}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    formData.isFullTank ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-700"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white absolute top-1 transition-all",
                    formData.isFullTank ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            </>
          )}

          {type === 'maintenance' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Parts Replaced / Added</label>
                  <button 
                    onClick={() => setMaintenanceItems([...maintenanceItems, { name: '', cost: '' }])}
                    className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1 hover:text-orange-600"
                  >
                    <Plus className="w-3 h-3" /> Add Part
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2 items-center">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mr-1">Quick Add:</span>
                  {mt15MaintenancePresets.filter(p => p !== "General Service").map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        // Check if there's an empty item to fill, otherwise add new
                        const emptyIndex = maintenanceItems.findIndex(item => !item.name);
                        if (emptyIndex !== -1) {
                          const newItems = [...maintenanceItems];
                          newItems[emptyIndex].name = preset;
                          setMaintenanceItems(newItems);
                        } else {
                          setMaintenanceItems([...maintenanceItems, { name: preset, cost: '' }]);
                        }
                      }}
                      className={cn(
                        "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all",
                        isDarkMode ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                
                {maintenanceItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Part name"
                      value={item.name}
                      onChange={e => {
                        const newItems = [...maintenanceItems];
                        newItems[index].name = e.target.value;
                        setMaintenanceItems(newItems);
                      }}
                      className={cn("flex-1 p-3 rounded-xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
                    />
                    <input 
                      type="number" 
                      placeholder="Price (₹)"
                      value={item.cost}
                      onChange={e => {
                        const newItems = [...maintenanceItems];
                        newItems[index].cost = e.target.value;
                        setMaintenanceItems(newItems);
                      }}
                      className={cn("w-24 p-3 rounded-xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
                    />
                    <button 
                      onClick={() => setMaintenanceItems(maintenanceItems.filter((_, i) => i !== index))}
                      className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Next Service Odo (KM)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 10000"
                  value={formData.nextReplacementOdometer}
                  onChange={e => setFormData({...formData, nextReplacementOdometer: e.target.value})}
                  className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
                />
              </div>
            </div>
          )}

          {type !== 'accessory' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Odometer Reading (KM)</label>
              <input 
                type="number" 
                step="0.1"
                placeholder="0.0"
                value={formData.odometer}
                onChange={e => {
                  const val = e.target.value;
                  if (/^\d*\.?\d{0,1}$/.test(val)) {
                    setFormData({...formData, odometer: val});
                  }
                }}
                className={cn("w-full p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
              />
            </div>
          )}

          <button 
            onClick={handleAdd}
            className="w-full bg-orange-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95 mt-4"
          >
            Save Entry
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
