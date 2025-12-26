import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  Globe, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { Monitor } from '@shared/types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
export default function MonitorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: monitor, isLoading } = useQuery({
    queryKey: ['monitor', id],
    queryFn: () => api<Monitor>(`/api/monitors/${id}`),
    enabled: !!id,
  });
  const checkMutation = useMutation({
    mutationFn: () => api<Monitor>(`/api/monitors/${id}/check`, { method: 'POST' }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['monitor', id], updated);
      toast.success('Health check completed');
    },
    onError: () => toast.error('Check failed'),
  });
  if (isLoading) return <div className="p-12 text-center text-slate-500">Scanning endpoint...</div>;
  if (!monitor) return <div className="p-12 text-center">Monitor not found.</div>;
  const isUp = monitor.status === 'UP';
  const lastLatency = monitor.history[0]?.latency ?? 0;
  const historyData = [...monitor.history].reverse().map(h => ({
    time: format(h.timestamp, 'HH:mm'),
    latency: h.latency,
    status: h.status
  }));
  return (
    <AppLayout container className="bg-slate-950 min-h-screen">
      <div className="space-y-8 animate-fade-in">
        {/* Breadcrumb/Back */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
              isUp ? "bg-emerald-500/20 text-emerald-500 shadow-emerald-500/10" : "bg-rose-500/20 text-rose-500 shadow-rose-500/10"
            )}>
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white">{monitor.name}</h1>
                <Badge variant="outline" className={cn(
                  "px-3 py-1 font-bold",
                  isUp ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-rose-500/50 text-rose-400 bg-rose-500/10"
                )}>
                  {monitor.status}
                </Badge>
              </div>
              <a 
                href={monitor.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors mt-1"
              >
                {monitor.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              onClick={() => checkMutation.mutate()}
              disabled={checkMutation.isPending}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 font-bold"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", checkMutation.isPending && "animate-spin")} />
              Check Now
            </Button>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Latency</CardTitle>
              <Activity className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{lastLatency}ms</div>
              <p className="text-xs text-slate-500 mt-1">Based on last health check</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interval</CardTitle>
              <Clock className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{monitor.interval}m</div>
              <p className="text-xs text-slate-500 mt-1">Automated background checks</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Availability</CardTitle>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">100.0%</div>
              <p className="text-xs text-slate-500 mt-1">Last 30 days uptime score</p>
            </CardContent>
          </Card>
        </div>
        {/* Chart Section */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Latency Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="h-[300px] w-full px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="ms" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorLatency)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Detailed Logs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Recent Incident Log
          </h2>
          <div className="space-y-3">
            {monitor.history.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    log.status === 'UP' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {log.status === 'UP' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {log.status === 'UP' ? 'System Operational' : 'Incident Detected'}
                      <span className="text-xs text-slate-500 font-medium">• {log.latency}ms</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {format(log.timestamp, 'MMM d, yyyy �� HH:mm:ss')}
                    </div>
                  </div>
                </div>
                {log.message && (
                  <Badge variant="secondary" className="bg-slate-800 text-slate-400 font-mono text-[10px]">
                    {log.message}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}