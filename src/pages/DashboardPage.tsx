import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, Search, Filter, RefreshCw, BarChart2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MonitorCard } from '@/components/monitor-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonitorFormDrawer } from '@/components/monitor-form-drawer';
import { api } from '@/lib/api-client';
import type { Monitor } from '@shared/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export default function DashboardPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: monitors, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['monitors'],
    queryFn: () => api<Monitor[]>('/api/monitors'),
    refetchInterval: 60000,
  });
  const filteredMonitors = useMemo(() => {
    if (!monitors) return [];
    return monitors.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [monitors, searchQuery]);
  const handleCardClick = (id: string) => {
    navigate(`/monitors/${id}`);
  };
  const handleSyncAll = async () => {
    toast.promise(api('/api/monitors/sync-all', { method: 'POST' }), {
      loading: 'Initiating global cluster sync...',
      success: () => {
        refetch();
        return 'Cluster telemetry synchronized.';
      },
      error: 'Sync operation failed'
    });
  };

  return (
    <AppLayout container className="bg-background min-h-screen">
      <div className="space-y-12 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Engine: Active
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight leading-none">Mission Control</h1>
            <p className="text-muted-foreground font-bold text-sm tracking-tight">Monitoring {monitors?.length || 0} active cluster nodes.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="bg-secondary border-border text-muted-foreground hover:text-foreground font-bold shadow-comfort"
              onClick={() => navigate('/reports')}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Reports
            </Button>
            <Button
              variant="outline"
              className="bg-secondary border-border hover:bg-accent text-muted-foreground font-bold shadow-comfort"
              onClick={handleSyncAll}
              disabled={isFetching}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin text-emerald-500")} />
              Sync All
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 shadow-lg shadow-emerald-500/10 transition-comfort"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Node
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-secondary/30 border border-border/50 rounded-2xl shadow-comfort">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter nodes by name or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-transparent border-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground font-medium"
            />
          </div>
          <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground font-bold">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="hidden sm:block h-8 w-[1px] bg-border/50" />
          <Button variant="ghost" size="icon" className="text-emerald-500 bg-emerald-500/10">
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-secondary animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMonitors.map((monitor) => (
              <MonitorCard
                key={monitor.id}
                monitor={monitor}
                onClick={() => handleCardClick(monitor.id)}
              />
            ))}
            <div
              onClick={() => setIsDrawerOpen(true)}
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-3xl group hover:border-emerald-500/40 transition-comfort cursor-pointer min-h-[220px] bg-secondary/10 hover:bg-emerald-500/[0.02] shadow-comfort"
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors border border-border shadow-comfort">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-emerald-500 transition-transform duration-500 group-hover:rotate-90" />
              </div>
              <p className="text-sm font-black text-muted-foreground group-hover:text-foreground tracking-tight">Deploy New Node</p>
              <p className="text-xs text-muted-foreground/60 mt-2 text-center font-medium">Start tracking uptime in seconds</p>
            </div>
          </div>
        )}
        <MonitorFormDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      </div>
    </AppLayout>
  );
}