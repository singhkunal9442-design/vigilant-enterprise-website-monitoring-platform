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
  const chartData = [...monitor.history].slice(0, 15).reverse();
  return (
    <Card
      className={cn(
        "group bg-card border-border hover:border-emerald-500/30 transition-comfort cursor-pointer overflow-hidden shadow-comfort hover:shadow-glow hover:-translate-y-1",
        !isUp && !isPending && "hover:border-rose-500/30 hover:shadow-rose-500/5"
      )}
      onClick={onClick}
    >
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0",
              isUp ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20",
              isPending && "bg-secondary text-muted-foreground"
            )}>
              <Globe className="w-6 h-6" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <h3 className="font-black text-foreground group-hover:text-emerald-500 transition-colors truncate tracking-tight">{monitor.name}</h3>
              <p className="text-xs text-muted-foreground truncate font-mono font-medium">{monitor.url.replace(/^https?:\/\//, '')}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn(
            "rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter shrink-0 transition-all duration-500",
            isUp ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse" : "bg-rose-500/10 text-rose-500 border-rose-500/20",
            isPending && "bg-secondary text-muted-foreground border-border"
          )}>
            {isPending ? "Pending" : monitor.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-8 py-4">
        <div className="h-16 w-full opacity-40 group-hover:opacity-100 transition-opacity duration-500">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke={isUp ? "#10b981" : "#f43f5e"}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground font-mono tracking-widest uppercase opacity-50">
              Initializing...
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-8 py-5 flex items-center justify-between text-[11px] font-bold font-mono text-muted-foreground border-t border-border/40 mt-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 opacity-60" />
          {monitor.interval}m
        </div>
        <div className="flex items-center gap-2">
          <Activity className={cn("w-3.5 h-3.5", isUp ? "text-emerald-500" : "text-rose-500")} />
          {chartData[chartData.length - 1]?.latency ?? 0}ms
        </div>
      </CardFooter>
    </Card>
  );
}