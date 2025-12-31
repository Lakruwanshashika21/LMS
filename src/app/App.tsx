"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Path to your supabase.ts client
import { PublicHomepage } from "./components/PublicHomepage";
import { StudentDashboard } from "./components/StudentDashboard";
import { AdminDashboard } from "./components/AdminDashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a user is already logged in on refresh
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Here you would check the 'role' column in your 'profiles' table
        // For now, let's keep it simple
        console.log("Logged in as:", session.user.email);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading EduPlatform...</div>;

  return (
    <div className="min-h-screen transition-colors">
      <main>
        {currentPage === 'home' && <PublicHomepage onNavigate={setCurrentPage} />}
        {currentPage === 'student' && <StudentDashboard onNavigate={setCurrentPage} />}
        {currentPage === 'admin' && <AdminDashboard onNavigate={setCurrentPage} />}
      </main>
    </div>
  );
}