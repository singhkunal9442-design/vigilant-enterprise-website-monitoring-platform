import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { Monitor } from '@shared/types';
import { ShieldCheck, Activity, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
export default function ReportsPage() {
  const navigate = useNavigate();
  const { data: monitors, isLoading } = useQuery({
    queryKey: ['monitors'],
    queryFn: () => api<Monitor[]>('/api/monitors'),
  });
  const stats = useMemo(() => {
    if (!monitors || monitors.length === 0) return null;
    const upCount = monitors.filter(m => m.status === 'UP').length;
    const downCount = monitors.filter(m => m.status === 'DOWN').length;
    const pendingCount = monitors.filter(m => m.status === 'PENDING').length;
    const latencyData = monitors.map(m => ({
      name: m.name,
      latency: m.history[0]?.latency || 0,
      status: m.status
    }));
    const totalChecks = monitors.reduce((acc, m) => acc + m.history.length, 0);
    const avgUptime = (monitors.reduce((acc, m) => {
      const up = m.history.filter(h => h.status === 'UP').length;
      return acc + (m.history.length > 0 ? (up / m.history.length) : 1);
    }, 0) / monitors.length * 100).toFixed(1);
    const distribution = [
      { name: 'UP', value: upCount, color: '#10b981' },
      { name: 'DOWN', value: downCount, color: '#f43f5e' },
      { name: 'PENDING', value: pendingCount, color: '#94a3b8' }
    ];
    return { upCount, downCount, totalChecks, avgUptime, latencyData, distribution };
  }, [monitors]);
  if (isLoading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Generating analytics...</div>;
  if (!stats) return <div className="p-12 text-center font-bold text-muted-foreground">No telemetry data found for reporting.</div>;
  return (
    <AppLayout container className="bg-background min-h-screen">
      <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tight leading-none">Analytics Reports</h1>
            <p className="text-muted-foreground font-bold text-sm tracking-tight">Cluster-wide performance telemetry.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="bg-secondary border-border text-muted-foreground font-bold shadow-comfort">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Base
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Avg System Uptime", value: `${stats.avgUptime}%`, icon: ShieldCheck, color: "text-emerald-500", desc: "Global availability score" },
            { title: "Total Heartbeats", value: stats.totalChecks, icon: Activity, color: "text-emerald-500", desc: "Checks across all nodes" },
            { title: "Unstable Nodes", value: stats.downCount, icon: AlertTriangle, color: "text-rose-500", desc: "Currently offline" }
          ].map((kpi, i) => (
            <Card key={i} className="bg-card border-border shadow-comfort p-4">
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{kpi.title}</CardTitle>
                <kpi.icon className={kpi.color + " w-5 h-5"} />
              </CardHeader>
              <CardContent className="pt-0">
                <div className={"text-4xl font-black tracking-tighter " + (kpi.color === "text-rose-500" ? "text-rose-500" : "text-foreground")}>{kpi.value}</div>
                <p className="text-[11px] text-muted-foreground mt-2 font-bold tracking-tight">{kpi.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card border-border shadow-comfort overflow-hidden">
            <CardHeader className="p-8 border-b border-border/40">
              <CardTitle className="text-lg font-black tracking-tight uppercase tracking-widest text-xs opacity-60">Latency Comparison (ms)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} unit="ms" />
                  <Tooltip
                    formatter={(value: number) => [`${value}ms`, 'Latency']}
                    contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-comfort-value)' }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--foreground)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="latency" radius={[6, 6, 0, 0]} barSize={40}>
                    {stats.latencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'UP' ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-comfort overflow-hidden">
            <CardHeader className="p-8 border-b border-border/40">
              <CardTitle className="text-lg font-black tracking-tight uppercase tracking-widest text-xs opacity-60">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-8 flex flex-col">
               <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-comfort-value)' }}
                      labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
               </div>
              <div className="flex justify-center gap-8 text-[11px] font-black uppercase tracking-widest pt-4">
                {stats.distribution.map(d => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}