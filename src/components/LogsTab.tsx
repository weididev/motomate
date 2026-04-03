import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Fuel, Wrench, Plus, Droplets, Filter, BarChart2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from '../lib/utils';

export function LogsTab({ 
  filteredLogs, logFilter, setLogFilter, chartTimeframe, setChartTimeframe, 
  fuelData, refillEfficiencyData, isDarkMode, totalOverallCost, 
  totalFuelCost, totalMaintenanceCost, totalAccessoriesCost, 
  lowestPriceLastMonth, dayWiseUsage, stationEfficiency 
}: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Logs</h2>
        <div className="flex gap-2">
          {['all', 'fuel', 'maintenance', 'accessory'].map(f => (
            <button 
              key={f}
              onClick={() => setLogFilter(f)}
              className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", logFilter === f ? "bg-orange-500 text-black" : "bg-white/5")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Chart */}
      <div className={cn("p-6 rounded-[2.5rem] border backdrop-blur-md", isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100")}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-orange-500 uppercase tracking-[0.3em]">Efficiency Trend</h3>
          <select value={chartTimeframe} onChange={(e) => setChartTimeframe(e.target.value)} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none">
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={refillEfficiencyData}>
              <defs>
                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#333" : "#eee"} />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#121216' : '#fff', borderRadius: '1rem', border: 'none' }} />
              <Area type="monotone" dataKey="efficiency" stroke="#f97316" fillOpacity={1} fill="url(#colorEff)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log: any) => (
          <div key={log.id} className={cn("p-4 rounded-2xl flex items-center gap-4 border", isDarkMode ? "bg-[#1E1E24]/50 border-white/5" : "bg-white border-gray-100")}>
            <div className={cn("p-3 rounded-xl", log.bg)}>
              <log.icon className={cn("w-5 h-5", log.color)} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black">{log.title}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(log.date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm font-black italic">₹{log.cost.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
