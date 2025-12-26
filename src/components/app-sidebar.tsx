import React from "react";
import { LayoutGrid, BarChart2, ShieldCheck, LifeBuoy, Terminal, Settings, LogOut } from "lucide-react";
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    toast.success('Session terminated', {
      description: 'You have been securely logged out.',
    });
    navigate('/');
  };
  return (
    <Sidebar className="bg-sidebar border-sidebar-border">
      <SidebarHeader className="bg-sidebar border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground uppercase">Vigilant</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-bold px-4 mb-2">Operations</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/dashboard"} className="hover:bg-accent transition-colors">
                <Link to="/dashboard" className="flex items-center gap-3">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="font-medium">Mission Control</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/reports"} className="hover:bg-accent transition-colors">
                <Link to="/reports" className="flex items-center gap-3">
                  <BarChart2 className="w-4 h-4" />
                  <span className="font-medium">Analytics Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="bg-sidebar-border" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-bold px-4 mb-2">Support</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton asChild className="hover:bg-accent transition-colors">
                <a href="#" className="flex items-center gap-3">
                  <Terminal className="w-4 h-4" />
                  <span className="font-medium">API Logs</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="hover:bg-accent transition-colors">
                <a href="#" className="flex items-center gap-3">
                  <LifeBuoy className="w-4 h-4" />
                  <span className="font-medium">Documentation</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="hover:bg-accent transition-colors">
                <a href="#" className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Organization</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="font-bold text-xs uppercase tracking-wider">Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-2 px-3 flex items-center gap-2 text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Cluster v1.0.4-Stable
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}