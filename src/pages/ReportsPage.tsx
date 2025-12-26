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
      { name: 'PENDING', value: pendingCount, color: '#64748b' }
    ];
    return { upCount, downCount, totalChecks, avgUptime, latencyData, distribution };
  }, [monitors]);
  if (isLoading) return <div className="p-12 text-center text-slate-500">Generating analytics...</div>;
  if (!stats) return <div className="p-12 text-center">No monitors found to report on.</div>;
  return (
    <AppLayout container className="bg-slate-950 min-h-screen">
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Analytics Reports</h1>
            <p className="text-slate-400 font-medium">System-wide performance overview.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="bg-slate-900 border-slate-800 text-slate-400">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase">Avg System Uptime</CardTitle>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stats.avgUptime}%</div>
              <p className="text-xs text-slate-500 mt-1">Global availability score</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase">Total Heartbeats</CardTitle>
              <Activity className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stats.totalChecks}</div>
              <p className="text-xs text-slate-500 mt-1">Checks performed across all nodes</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase">Unstable Nodes</CardTitle>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-rose-500">{stats.downCount}</div>
              <p className="text-xs text-slate-500 mt-1">Endpoints currently down</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle>Latency Comparison (ms)</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Bar dataKey="latency">
                    {stats.latencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'UP' ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 text-xs font-bold">
                {stats.distribution.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-400">{d.name}: {d.value}</span>
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