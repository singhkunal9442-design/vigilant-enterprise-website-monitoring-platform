import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster, toast } from '@/components/ui/sonner';
export function HomePage() {
  const navigate = useNavigate();
  const handleLogin = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Authenticating with Google...',
        success: () => {
          localStorage.setItem('auth_token', 'mock_token_' + Date.now());
          navigate('/dashboard');
          return 'Welcome back, Commander.';
        },
        error: 'Authentication failed',
      }
    );
  };
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="absolute inset-0 dark:bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)] bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.02),transparent_50%)]" />
      <ThemeToggle className="absolute top-6 right-6" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 animate-fade-in shadow-comfort">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Status: All Nodes Operational
          </div>
          {/* Hero Content */}
          <div className="space-y-6 max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight leading-[0.9] animate-slide-up text-primary">
              VIGILANT <span className="text-emerald-500 dark:text-emerald-400">MONITOR</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty animate-fade-in [animation-delay:200ms] font-medium">
              Precision-engineered uptime detection for the modern web.
              Enterprise-grade health checks delivered with minimalist elegance.
            </p>
          </div>
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in [animation-delay:400ms]">
            <Button
              size="lg"
              onClick={handleLogin}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-7 text-lg font-black shadow-lg shadow-emerald-500/20 transition-comfort hover:scale-105"
            >
              Sign in with Google
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
            <Button variant="outline" size="lg" className="text-muted-foreground hover:text-foreground px-10 py-7 text-lg border-border hover:bg-secondary font-bold">
              View Public Status
            </Button>
          </div>
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-24 animate-fade-in [animation-delay:600ms]">
            {[
              { icon: Zap, title: "1ms Accuracy", desc: "Sub-second resolution on latency spikes and downtime events." },
              { icon: Shield, title: "Global Nodes", desc: "Multi-vector health checks from edge locations worldwide." },
              { icon: Bell, title: "Instant Alerts", desc: "Zero-latency notifications via Slack, Discord, or SMS." }
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-3xl bg-card border border-border shadow-comfort group hover:border-emerald-500/20 transition-comfort text-left">
                <f.icon className="w-12 h-12 text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-xl font-black mb-3 text-primary">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="absolute bottom-10 left-0 right-0 text-center text-muted-foreground text-xs font-mono uppercase tracking-widest opacity-60">
        &copy; {new Date().getFullYear()} Vigilant Monitor. Built for the mission-critical web.
      </footer>
      <Toaster richColors position="top-center" />
    </div>
  );
}