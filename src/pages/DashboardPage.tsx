import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, Search, Filter, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MonitorCard } from '@/components/monitor-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonitorFormDrawer } from '@/components/monitor-form-drawer';
import { api } from '@/lib/api-client';
import type { Monitor } from '@shared/types';
export default function DashboardPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { data: monitors, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['monitors'],
    queryFn: () => api<Monitor[]>('/api/monitors'),
    refetchInterval: 30000, // Refresh every 30s for a 'live' feel
  });
  const handleCardClick = (id: string) => {
    navigate(`/monitors/${id}`);
  };
  return (
    <AppLayout container className="bg-slate-950 min-h-screen">
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Mission Control</h1>
            <p className="text-slate-400 font-medium">Monitoring {monitors?.length || 0} production endpoints.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={isFetching ? "w-4 h-4 animate-spin text-emerald-500" : "w-4 h-4"} />
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-lg shadow-emerald-500/10"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Monitor
            </Button>
          </div>
        </div>
        {/* Filters/Search Bar */}
        <div className="flex items-center gap-4 p-2 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search monitors..."
              className="pl-10 bg-transparent border-none focus-visible:ring-0 text-slate-200 placeholder:text-slate-600"
            />
          </div>
          <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-400 hover:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />
          <Button variant="ghost" size="icon" className="text-emerald-500 bg-emerald-500/5">
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitors?.map((monitor) => (
              <MonitorCard 
                key={monitor.id} 
                monitor={monitor} 
                onClick={() => handleCardClick(monitor.id)}
              />
            ))}
            {/* Empty State / Add New Card */}
            <div 
              onClick={() => setIsDrawerOpen(true)}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-3xl group hover:border-emerald-500/30 transition-all duration-300 cursor-pointer min-h-[190px] bg-slate-900/20 hover:bg-emerald-500/[0.02]"
            >
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors border border-slate-800">
                <Plus className="w-6 h-6 text-slate-500 group-hover:text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-slate-500 group-hover:text-slate-300">Register New Node</p>
              <p className="text-xs text-slate-600 mt-1">Start tracking uptime in seconds</p>
            </div>
          </div>
        )}
        {/* Monitor Creation Drawer */}
        <MonitorFormDrawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen} 
        />
      </div>
    </AppLayout>
  );
}