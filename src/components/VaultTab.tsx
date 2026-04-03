import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Wrench, Plus, CheckCircle2, FileText, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';

interface VaultTabProps {
  isDarkMode: boolean;
  serviceIssues: any[];
  setServiceIssues: React.Dispatch<React.SetStateAction<any[]>>;
}

export function VaultTab({ isDarkMode, serviceIssues, setServiceIssues }: VaultTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newIssueText, setNewIssueText] = useState('');
  const [showJobCard, setShowJobCard] = useState(false);

  const handleAddIssue = () => {
    if (newIssueText.trim()) {
      setServiceIssues(prev => [...prev, { 
        id: Math.random().toString(), 
        text: newIssueText.trim(), 
        date: new Date().toISOString(), 
        resolved: false 
      }]);
      setNewIssueText('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      key="garage"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20"
    >
      <h2 className="text-3xl font-black italic tracking-tighter uppercase">The Vault</h2>
      
      {/* Document Storage */}
      <div className="space-y-4">
        <p className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase">Secure Documents</p>
        <div className="grid grid-cols-2 gap-4">
          {['RC', 'INSURANCE', 'POLLUTION', 'LICENSE'].map((doc) => (
            <div key={doc} className={cn(
              "p-6 rounded-3xl flex flex-col items-center gap-3 border transition-all cursor-pointer group",
              isDarkMode ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-orange-500/50" : "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-orange-500/50"
            )}>
              <ShieldCheck className="w-8 h-8 text-orange-600 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-black tracking-widest">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Buddy - Moved from Dashboard */}
      <div className="space-y-4">
        <p className="text-[10px] text-gray-500 font-black tracking-[0.3em] uppercase">Service Buddy</p>
        <div className={cn(
          "p-6 rounded-[2.5rem] border backdrop-blur-md relative overflow-hidden",
          isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/10">
                <Wrench className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest italic">Issue Tracker</h3>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className={cn(
                "p-2.5 rounded-xl transition-all active:scale-90",
                isAdding 
                  ? "bg-red-500/10 text-red-500" 
                  : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black"
              )}
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="space-y-3">
                  <textarea 
                    value={newIssueText}
                    onChange={(e) => setNewIssueText(e.target.value)}
                    placeholder="Describe the issue (e.g. Brake noise, Oil leak...)"
                    className={cn(
                      "w-full px-4 py-3 rounded-2xl text-xs font-bold border outline-none transition-all resize-none h-24",
                      isDarkMode ? "bg-black/40 border-white/10 focus:border-yellow-500" : "bg-gray-50 border-gray-200 focus:border-yellow-500"
                    )}
                  />
                  <button 
                    onClick={handleAddIssue}
                    disabled={!newIssueText.trim()}
                    className="w-full py-3 rounded-2xl bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Tracker
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {serviceIssues.filter(i => !i.resolved).length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-green-500/20 mx-auto" />
                <p className="text-[10px] font-bold text-gray-500 uppercase italic">No pending issues. Ride safe!</p>
              </div>
            ) : (
              serviceIssues.filter(i => !i.resolved).map(issue => (
                <div key={issue.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 group border border-transparent hover:border-orange-500/20 transition-all">
                  <div className="flex flex-col flex-1 mr-4">
                    <span className="text-[11px] font-black uppercase tracking-tight break-words">{issue.text}</span>
                    <span className="text-[9px] font-bold text-gray-500">{format(new Date(issue.date), 'dd MMM yyyy')}</span>
                  </div>
                  <button 
                    onClick={() => setServiceIssues(prev => prev.map(i => i.id === issue.id ? { ...i, resolved: true } : i))}
                    className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition-all shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {serviceIssues.filter(i => !i.resolved).length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3 h-3 text-gray-500" />
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Service Day Job Card</p>
              </div>
              <button 
                onClick={() => setShowJobCard(!showJobCard)}
                className={cn(
                  "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5",
                  showJobCard ? "bg-white/10 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                {showJobCard ? "Hide Job Card" : "Generate Job Card"}
              </button>

              <AnimatePresence>
                {showJobCard && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className={cn(
                      "p-5 rounded-2xl border border-dashed",
                      isDarkMode ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"
                    )}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">Official Job Card</span>
                        <span className="text-[8px] font-bold text-gray-500">{format(new Date(), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="space-y-2">
                        {serviceIssues.filter(i => !i.resolved).map((i, idx) => (
                          <div key={i.id} className="flex gap-3 text-[10px] font-bold">
                            <span className="text-gray-500">{idx + 1}.</span>
                            <span className="uppercase tracking-tight">{i.text}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                        <p className="text-[8px] text-gray-500 italic">Present this to your service advisor</p>
                        <div className="w-12 h-12 border border-white/10 rounded-lg flex items-center justify-center opacity-20">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
