import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export function AddRecordModal({ bike, setBike, fuel, setFuel, maintenance, setMaintenance, accessories, setAccessories, setShowAddModal, isDarkMode, bikeAge }: any) {
  const [type, setType] = useState('fuel');
  const [formData, setFormData] = useState({ date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), cost: '', odometer: bike?.odometer || '', liters: '', name: '' });
  const handleAdd = () => {
    const id = Math.random().toString(36).substr(2, 9);
    if (type === 'fuel') setFuel([...fuel, { id, date: formData.date, cost: parseFloat(formData.cost), liters: parseFloat(formData.liters), odometer: parseFloat(formData.odometer as any) }]);
    else if (type === 'maintenance') setMaintenance([...maintenance, { id, type: formData.name || 'Service', date: formData.date, cost: parseFloat(formData.cost), odometer: parseFloat(formData.odometer as any) }]);
    setShowAddModal(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className={cn("w-full max-w-sm rounded-[2.5rem] p-6 border", isDarkMode ? "bg-[#1E1E24] border-white/10" : "bg-white border-gray-100")}>
        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black uppercase italic">New Entry</h3><button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button></div>
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl">
          {['fuel', 'maintenance'].map(t => <button key={t} onClick={() => setType(t)} className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase", type === t ? "bg-orange-500 text-black" : "text-gray-500")}>{t}</button>)}
        </div>
        <input type="number" placeholder="Cost" onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full p-4 rounded-2xl bg-white/5 mb-4 outline-none" />
        {type === 'fuel' && <input type="number" placeholder="Liters" onChange={e => setFormData({...formData, liters: e.target.value})} className="w-full p-4 rounded-2xl bg-white/5 mb-4 outline-none" />}
        <input type="number" placeholder="Odometer" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} className="w-full p-4 rounded-2xl bg-white/5 mb-4 outline-none" />
        <button onClick={handleAdd} className="w-full bg-orange-500 text-black py-5 rounded-[2rem] font-black uppercase">Save</button>
      </motion.div>
    </div>
  );
}
