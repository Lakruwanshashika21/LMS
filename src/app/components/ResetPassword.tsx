"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

export function ResetPassword({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  // --- CRITICAL FIX: Robust session detection ---
  useEffect(() => {
    let mounted = true;

    async function verifyRecovery() {
      // 1. Brief delay to allow the URL hash to be parsed by the client
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      const { data: { session } } = await supabase.auth.getSession();

      if (mounted) {
        // Check if session exists OR if the URL hash explicitly mentions recovery
        const isRecoveryHash = window.location.hash.includes("type=recovery");
        
        if (session || isRecoveryHash) {
          setSessionValid(true);
        } else {
          setSessionValid(false);
        }
        setVerifying(false);
      }
    }

    verifyRecovery();

    // 2. Listen for the specific recovery event in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionValid(true);
        setVerifying(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      return alert("Security requirement: Password must be at least 6 characters.");
    }

    if (newPassword !== confirmPassword) {
      return alert("Validation failed: Passwords do not match!");
    }
    
    setLoading(true);

    try {
      // This function strictly requires the active recovery session
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
      // Wait for user to read success message then redirect
      setTimeout(() => onNavigate('home'), 3000); 
    } catch (error: any) {
      alert("System Error: " + error.message + " (Please try requesting a new link from the login page)");
    } finally {
      setLoading(false);
    }
  }

  // State 1: Verifying the link validity
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin size-12 text-primary opacity-20" />
          <p className="font-black uppercase tracking-[0.2em] text-[10px] text-zinc-400 italic animate-pulse">
            Authenticating Security Token...
          </p>
        </div>
      </div>
    );
  }

  // State 2: Invalid or expired session
  if (!sessionValid && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <Card className="max-w-md w-full text-center p-12 rounded-[3rem] shadow-2xl border-none">
          <ShieldAlert className="size-20 text-rose-500 mx-auto mb-6 opacity-80" />
          <CardTitle className="text-3xl font-black uppercase tracking-tight italic">Link Expired</CardTitle>
          <CardDescription className="mt-4 font-medium text-zinc-500 leading-relaxed">
            The security token has either been used or timed out. For your security, reset links are single-use.
          </CardDescription>
          <Button className="mt-10 w-full rounded-2xl h-16 font-black uppercase tracking-widest text-xs shadow-lg" onClick={() => onNavigate('student')}>
            Request New Link
          </Button>
        </Card>
      </div>
    );
  }

  // State 3: Password Update Successful
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <Card className="max-w-md w-full text-center p-12 rounded-[3rem] shadow-2xl border-none">
          <div className="size-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="size-14 text-emerald-500" />
          </div>
          <CardTitle className="text-4xl font-black uppercase italic tracking-tighter">Access Restored</CardTitle>
          <p className="text-zinc-500 font-bold mt-4 leading-relaxed uppercase text-[10px] tracking-widest">
            Your credentials have been updated. <br/> Initializing portal redirection...
          </p>
        </Card>
      </div>
    );
  }

  // State 4: Reset Form
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-[3rem] shadow-2xl border-none bg-white overflow-hidden">
        <div className="h-4 bg-primary w-full" />
        <CardHeader className="pt-14 px-12 text-center">
          <div className="size-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="text-primary size-10" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase italic text-zinc-900 leading-none">
            Secure Portal
          </CardTitle>
          <CardDescription className="text-zinc-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-4 italic">
            Define your new access key
          </CardDescription>
        </CardHeader>
        <CardContent className="px-12 pb-16">
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-zinc-400">New Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="h-16 rounded-[1.25rem] bg-zinc-50 border-none px-6 focus-visible:ring-2 ring-primary transition-all text-lg"
                required 
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-zinc-400">Verify Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="h-16 rounded-[1.25rem] bg-zinc-50 border-none px-6 focus-visible:ring-2 ring-primary transition-all text-lg"
                required 
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-16 rounded-[1.25rem] font-black text-xl shadow-xl shadow-primary/20 mt-6 active:scale-[0.98] transition-all bg-primary text-white" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin size-6" />
                  <span className="uppercase text-xs tracking-widest">Applying...</span>
                </div>
              ) : (
                "Update Access"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}