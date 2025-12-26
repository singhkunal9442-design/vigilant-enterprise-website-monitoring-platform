import React from "react";
import { LayoutGrid, BarChart2, ShieldCheck, LifeBuoy, Terminal, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  return (
    <Sidebar className="bg-slate-950 border-slate-900">
      <SidebarHeader className="bg-slate-950 border-slate-900">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-white uppercase">Vigilant</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-slate-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-bold px-4 mb-2">Operations</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/dashboard"} className="hover:bg-slate-900 transition-colors">
                <Link to="/dashboard" className="flex items-center gap-3">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="font-medium">Mission Control</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/reports"} className="hover:bg-slate-900 transition-colors">
                <Link to="/reports" className="flex items-center gap-3">
                  <BarChart2 className="w-4 h-4" />
                  <span className="font-medium">Analytics Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="bg-slate-900" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-bold px-4 mb-2">Support</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton asChild className="hover:bg-slate-900 transition-colors">
                <a href="#" className="flex items-center gap-3">
                  <Terminal className="w-4 h-4" />
                  <span className="font-medium">API Logs</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="hover:bg-slate-900 transition-colors">
                <a href="#" className="flex items-center gap-3">
                  <LifeBuoy className="w-4 h-4" />
                  <span className="font-medium">Documentation</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="hover:bg-slate-900 transition-colors">
                <a href="#" className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Organization</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-slate-950 p-4 border-t border-slate-900">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Cluster v1.0.4-Stable
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}