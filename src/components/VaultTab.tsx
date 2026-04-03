import { useState } from 'react';
import { motion } from 'motion/react';
import { Database, FileText, Wrench, Plus, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface VaultTabProps {
  isDarkMode: boolean;
  serviceIssues: { id: string, text: string, date: string, resolved: boolean }[];
  setServiceIssues: React.Dispatch<React.SetStateAction<{ id: string, text: string, date: string, resolved: boolean }[]>>;
}

export function VaultTab({ isDarkMode, serviceIssues, setServiceIssues }: VaultTabProps) {
  const [newIssue, setNewIssue] = useState('');

  const addIssue = () => {
    if (!newIssue.trim()) return;
    setServiceIssues([...serviceIssues, { id: Math.random().toString(36).substr(2, 9), text: newIssue, date: new Date().toISOString(), resolved: false }]);
    setNewIssue('');
  };

  const toggleIssue = (id: string) => {
    setServiceIssues(serviceIssues.map(i => i.id === id ? { ...i, resolved: !i.resolved } : i));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Vault</h2>
        <div className="bg-purple-500/10 p-2 rounded-xl">
          <Database className="w-6 h-6 text-purple-500" />
        </div>
      </div>

      {/* Service Issue Tracker */}
      <div className={cn("p-8 rounded-[2.5rem] border", isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100")}>
        <h3 className="text-xs font-bold text-purple-500 uppercase tracking-[0.3em] mb-6">Service Tracker</h3>
        
        <div className="flex gap-2 mb-6">
          <input 
            value={newIssue}
            onChange={(e) => setNewIssue(e.target.value)}
            placeholder="New issue..."
            className={cn("flex-1 p-4 rounded-2xl text-sm font-bold border outline-none", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}
          />
          <button onClick={addIssue} className="p-4 rounded-2xl bg-purple-500 text-black"><Plus className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          {serviceIssues.map(issue => (
            <div key={issue.id} className={cn("p-4 rounded-2xl flex items-center justify-between border", isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
              <p className={cn("text-sm font-bold", issue.resolved && "line-through opacity-50")}>{issue.text}</p>
              <button onClick={() => toggleIssue(issue.id)} className={cn("p-2 rounded-xl", issue.resolved ? "bg-green-500/20 text-green-500" : "bg-gray-500/10")}>
                {issue.resolved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
