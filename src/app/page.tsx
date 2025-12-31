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
  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');

  // --- GLOBAL AUTH & RECOVERY DETECTOR ---
  useEffect(() => {
    // 1. Immediate check for the recovery hash in URL on page load
    if (window.location.hash.includes("type=recovery")) {
      setCurrentPage("reset-password");
    }

    // 2. Listen for Supabase Auth Events (The most reliable method)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If Supabase detects a recovery link, immediately switch to the reset page
      if (event === "PASSWORD_RECOVERY") {
        setCurrentPage("reset-password");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Run only once on mount

  // Navigation handler
  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Public Landing Page */}
      {currentPage === 'home' && (
        <PublicHomepage onNavigate={handleNavigation} />
      )}
      
      {/* 2. Student Login Page */}
      {currentPage === 'student' && (
        <StudentLogin onNavigate={handleNavigation} />
      )}

      {/* 3. Password Reset Page */}
      {currentPage === 'reset-password' && (
        <ResetPassword onNavigate={handleNavigation} />
      )}

      {/* 4. Admin Login Gateway */}
      {currentPage === 'admin-login' && (
        <AdminLogin onNavigate={handleNavigation} />
      )}
      
      {/* 5. Student Private Dashboard */}
      {currentPage === 'student-dashboard' && (
        <StudentDashboard onNavigate={handleNavigation} />
      )}
      
      {/* 6. Admin Private Console */}
      {currentPage === 'admin' && (
        <AdminDashboard onNavigate={handleNavigation} />
      )}
    </div>
  );
}