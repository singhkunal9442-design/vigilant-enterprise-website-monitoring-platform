import React from 'react';
import { Globe, Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Monitor } from '@shared/types';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
interface MonitorCardProps {
  monitor: Monitor;
  onClick?: () => void;
}
export function MonitorCard({ monitor, onClick }: MonitorCardProps) {
  const isUp = monitor.status === 'UP';
  const isPending = monitor.status === 'PENDING';
  // Format history for sparkline
  const chartData = [...monitor.history].slice(0, 10).reverse();
  return (
    <Card
      className="group bg-slate-900/40 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-emerald-500/10 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
              isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500",
              isPending && "bg-slate-800 text-slate-400"
            )}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate">{monitor.name}</h3>
              <p className="text-xs text-slate-500 truncate">{monitor.url}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
            isUp ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20",
            isPending && "bg-slate-800 text-slate-400 border-slate-700"
          )}>
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
                Wait
              </span>
            ) : monitor.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="h-16 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke={isUp ? "#10b981" : "#f43f5e"}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-600 italic">
              Awaiting initial metrics...
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between text-xs font-medium text-slate-500 border-t border-slate-800/50 mt-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {monitor.interval}m
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          {chartData[chartData.length - 1]?.latency ?? 0}ms
        </div>
      </CardFooter>
    </Card>
  );
}