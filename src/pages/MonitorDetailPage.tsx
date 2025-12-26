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
  if (isLoading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Scanning endpoint...</div>;
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
    <AppLayout container className="bg-background min-h-screen">
      <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground -ml-2 font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-secondary border-border text-muted-foreground hover:text-foreground font-bold shadow-comfort"
              onClick={() => setIsEditDrawerOpen(true)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-secondary border-border text-rose-500 hover:bg-rose-500/10 font-bold shadow-comfort">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-popover border-border text-foreground">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-black text-xl">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground font-medium">
                    This will permanently delete the monitor for {monitor.url} and all history data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary text-foreground border-border font-bold">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-rose-600 text-white hover:bg-rose-500 font-bold" onClick={() => deleteMutation.mutate()}>Delete Node</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-10 rounded-4xl bg-card border border-border shadow-comfort">
          <div className="flex items-center gap-6">
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-comfort",
              isUp ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5" : "bg-rose-500/10 text-rose-500 shadow-rose-500/5"
            )}>
              <Globe className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">{monitor.name}</h1>
                <Badge variant="outline" className={cn(
                  "px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-xl",
                  isUp ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-rose-500/30 text-rose-600 bg-rose-500/5"
                )}>
                  {monitor.status}
                </Badge>
              </div>
              <a href={monitor.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald-500 flex items-center gap-2 transition-colors font-mono font-bold text-sm">
                {monitor.url} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <Button
              variant="outline"
              onClick={() => setSimulateFailure(!simulateFailure)}
              className={cn(
                "font-black text-xs uppercase tracking-widest px-6 transition-comfort shadow-comfort h-12",
                simulateFailure ? "bg-rose-500/20 text-rose-500 border-rose-500/40" : "bg-secondary border-border text-muted-foreground"
              )}
            >
              <ZapOff className="w-4 h-4 mr-2" />
              {simulateFailure ? "Failure Mode ACTIVE" : "Simulate Outage"}
            </Button>
            <Button
              onClick={() => checkMutation.mutate()}
              disabled={checkMutation.isPending}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 h-12 shadow-lg shadow-emerald-500/10 transition-comfort"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", checkMutation.isPending && "animate-spin")} />
              Manual Sync
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Last Latency", value: `${lastLatency}ms`, icon: Activity, desc: "From most recent check" },
            { title: "Check Interval", value: `${monitor.interval}m`, icon: Clock, desc: "Continuous heartbeat" },
            { title: "Uptime (Session)", value: `${uptimePercentage}%`, icon: ShieldCheck, desc: "Health ratio" }
          ].map((stat, i) => (
            <Card key={i} className="bg-card border-border shadow-comfort p-4">
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</CardTitle>
                <stat.icon className="w-5 h-5 text-emerald-500 opacity-60" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground mt-2 font-bold tracking-tight">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card border-border shadow-comfort overflow-hidden">
          <CardHeader className="p-8 border-b border-border/40">
            <CardTitle className="text-xl font-black tracking-tight">Telemetry Analytics</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-10">
            <div className="h-[350px] w-full px-2">
              {historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                    <XAxis dataKey="time" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} unit="ms" tickMargin={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-comfort)' }}
                      labelStyle={{ fontWeight: 'bold', color: 'var(--foreground)', marginBottom: '4px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorLatency)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground font-bold italic">Waiting for telemetry logs...</div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6 pb-12">
          <h2 className="text-2xl font-black flex items-center gap-3 text-foreground tracking-tight">
            <Activity className="w-6 h-6 text-emerald-500" />
            System Audit Log
          </h2>
          <div className="space-y-4">
            {monitor.history.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-6 rounded-3xl bg-card border border-border hover:bg-accent/50 transition-comfort shadow-comfort">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-comfort",
                    log.status === 'UP' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {log.status === 'UP' ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="font-black text-foreground flex items-center gap-3">
                      {log.status === 'UP' ? 'Pulse Authenticated' : 'Endpoint Anomaly'}
                      <span className="text-xs text-muted-foreground font-bold font-mono tracking-tighter bg-secondary px-2 py-0.5 rounded-lg">{log.latency}ms</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-1 font-bold">
                      {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>
                </div>
                {log.message && (
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground font-mono text-[9px] py-1.5 px-4 border border-border rounded-lg uppercase tracking-wider font-black">
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