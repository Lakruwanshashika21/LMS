"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

// Icons
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  School, 
  LogIn, 
  Facebook, 
  Youtube, 
  Instagram, 
  Star, 
  Bell,
  Clock,
  Images,
  Zap,
  Quote,
  Target,
  BrainCircuit,
  Linkedin,
  ChevronRight,
  ArrowUpRight,
  Mail,
  Phone,
  MessageSquare,
  Menu,
  X
} from "lucide-react";

export function PublicHomepage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]); 
  const [selectedGallery, setSelectedGallery] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) fetchRanks(selectedClassId);
  }, [selectedClassId]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: classData } = await supabase.from('classes').select('*').order('year', { ascending: false });
      if (classData && classData.length > 0) {
        setClasses(classData);
        setSelectedClassId(classData[0].id);
      }
      const { data: noticeData } = await supabase.from('notices').select('*').eq('publish_homepage', true).order('created_at', { ascending: false });
      if (noticeData) setNotices(noticeData);
      const { data: galleryData } = await supabase.from('galleries').select('*').order('created_at', { ascending: false });
      if (galleryData) setGalleries(galleryData);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRanks(classId: number) {
    try {
      const { data } = await supabase
        .from('exam_results')
        .select('*')
        .eq('class_id', classId)
        .eq('is_public', true)
        .order('marks', { ascending: false });
      if (data) {
        const uniqueLatest = data.filter((item, index, self) => 
            index === self.findIndex((t) => t.student_id === item.student_id)
        );
        setTopStudents(uniqueLatest.slice(0, 10));
      }
    } catch (error) {
      console.error("Rank fetch error:", error);
    }
  }

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Zap className="size-12 text-teal-600 animate-pulse mb-4" />
        <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 italic">Initializing Portal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-teal-100">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/logo.png" alt="Logic Logo" className="h-8 md:h-10 w-auto object-contain" />
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-black text-slate-800 tracking-tighter uppercase italic leading-none">Dilshan Uthpala</h2>
            <span className="text-[6px] md:text-[7px] font-bold text-teal-600 uppercase tracking-widest mt-1 italic">Educational Platform</span>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-2">
          <Button variant="ghost" onClick={() => onNavigate('student')} className="font-bold text-slate-600 hover:bg-slate-50 rounded-xl px-5 text-xs uppercase tracking-widest transition-all">Student Login</Button>
          <Button onClick={() => onNavigate('admin-login')} className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl px-6 text-xs uppercase tracking-widest shadow-md">Staff Portal</Button>
        </div>

        {/* Mobile Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300 md:hidden">
            <Button variant="outline" onClick={() => onNavigate('student')} className="w-full h-14 font-black uppercase text-xs tracking-widest rounded-2xl">Student Login</Button>
            <Button onClick={() => onNavigate('admin-login')} className="w-full h-14 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl">Staff Portal</Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-48 pb-16 md:pb-24 px-4 md:px-6 bg-white overflow-hidden relative border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
          <div className="space-y-6 md:space-y-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="h-px w-8 md:w-10 bg-teal-500"></div>
                <span className="text-teal-600 font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px]">Enrollment 2026 Open</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase italic text-slate-900">
               Master Your <br/> <span className="text-teal-600">Mind.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium max-w-md italic mx-auto md:mx-0">
              "Logic is not just a subject, but a way of thinking, questioning, and discovering the world."
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
               <Button size="lg" className="bg-slate-900 hover:bg-black text-white rounded-2xl px-12 font-black uppercase text-xs h-16 shadow-2xl transition-all" onClick={() => onNavigate('student')}>Begin Journey</Button>
               <a href="https://wa.me/94770224060" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="w-full rounded-2xl px-10 border-slate-200 text-slate-600 h-16 font-black uppercase text-xs hover:bg-slate-50 transition-all flex gap-2 items-center justify-center">
                    <MessageSquare size={16} /> WhatsApp
                </Button>
               </a>
            </div>
          </div>
          <div className="relative group px-6 md:px-0">
             <div className="absolute -inset-1 bg-teal-500/10 rounded-[3rem] md:rounded-[4rem] blur-2xl opacity-50"></div>
             <ImageWithFallback 
                src="/teacher-dilshan.jpg" 
                alt="Dilshan Uthpala" 
                className="rounded-[2.5rem] md:rounded-[3.5rem] border-[8px] md:border-[12px] border-white shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700 aspect-[4/5] object-cover max-w-sm md:max-w-full mx-auto" 
             />
          </div>
        </div>
      </section>

      {/* About Us & Mission */}
      <section className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
            <div className="space-y-8 md:space-y-10 text-center md:text-left">
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-teal-600 flex items-center justify-center md:justify-start gap-3">
                       <div className="h-0.5 w-8 bg-teal-600"></div> About Us
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic leading-tight">Logic with <br/> Dilshan Uthpala</h3>
                    <p className="text-slate-600 leading-relaxed text-lg md:text-xl font-medium">
                        We believe that logic is not just another subject but a way of thinking, questioning and discovering the world around us.
                    </p>
                    <p className="text-slate-500 leading-relaxed text-base md:text-lg border-l-4 border-teal-500 pl-6 py-2 italic font-medium text-left">
                        Created by a passionate law student, this logic platform helps students build a sharper mind and strengthen their reasoning.
                    </p>
                </div>
                <div className="p-8 md:p-10 bg-slate-900 rounded-[2rem] md:rounded-[3rem] text-white relative shadow-2xl border-t-8 border-teal-500 group overflow-hidden">
                    <Quote className="absolute top-6 right-6 size-12 text-teal-500/20" />
                    <p className="text-2xl md:text-3xl font-black italic tracking-tighter leading-tight uppercase relative z-10 text-left">"මොළ හදන <br/> ලොජික් පන්තිය"</p>
                </div>
            </div>

            <div className="space-y-12 md:space-y-16 py-0 md:py-12">
                <div className="flex flex-col sm:flex-row gap-6 md:gap-8 group">
                    <div className="bg-white p-5 rounded-2xl md:rounded-[2rem] shadow-xl h-fit w-fit mx-auto sm:mx-0 border border-slate-50 group-hover:bg-teal-600 transition-all duration-300">
                        <Target className="text-teal-600 group-hover:text-white size-8 md:size-10" />
                    </div>
                    <div className="space-y-2 md:space-y-3 text-center sm:text-left">
                        <h4 className="text-xl md:text-2xl font-black uppercase italic text-slate-900">Our Goal</h4>
                        <p className="text-slate-500 leading-relaxed text-base md:text-lg font-medium">
                            To simplify the subject of logic and present it to the student in a fun, intuitive and understandable way.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 md:gap-8 group">
                    <div className="bg-white p-5 rounded-2xl md:rounded-[2rem] shadow-xl h-fit w-fit mx-auto sm:mx-0 border border-slate-50 group-hover:bg-teal-600 transition-all duration-300">
                        <BrainCircuit className="text-teal-600 group-hover:text-white size-8 md:size-10" />
                    </div>
                    <div className="space-y-2 md:space-y-3 text-center sm:text-left">
                        <h4 className="text-xl md:text-2xl font-black uppercase italic text-slate-900">Our Mission</h4>
                        <p className="text-slate-500 leading-relaxed text-base md:text-lg font-medium">
                            Instead of teaching a mere subject, we instill a rational mindset and teach scientific methods with equal emphasis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Notice Board */}
      {notices.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-100 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-12 md:mb-16">
              <div className="size-10 md:size-12 bg-teal-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                 <Bell className="text-white size-5 md:size-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 italic">Notice Board</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {notices.map((n) => (
                <Card key={n.id} className="rounded-[2rem] md:rounded-[2.5rem] border-none bg-white shadow-xl p-2 transition-all hover:-translate-y-1">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-teal-50 text-teal-600 border-none font-black text-[8px] md:text-[9px] px-3 py-1 rounded-full tracking-widest">
                        {new Date(n.created_at).toLocaleDateString()}
                      </Badge>
                      <Zap size={14} className="text-teal-200" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-black uppercase italic leading-tight text-slate-800">
                      {n.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <p className="text-slate-500 font-medium leading-relaxed italic text-sm md:text-base">
                      "{n.content}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hall of Fame */}
      <section className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto text-center">
        <div className="flex flex-col items-center mb-10 md:mb-16">
            <Trophy className="text-teal-600 size-10 md:size-14 mb-4 md:size-6" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-900">Hall of Fame</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[9px] md:text-xs mt-4">Recognition of Excellence</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 mb-16 md:mb-20">
          {classes.map(c => (
            <Button 
              key={c.id} 
              variant={selectedClassId === c.id ? "default" : "outline"} 
              onClick={() => setSelectedClassId(c.id)} 
              className={`rounded-xl md:rounded-2xl font-black px-4 md:px-8 h-10 md:h-14 uppercase text-[8px] md:text-[10px] tracking-[0.2em] transition-all ${
                selectedClassId === c.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 border-slate-200'
              }`}
            >
              {c.year} {c.type}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {topStudents.length > 0 ? topStudents.map((s, i) => (
            <Card key={i} className={`rounded-[2rem] md:rounded-[3rem] border-none bg-white shadow-2xl p-6 relative transition-all hover:scale-105 ${i === 0 ? 'ring-2 ring-teal-500' : ''}`}>
              {i === 0 && <Star className="absolute -top-3 -right-3 size-10 md:size-12 text-yellow-400 fill-yellow-400" />}
              <CardHeader className="text-left p-0 pb-6 border-b border-slate-50">
                <div className={`size-12 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl mb-4 ${i === 0 ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                    {i + 1}
                </div>
                <CardTitle className="text-lg md:text-xl font-black uppercase italic truncate text-slate-800">{s.student_name}</CardTitle>
                <CardDescription className="text-[9px] md:text-[10px] font-bold uppercase truncate text-slate-400 tracking-tight">{s.school_name}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-0">
                <div className="p-5 md:p-6 bg-[#FAFBFC] rounded-[1.5rem] md:rounded-[2rem] text-center border border-slate-100">
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{s.exam_name}</p>
                    <div className="text-4xl md:text-5xl font-black text-teal-600 tracking-tighter italic">{s.marks}%</div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full py-16 text-slate-300 font-black uppercase tracking-[0.4em] italic border-4 border-dashed rounded-[2rem] md:rounded-[4rem] text-xs">
                Rankings Processing...
            </div>
          )}
        </div>
      </section>

      {/* Class Schedule */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-20 space-y-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">Class Schedule</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Dilshan Uthpala • Authorized Instructor</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {classes.map(cls => (
                    <Card key={cls.id} className="border-none rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <CardHeader className="p-8 md:p-10 pb-6">
                            <Badge className="bg-slate-900 text-white px-5 py-1.5 rounded-full mb-6 w-fit uppercase font-bold tracking-widest text-[10px]">{cls.year}</Badge>
                            <CardTitle className="text-2xl md:text-3xl font-black uppercase italic text-slate-800 leading-tight">{cls.title}</CardTitle>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 block">{cls.type}</span>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10 pt-0 space-y-5">
                            <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-slate-600"><div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Calendar size={18} className="text-teal-600"/></div> {cls.class_day}</div>
                            <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-slate-600"><div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Clock size={18} className="text-teal-600"/></div> {cls.class_time}</div>
                            <div className="flex items-center gap-4 text-xs md:text-sm font-medium text-slate-400"><div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><MapPin size={18}/></div> {cls.institute_name}</div>
                            <Button className="w-full h-14 md:h-16 mt-6 bg-slate-900 hover:bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all" onClick={() => onNavigate('student')}>Enroll Now</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-16 md:mb-20 border-l-0 sm:border-l-8 border-teal-500 pl-0 sm:pl-8 text-center sm:text-left gap-6">
          <div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-900">Visuals</h2>
            <p className="text-teal-600 font-bold uppercase tracking-widest text-xs md:text-sm mt-3">Moments from logic sessions</p>
          </div>
          <Images className="size-12 md:size-16 text-slate-200 hidden sm:block" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {galleries.map((gal) => (
            <Card key={gal.id} className="group cursor-pointer overflow-hidden rounded-[2rem] md:rounded-[3rem] border-none shadow-2xl transition-all active:scale-95" onClick={() => setSelectedGallery(gal)}>
              <div className="relative h-[22rem] md:h-[28rem] w-full">
                <img src={gal.image_urls[0]} alt={gal.name} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-1000 grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 text-white">
                  <h3 className="font-black text-xl md:text-2xl mb-1 tracking-tighter uppercase italic leading-none">{gal.name}</h3>
                  <Badge className="bg-teal-500 text-white border-none font-black text-[8px] px-3 mt-3">{gal.image_urls.length} ASSETS</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#030712] text-white pt-20 md:pt-32 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 border-b border-white/5 pb-16 md:pb-24">
            <div className="space-y-6 md:space-y-8 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                   <div className="bg-white p-2 rounded-xl"><Zap className="text-slate-950 fill-slate-950 size-5 md:size-6" /></div>
                   <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Logic</h3>
                </div>
                <p className="text-slate-400 text-base md:text-lg leading-relaxed italic font-medium">Instilling a rational mindset and simplified logic education through intuitive reasoning.</p>
                <div className="space-y-3 md:space-y-4 pt-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 text-slate-300 text-xs md:text-sm">
                        <Mail className="size-4 text-teal-500" /> dilshanuthpalalogic@gmail.com
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3 text-slate-300 text-xs md:text-sm">
                        <Phone className="size-4 text-teal-500" /> +94 77 022 4060
                    </div>
                </div>
                <div className="flex justify-center md:justify-start gap-6 pt-4">
                   <a href="https://web.facebook.com/profile.php?id=100094065144515" target="_blank" rel="noreferrer" className="bg-white/5 p-4 rounded-xl hover:bg-teal-600 transition-all"><Facebook className="size-5" /></a>
                   <a href="https://www.youtube.com/@DilshanUthpala" target="_blank" rel="noreferrer" className="bg-white/5 p-4 rounded-xl hover:bg-teal-600 transition-all"><Youtube className="size-5" /></a>
                </div>
            </div>
            
            <div className="text-center md:text-left">
                <h4 className="font-black mb-8 md:mb-10 uppercase text-slate-500 tracking-[0.4em] text-[10px]">Navigation</h4>
                <ul className="space-y-5 md:space-y-6 text-slate-300 font-bold text-xs md:text-sm uppercase tracking-widest">
                   <li onClick={() => onNavigate('home')} className="hover:text-teal-500 cursor-pointer italic">Home Portal</li>
                   <li onClick={() => onNavigate('student')} className="hover:text-teal-500 cursor-pointer italic">Student Hub</li>
                   <li onClick={() => onNavigate('admin-login')} className="hover:text-teal-500 cursor-pointer italic">Staff Hub</li>
                </ul>
            </div>

            <div className="space-y-8 md:space-y-10">
               <div className="p-8 bg-[#0B0F1A] rounded-[2rem] md:rounded-[2.5rem] border border-white/5 group hover:border-teal-500/40 transition-all shadow-2xl relative overflow-hidden">
                  <p className="text-[9px] md:text-[10px] text-teal-500 font-black uppercase tracking-widest mb-6">Developed By</p>
                  <div className="flex items-center justify-between">
                      <p className="text-2xl md:text-3xl font-black tracking-tight uppercase italic leading-none text-white">Lakruwan <br/> Shashika</p>
                      <a href="https://www.linkedin.com/in/lakruwan-shashika/" target="_blank" rel="noreferrer" className="bg-teal-600 p-3 rounded-xl text-white hover:bg-teal-500 transition-all"><ArrowUpRight size={24}/></a>
                  </div>
               </div>
               <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.5em] text-center italic">© 2025 LOGIC EDUCATION PLATFORM</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Gallery Viewer Popup */}
      {selectedGallery && (
        <Dialog open={!!selectedGallery} onOpenChange={() => setSelectedGallery(null)}>
          <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 bg-zinc-950 border border-white/10">
            <DialogHeader className="mb-8 md:mb-12 text-center">
              <DialogTitle className="text-3xl md:text-5xl font-black tracking-tighter italic text-white uppercase">{selectedGallery.name}</DialogTitle>
              <DialogDescription className="text-[10px] md:text-sm font-black text-zinc-500 uppercase tracking-[0.3em] mt-2 italic underline underline-offset-8 decoration-teal-500">Archive Viewer</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {selectedGallery.image_urls.map((url: string, i: number) => (
                <div key={i} className="aspect-[4/3] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-2 border-white/5">
                  <img src={url} alt={`Asset ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in" onClick={() => window.open(url, '_blank')} />
                </div>
              ))}
            </div>
            <div className="mt-10 md:mt-16 flex justify-center">
               <Button variant="outline" className="rounded-full px-12 md:px-16 h-12 md:h-16 font-black uppercase text-xs tracking-widest border-zinc-800 text-white" onClick={() => setSelectedGallery(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}