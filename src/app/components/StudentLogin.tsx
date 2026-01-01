"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { GraduationCap, Lock, Mail, ChevronLeft, Loader2 } from "lucide-react";

export function StudentLogin({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // --- LOGIN LOGIC ---
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // 2. Fetch user profile to verify role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_paid, is_suspended') // Add these fields
        .eq('id', data.user.id)
        .single();

      if (profile?.is_suspended) {
        await supabase.auth.signOut();
        return alert("Account Suspended. Contact Admin.");
      }

      // Optional: Redirect specifically based on paid status
      onNavigate('student-dashboard');
      
    } catch (error: any) {
      alert("Login Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // --- FORGOT PASSWORD LOGIC ---
  async function handleForgotPassword() {
    if (!email) {
      alert("Please enter your email address first so we can send a reset link.");
      return;
    }
    
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });

      if (error) throw error;
      alert("Verification email sent! Please check your inbox to reset your password.");
      
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 relative">
      {/* Back to Homepage Link */}
      <Button 
        variant="ghost" 
        className="absolute top-8 left-8 gap-2 font-bold text-zinc-500 hover:text-primary transition-colors"
        onClick={() => onNavigate('home')}
      >
        <ChevronLeft size={18} /> Back to Homepage
      </Button>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900">
        {/* Decorative Top Bar */}
        <div className="h-3 bg-primary w-full" />
        
        <CardHeader className="pt-10 pb-6 text-center">
          <div className="size-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="size-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">
            Student Login
          </CardTitle>
          <CardDescription className="text-zinc-500 font-medium text-lg mt-2">
            Access your recordings and materials.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-12 px-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest ml-1 text-zinc-400">
                Registered Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <Input 
                  type="email" 
                  placeholder="student@example.com" 
                  className="pl-12 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 ring-primary transition-all text-base" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Password
                </Label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter transition-all"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Processing..." : "Forgot Key?"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 ring-primary transition-all text-base" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-15 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 mt-6 active:scale-95 transition-transform"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin size-5" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Enter Dashboard"
              )}
            </Button>
          </form>

          {/* Registration Hint */}
          <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 font-medium">
              Don't have an account yet? <br/>
              <span className="text-primary font-bold">Contact the Administrator to get registered.</span>
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer Branding */}
      <div className="mt-12 flex flex-col items-center gap-2">
        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">
          Secure Access Protocol v2.5
        </p>
        <p className="text-[9px] text-zinc-300 uppercase font-bold">© 2025 Education Platform Design</p>
      </div>
    </div>
  );
}