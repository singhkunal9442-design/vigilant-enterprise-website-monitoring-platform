import React, { useState } from 'react';
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
  ExternalLink,
  Edit2,
  Trash2,
  ZapOff
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MonitorFormDrawer } from '@/components/monitor-form-drawer';
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
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const { data: monitor, isLoading } = useQuery({
    queryKey: ['monitor', id],
    queryFn: () => api<Monitor>(`/api/monitors/${id}`),
    enabled: !!id,
  });
  const checkMutation = useMutation({
    mutationFn: () => api<Monitor>(`/api/monitors/${id}/check?simulate_failure=${simulateFailure}`, { method: 'POST' }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['monitor', id], updated);
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      toast.success(simulateFailure ? 'Failure simulation recorded' : 'Health check completed');
    },
    onError: () => toast.error('Check failed'),
  });
  const deleteMutation = useMutation({
    mutationFn: () => api(`/api/monitors/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      toast.success('Monitor removed');
      navigate('/dashboard');
    },
    onError: (err: any) => toast.error(err.message),
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
  const uptimePercentage = monitor.history.length > 0 
    ? ((monitor.history.filter(h => h.status === 'UP').length / monitor.history.length) * 100).toFixed(1)
    : "100.0";
  return (
    <AppLayout container className="bg-slate-950 min-h-screen">
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-white -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              onClick={() => setIsEditDrawerOpen(true)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-rose-500 hover:bg-rose-500/10">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-50">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This will permanently delete the monitor for {monitor.url} and all history data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 text-slate-50 border-slate-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-rose-600 text-white hover:bg-rose-500" onClick={() => deleteMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
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
              <a href={monitor.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors mt-1">
                {monitor.url} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Button
              variant="outline"
              onClick={() => setSimulateFailure(!simulateFailure)}
              className={cn(
                "font-bold transition-all",
                simulateFailure ? "bg-rose-500/20 text-rose-500 border-rose-500/50" : "bg-slate-900 border-slate-800 text-slate-500"
              )}
            >
              <ZapOff className="w-4 h-4 mr-2" />
              {simulateFailure ? "Failure Mode" : "Simulate Down"}
            </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Latency</CardTitle>
              <Activity className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{lastLatency}ms</div>
              <p className="text-xs text-slate-500 mt-1">From most recent check</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interval</CardTitle>
              <Clock className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{monitor.interval}m</div>
              <p className="text-xs text-slate-500 mt-1">Continuous heartbeat</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uptime (Session)</CardTitle>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{uptimePercentage}%</div>
              <p className="text-xs text-slate-500 mt-1">Health ratio in current history</p>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="h-[300px] w-full px-2">
              {historyData.length > 0 ? (
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
                    <Area type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic">No telemetry data available yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            System Events
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
                      {log.status === 'UP' ? 'Pulse Success' : 'Endpoint Alert'}
                      <span className="text-xs text-slate-500 font-medium">• {log.latency}ms</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>
                </div>
                {log.message && (
                  <Badge variant="secondary" className="bg-slate-800 text-slate-400 font-mono text-[10px] py-1 px-3 border border-slate-700">
                    {log.message}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <MonitorFormDrawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen} monitor={monitor} />
    </AppLayout>
  );
}