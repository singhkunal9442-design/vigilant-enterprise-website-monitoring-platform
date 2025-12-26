import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import type { Monitor } from '@shared/types';
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  url: z.string().url('Please enter a valid URL (include http/https)'),
  interval: z.string(),
});
type FormValues = z.infer<typeof formSchema>;
interface MonitorFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monitor?: Monitor | null;
}
export function MonitorFormDrawer({ open, onOpenChange, monitor }: MonitorFormDrawerProps) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: '',
      interval: '5',
    },
  });
  useEffect(() => {
    if (monitor && open) {
      form.reset({
        name: monitor.name,
        url: monitor.url,
        interval: monitor.interval.toString(),
      });
    } else if (!monitor && open) {
      form.reset({
        name: '',
        url: '',
        interval: '5',
      });
    }
  }, [monitor, open, form]);
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        interval: parseInt(values.interval, 10),
      };
      const url = monitor ? `/api/monitors/${monitor.id}` : '/api/monitors';
      const method = monitor ? 'PUT' : 'POST';
      return api(url, {
        method,
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      if (monitor) {
        queryClient.invalidateQueries({ queryKey: ['monitor', monitor.id] });
      }
      toast.success(monitor ? 'Monitor updated' : 'Monitor established');
      onOpenChange(false);
      form.reset();
    },
    onError: (err: any) => toast.error(err.message),
  });
  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-950 border-slate-800 text-slate-50 sm:max-w-md">
        <SheetHeader className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <SheetTitle className="text-2xl font-black">{monitor ? 'Edit Node' : 'New Node'}</SheetTitle>
          <SheetDescription className="text-slate-400">
            {monitor ? 'Update monitoring parameters for this endpoint.' : 'Configure a new endpoint for continuous health monitoring.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Node Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Production API" className="bg-slate-900 border-slate-800" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Endpoint URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/health" className="bg-slate-900 border-slate-800" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Check Interval</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="1">1 minute (Real-time)</SelectItem>
                      <SelectItem value="5">5 minutes (Standard)</SelectItem>
                      <SelectItem value="15">15 minutes (Relaxed)</SelectItem>
                      <SelectItem value="60">60 minutes (Hourly)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Processing...' : (monitor ? 'Save Changes' : 'Deploy Monitor')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-slate-500 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}