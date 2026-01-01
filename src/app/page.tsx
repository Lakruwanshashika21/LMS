"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Relative imports
import { PublicHomepage } from "./components/PublicHomepage";
import { StudentDashboard } from "./components/StudentDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { StudentLogin } from "./components/StudentLogin";
import { ResetPassword } from "./components/ResetPassword";

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Check for recovery hash in URL
      if (window.location.hash.includes("type=recovery")) {
        setCurrentPage("reset-password");
        setIsLoading(false);
        return;
      }

      // 2. Deep check for an existing session and role
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // We check BOTH app_metadata and user_metadata for the role
        const role = session.user.app_metadata?.role || session.user.user_metadata?.role;
        
        if (role === 'admin') {
          setCurrentPage('admin');
        } else if (role === 'student') {
          setCurrentPage('student-dashboard');
        } else {
          // Fallback if no role is found yet
          setCurrentPage('home');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // 3. Listen for Supabase Auth Events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setCurrentPage("reset-password");
      } else if (event === "SIGNED_IN" && session) {
        const role = session.user.app_metadata?.role || session.user.user_metadata?.role;
        setCurrentPage(role === 'admin' ? 'admin' : 'student-dashboard');
      } else if (event === "SIGNED_OUT") {
        setCurrentPage("home");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // The Loading Guard prevents the "Access Restricted" flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Syncing Logic Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentPage === 'home' && <PublicHomepage onNavigate={handleNavigation} />}
      {currentPage === 'student' && <StudentLogin onNavigate={handleNavigation} />}
      {currentPage === 'reset-password' && <ResetPassword onNavigate={handleNavigation} />}
      {currentPage === 'admin-login' && <AdminLogin onNavigate={handleNavigation} />}
      {currentPage === 'student-dashboard' && <StudentDashboard onNavigate={handleNavigation} />}
      {currentPage === 'admin' && <AdminDashboard onNavigate={handleNavigation} />}
    </div>
  );
}