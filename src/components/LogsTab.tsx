import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  History, 
  TrendingUp, 
  Calculator,
  Filter,
  Fuel,
  CalendarDays,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

interface LogsTabProps {
  filteredLogs: any[];
  logFilter: string;
  setLogFilter: (filter: string) => void;
  chartTimeframe: string;
  setChartTimeframe: (timeframe: string) => void;
  chartMetric: string;
  setChartMetric: (metric: string) => void;
  fuelData: any[];
  refillEfficiencyData: any[];
  isDarkMode: boolean;
  totalOverallCost: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalAccessoriesCost: number;
  lowestPriceLastMonth: number;
  dayWiseUsage: { day: string, km: number }[];
  stationEfficiency: { 
    stats: { name: string, efficiency: number, count: number }[],
    isSixMonthMilestone: boolean,
    daysTracked: number
  };
}

export function LogsTab({
  filteredLogs,
  logFilter,
  setLogFilter,
  chartTimeframe,
  setChartTimeframe,
  chartMetric,
  setChartMetric,
  fuelData,
  refillEfficiencyData,
  isDarkMode,
  totalOverallCost,
  totalFuelCost,
  totalMaintenanceCost,
  totalAccessoriesCost,
  lowestPriceLastMonth,
  dayWiseUsage,
  stationEfficiency
}: LogsTabProps) {
  const [isTooltipActive, setIsTooltipActive] = useState(false);
  const [activeChart, setActiveChart] = useState<'expense' | 'efficiency' | 'refill' | 'costPerKm' | 'priceTrend' | 'usage'>('expense');

  const efficiencyThreshold = 40;
  const off = useMemo(() => {
    if (activeChart !== 'efficiency') return 0;
    const dataMax = Math.max(...fuelData.map((i) => i.efficiency), efficiencyThreshold + 5);
    const dataMin = Math.min(...fuelData.map((i) => i.efficiency), efficiencyThreshold - 5);

    if (dataMax <= dataMin) return 0;
    if (efficiencyThreshold >= dataMax) return 0;
    if (efficiencyThreshold <= dataMin) return 1;

    return (dataMax - efficiencyThreshold) / (dataMax - dataMin);
  }, [fuelData, activeChart]);

  return (
    <motion.div
      key="logs"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-black italic tracking-tighter uppercase">Analytics & Logs</h2>
      
      {/* Expense Analytics Graph */}
      <div className={cn(
        "p-6 rounded-[2.5rem] border space-y-6 backdrop-blur-md",
        isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100"
      )}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <select 
                value={activeChart}
                onChange={(e) => setActiveChart(e.target.value as any)}
                className={cn(
                  "w-full appearance-none px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-none outline-none cursor-pointer",
                  isDarkMode ? "bg-white/5 text-gray-300" : "bg-black/5 text-gray-700"
                )}
              >
                <option value="expense">Expense Analytics</option>
                <option value="efficiency">Efficiency Wave</option>
                <option value="refill">Refill Efficiency</option>
                <option value="costPerKm">Cost Per KM</option>
                <option value="priceTrend">Fuel Price Trend</option>
                <option value="usage">Usage Histogram</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {activeChart === 'expense' && (
              <div className="flex gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5">
                <button 
                  onClick={() => setChartMetric('cost')}
                  className={cn(
                    "p-2 rounded-lg transition-all", 
                    chartMetric === 'cost' ? "bg-orange-500 text-black shadow-lg" : "text-gray-500"
                  )}
                  title="Total Cost"
                >
                  <Calculator className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setChartMetric('liters')}
                  className={cn(
                    "p-2 rounded-lg transition-all", 
                    chartMetric === 'liters' ? "bg-orange-500 text-black shadow-lg" : "text-gray-500"
                  )}
                  title="Fuel Volume"
                >
                  <Fuel className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Timeframe Selector - Moved here */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
            {(['1m', '3m', '6m', '1y', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setChartTimeframe(tf)}
                className={cn(
                  "py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  chartTimeframe === tf 
                    ? "bg-white dark:bg-[#2A2A32] text-orange-500 shadow-sm" 
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'usage' ? (
              <BarChart data={dayWiseUsage} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#eee"} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1E1E24' : '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '10px'
                  }}
                />
                <Bar dataKey="km" radius={[10, 10, 0, 0]}>
                  {dayWiseUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.km === Math.max(...dayWiseUsage.map(d => d.km)) ? '#f97316' : '#444'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart 
                data={activeChart === 'refill' ? refillEfficiencyData : fuelData} 
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) setIsTooltipActive(true);
                else setIsTooltipActive(false);
              }}
              onMouseLeave={() => setIsTooltipActive(false)}
              onMouseUp={() => setIsTooltipActive(false)}
            >
              <defs>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAccessories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset={off} stopColor="#ef4444" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorRefill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCostPerKm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPriceTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#eee"} />
              <XAxis dataKey="date" hide={activeChart !== 'refill'} tick={{ fontSize: 8, fill: '#888' }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#888' }}
                tickFormatter={(value) => {
                  if (activeChart === 'efficiency' || activeChart === 'refill') return `${value}`;
                  if (activeChart === 'costPerKm' || activeChart === 'priceTrend') return `₹${value}`;
                  return chartMetric === 'cost' ? `₹${value}` : `${value}L`;
                }}
              />
              <Tooltip 
                active={isTooltipActive}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1E1E24' : '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: '10px'
                }}
                itemStyle={{ fontWeight: 'bold', padding: '2px 0' }}
                cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' }}
                animationDuration={0}
                formatter={(value: number, name: string, props: any) => {
                  if (activeChart === 'efficiency') {
                    return [`${value} KM/L`, 'Efficiency'];
                  }
                  if (activeChart === 'costPerKm') {
                    return [`₹${value} / KM`, 'Cost per KM'];
                  }
                  if (activeChart === 'priceTrend') {
                    return [`₹${value} / L`, 'Fuel Price'];
                  }
                  if (activeChart === 'refill') {
                    const { cost, liters } = props.payload;
                    return [
                      <div className="space-y-1">
                        <p className="text-blue-500">{value} KM/L</p>
                        <p className="text-gray-500 font-normal">Fuel: {liters}L | Cost: ₹{cost}</p>
                      </div>,
                      'Refill Stats'
                    ];
                  }
                  const label = name === 'fuelCost' ? 'Fuel' : 
                                name === 'maintenanceCost' ? 'Service' : 
                                name === 'accessoriesCost' ? 'Extras' : 
                                name === 'liters' ? 'Volume' : 'Total';
                  const formattedValue = chartMetric === 'cost' ? `₹${value}` : `${value.toFixed(1)} L`;
                  return [formattedValue, label];
                }}
              />
              {activeChart === 'efficiency' ? (
                <>
                  <ReferenceLine y={efficiencyThreshold} stroke="#ef4444" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke={off > 0 ? "#22c55e" : "#ef4444"} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEfficiency)" 
                    isAnimationActive={false}
                  />
                </>
              ) : activeChart === 'refill' ? (
                <Area 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRefill)" 
                  isAnimationActive={false}
                />
              ) : activeChart === 'costPerKm' ? (
                <Area 
                  type="monotone" 
                  dataKey="costPerKm" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCostPerKm)" 
                  isAnimationActive={false}
                />
              ) : activeChart === 'priceTrend' ? (
                <Area 
                  type="monotone" 
                  dataKey="avgPricePerLiter" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPriceTrend)" 
                  isAnimationActive={false}
                />
              ) : chartMetric === 'cost' ? (
                <>
                  <Area 
                    stackId="1"
                    type="monotone" 
                    dataKey="fuelCost" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorFuel)" 
                    isAnimationActive={false}
                  />
                  <Area 
                    stackId="1"
                    type="monotone" 
                    dataKey="maintenanceCost" 
                    stroke="#eab308" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorMaintenance)" 
                    isAnimationActive={false}
                  />
                  <Area 
                    stackId="1"
                    type="monotone" 
                    dataKey="accessoriesCost" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAccessories)" 
                    isAnimationActive={false}
                  />
                </>
              ) : (
                <Area 
                  type="monotone" 
                  dataKey="liters" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFuel)" 
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          )}
          </ResponsiveContainer>
        </div>
        
        {activeChart === 'usage' && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>Most usage on <span className="text-orange-500">{dayWiseUsage.reduce((a, b) => a.km > b.km ? a : b).day}</span></span>
          </div>
        )}

        {activeChart === 'priceTrend' && lowestPriceLastMonth > 0 && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">
            <CheckCircle2 className="w-4 h-4 text-pink-500" />
            <span>
              Last month, you bought fuel at the cheapest rate of <span className="text-pink-500">₹{lowestPriceLastMonth.toFixed(2)} / L</span>
            </span>
          </div>
        )}

        {activeChart === 'costPerKm' && fuelData.length >= 2 && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span>
              Last period: ₹{fuelData[fuelData.length - 2].costPerKm} / KM | 
              This period: <span className={fuelData[fuelData.length - 1].costPerKm > fuelData[fuelData.length - 2].costPerKm ? "text-red-500" : "text-green-500"}>₹{fuelData[fuelData.length - 1].costPerKm} / KM</span>
            </span>
          </div>
        )}

        {activeChart === 'expense' && chartMetric === 'cost' && (
          <div className="flex justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Fuel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Service</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Extras</span>
            </div>
          </div>
        )}

        {activeChart === 'efficiency' && (
          <div className="flex justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">KM/L Efficiency</span>
            </div>
          </div>
        )}

        {activeChart === 'refill' && (
          <div className="flex justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Per Refill Efficiency</span>
            </div>
          </div>
        )}
      </div>

      {/* Fuel Quality Analysis */}
      <div className={cn(
        "p-6 rounded-[2.5rem] border space-y-6 backdrop-blur-md",
        isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100"
      )}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-black uppercase tracking-widest">Fuel Quality Analysis</h3>
        </div>
        
        <div className="space-y-4">
          {stationEfficiency.stats.length > 0 ? (
            stationEfficiency.stats.map((station, index) => (
              <div key={station.name} className={cn(
                "p-4 rounded-2xl border transition-all",
                isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-black italic",
                      index === 0 ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{station.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{station.count} Refills tracked</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-black italic",
                      index === 0 ? "text-green-500" : "text-orange-500"
                    )}>{station.efficiency} <span className="text-[10px] font-normal opacity-50">KMPL</span></p>
                  </div>
                </div>
                {/* Progress bar to compare */}
                <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(station.efficiency / stationEfficiency.stats[0].efficiency) * 100}%` }}
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-green-500" : "bg-orange-500"
                    )}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm font-bold">Not enough data for analysis.</p>
              <p className="text-[10px] uppercase tracking-widest mt-1">Track at least 2 refills to see results</p>
            </div>
          )}
        </div>

        {stationEfficiency.stats.length >= 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Insight</p>
              <p className="text-xs font-bold leading-relaxed">
                Based on your data, <span className="text-orange-500">{stationEfficiency.stats[0].name}</span> provides the best fuel quality with <span className="text-orange-500">{stationEfficiency.stats[0].efficiency} KM/L</span>. 
                Switching from {stationEfficiency.stats[stationEfficiency.stats.length - 1].name} could improve your range by {((stationEfficiency.stats[0].efficiency / stationEfficiency.stats[stationEfficiency.stats.length - 1].efficiency - 1) * 100).toFixed(1)}%.
              </p>
            </div>

            {stationEfficiency.isSixMonthMilestone ? (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">6-Month Milestone Reached!</p>
                  <p className="text-xs font-bold">Your fuel quality data is now highly accurate based on long-term tracking.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <CalendarDays className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Tracking Progress</p>
                  <p className="text-xs font-bold">{180 - stationEfficiency.daysTracked} more days to reach 6-month high-accuracy milestone.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entry History */}
      <div className={cn(
        "p-6 rounded-[2.5rem] border space-y-6 backdrop-blur-md",
        isDarkMode ? "bg-[#1E1E24]/80 border-white/5" : "bg-white/80 border-gray-100"
      )}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-black uppercase tracking-widest">Entry History</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Filtered Total</p>
            <p className="text-lg font-black italic text-orange-500">₹{filteredLogs.reduce((acc, log) => acc + log.cost, 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['all', 'fuel', 'maintenance', 'accessory'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                  logFilter === filter 
                    ? "bg-orange-500 text-black" 
                    : isDarkMode ? "bg-white/10 text-gray-400" : "bg-gray-200 text-gray-600"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const Icon = log.icon;
              return (
                <div key={log.id} className={cn(
                  "p-4 rounded-2xl flex items-center justify-between border transition-all hover:scale-[1.02]",
                  isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", log.bg)}>
                      <Icon className={cn("w-5 h-5", log.color)} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{log.title}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                        <CalendarDays className="w-3 h-3" />
                        <span>{format(new Date(log.date), 'dd MMM yyyy')}</span>
                        {log.odometer && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-500" />
                            <span>{log.odometer} KM</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black italic text-orange-500">₹{log.cost}</p>
                    {log.liters && <p className="text-[10px] font-bold text-gray-500">{log.liters} L</p>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm font-bold">No records found.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
