"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ShieldCheck, Loader2, AlertCircle, ChevronLeft, Lock, Mail } from "lucide-react";

export function AdminLogin({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) throw authError;

      // 2. SUPER ADMIN BYPASS: If it's you, skip the database role check
      if (cleanEmail === 'lakruwanshashika21@gmail.com') {
        onNavigate('admin');
        return;
      }

      // 3. Standard Verify Admin Role in the profiles table for other staff
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error("Access denied. Authorized personnel only.");
      }

      // 4. Success - Navigate to Dashboard
      onNavigate('admin');
    } catch (err: any) {
      // Handle the "Status 500" or RLS errors gracefully
      if (err.message?.includes('500') || err.code === 'PGRST301') {
        setError("Server Sync Error. If you are the Super Admin, please refresh and try once more.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your admin email first.");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });
      if (error) throw error;
      alert("Admin recovery link sent to your inbox.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 relative">
      <Button 
        variant="ghost" 
        className="absolute top-8 left-8 gap-2 font-bold text-zinc-500 hover:text-slate-900 transition-colors"
        onClick={() => onNavigate('home')}
      >
        <ChevronLeft size={18} /> Exit Portal
      </Button>

      <Card className="w-full max-w-md rounded-[2.5rem] shadow-2xl border-none bg-white overflow-hidden">
        <div className="h-3 bg-slate-900 w-full" />
        
        <CardHeader className="pt-10 pb-6 text-center">
          <div className="size-20 bg-slate-900/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-slate-900 size-12" />
          </div>
          <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">
            Admin Login
          </CardTitle>
          <CardDescription className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest mt-2">
            Secure Infrastructure Access
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-12">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest ml-1 text-zinc-400">
                Admin Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <Input 
                  type="email" 
                  placeholder="admin@logic.com" 
                  className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none focus-visible:ring-2 ring-slate-900 transition-all text-base" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Password
                </Label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black text-slate-900 hover:underline uppercase tracking-tighter transition-all"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending..." : "Recover Key?"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none focus-visible:ring-2 ring-slate-900 transition-all text-base" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="size-5 mt-0.5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-xl shadow-xl shadow-slate-200 mt-4 active:scale-95 transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin size-5" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify & Enter"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">
              Authorized Personnel Only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}