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
  MessageSquare
} from "lucide-react";

export function PublicHomepage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]); 
  const [selectedGallery, setSelectedGallery] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) fetchRanks(selectedClassId);
  }, [selectedClassId]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      // Fetch Classes
      const { data: classData } = await supabase.from('classes').select('*').order('year', { ascending: false });
      if (classData && classData.length > 0) {
        setClasses(classData);
        setSelectedClassId(classData[0].id);
      }
      
      // Fetch Public Notices
      const { data: noticeData } = await supabase.from('notices').select('*').eq('publish_homepage', true).order('created_at', { ascending: false });
      if (noticeData) setNotices(noticeData);
      
      // Fetch Galleries
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
        // Keep only the highest mark for each student in the list
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
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logic Logo" className="h-10 w-auto object-contain" />
          <div className="flex flex-col">
            <h2 className="text-base font-black text-slate-800 tracking-tighter uppercase italic leading-none">Logic with Dilshan</h2>
            <span className="text-[7px] font-bold text-teal-600 uppercase tracking-widest mt-1 italic">Authorized Educational Platform</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => onNavigate('student')} className="font-bold text-slate-600 hover:bg-slate-50 rounded-xl px-5 text-xs uppercase tracking-widest transition-all">
            Student Login
          </Button>
          {/* UPDATED: Navigates to Admin Login Gateway */}
          <Button onClick={() => onNavigate('admin-login')} className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl px-6 text-xs uppercase tracking-widest shadow-md">
            Staff Portal
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 bg-white overflow-hidden relative border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-teal-500"></div>
                <span className="text-teal-600 font-black uppercase tracking-[0.3em] text-[10px]">Enrollment 2026 Open</span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase italic text-slate-900">
               Master Your <br/> <span className="text-teal-600">Mind.</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-md italic">
              "Logic is not just a subject, but a way of thinking, questioning, and discovering the world."
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
               <Button size="lg" className="bg-slate-900 hover:bg-black text-white rounded-2xl px-12 font-black uppercase text-xs h-16 shadow-2xl active:scale-95 transition-all" onClick={() => onNavigate('student')}>Begin Journey</Button>
               <a href="https://wa.me/94770224060" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="rounded-2xl px-10 border-slate-200 text-slate-600 h-16 font-black uppercase text-xs hover:bg-slate-50 transition-all flex gap-2 items-center">
                    <MessageSquare size={16} /> WhatsApp
                </Button>
               </a>
            </div>
          </div>
          <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000">
             <div className="absolute -inset-1 bg-teal-500/10 rounded-[4rem] blur-2xl opacity-50"></div>
             <ImageWithFallback 
                src="/teacher-dilshan.jpg" 
                alt="Dilshan Uthpala" 
                className="rounded-[3.5rem] border-[12px] border-white shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700 aspect-[4/5] object-cover" 
             />
          </div>
        </div>
      </section>

      {/* About Us & Mission */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-24 items-start">
            <div className="space-y-10">
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-teal-600 flex items-center gap-3">
                       <div className="h-0.5 w-8 bg-teal-600"></div> About Us
                    </h2>
                    <h3 className="text-5xl font-black text-slate-900 uppercase italic leading-tight">Logic with <br/> Dilshan Uthpala</h3>
                    <p className="text-slate-600 leading-relaxed text-xl font-medium">
                        We believe that logic is not just another subject but a way of thinking, questioning and discovering the world around us.
                    </p>
                    <p className="text-slate-500 leading-relaxed text-lg border-l-4 border-teal-500 pl-6 py-2 italic font-medium">
                        Created by a passionate law student, this logic platform helps students build a sharper mind and strengthen their reasoning.
                    </p>
                </div>
                <div className="p-10 bg-slate-900 rounded-[3rem] text-white relative shadow-2xl border-t-8 border-teal-500 group overflow-hidden">
                    <Quote className="absolute top-6 right-6 size-12 text-teal-500/20 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-black italic tracking-tighter leading-tight uppercase relative z-10">"මොළ හදන <br/> ලොජික් පන්තිය"</p>
                </div>
            </div>

            <div className="space-y-16 py-12">
                <div className="flex gap-8 group">
                    <div className="bg-white p-5 rounded-[2rem] shadow-xl h-fit border border-slate-50 group-hover:bg-teal-600 transition-all duration-300">
                        <Target className="text-teal-600 group-hover:text-white size-10 transition-colors" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-2xl font-black uppercase italic text-slate-900">Our Goal</h4>
                        <p className="text-slate-500 leading-relaxed text-lg font-medium">
                            To simplify the subject of logic and present it to the student in a fun, intuitive and understandable way.
                        </p>
                    </div>
                </div>
                <div className="flex gap-8 group">
                    <div className="bg-white p-5 rounded-[2rem] shadow-xl h-fit border border-slate-50 group-hover:bg-teal-600 transition-all duration-300">
                        <BrainCircuit className="text-teal-600 group-hover:text-white size-10 transition-colors" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-2xl font-black uppercase italic text-slate-900">Our Mission</h4>
                        <p className="text-slate-500 leading-relaxed text-lg font-medium">
                            Instead of teaching a mere subject, we instill a rational mindset and teach scientific methods with equal emphasis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- START OF NOTICE BOARD SECTION --- */}
{notices.length > 0 && (
  <section className="py-24 bg-slate-50 border-y border-slate-100">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex items-center gap-3 mb-16">
        <div className="size-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
           <Bell className="text-white size-6" />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 italic">Notice Board</h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {notices.map((n) => (
          <Card key={n.id} className="rounded-[2.5rem] border-none bg-white shadow-xl shadow-slate-200/40 p-2 transition-all hover:-translate-y-2 group">
            <CardHeader className="p-6 pb-2">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-teal-50 text-teal-600 border-none font-black text-[9px] px-3 py-1 rounded-full tracking-widest">
                  {new Date(n.created_at).toLocaleDateString()}
                </Badge>
                <Zap size={14} className="text-teal-200 group-hover:text-teal-500 transition-colors" />
              </div>
              <CardTitle className="text-2xl font-black uppercase italic leading-tight text-slate-800 group-hover:text-teal-600 transition-colors">
                {n.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <p className="text-slate-500 font-medium leading-relaxed italic">
                "{n.content}"
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
)}
{/* --- END OF NOTICE BOARD SECTION --- */}

      {/* Hall of Fame */}
      <section className="py-32 px-6 max-w-7xl mx-auto text-center">
        <div className="flex flex-col items-center mb-16">
            <Trophy className="text-teal-600 size-14 mb-6" />
            <h2 className="text-6xl font-black tracking-tighter uppercase italic text-slate-900">Hall of Fame</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs mt-4">Recognition of Excellence</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-12 mb-20">
          {classes.map(c => (
            <Button 
              key={c.id} 
              variant={selectedClassId === c.id ? "default" : "outline"} 
              onClick={() => setSelectedClassId(c.id)} 
              className={`rounded-2xl font-black px-8 h-14 uppercase text-[10px] tracking-[0.2em] transition-all ${
                selectedClassId === c.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 border-slate-200 hover:text-slate-900'
              }`}
            >
              {c.year} {c.type}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {topStudents.length > 0 ? topStudents.map((s, i) => (
            <Card key={i} className={`rounded-[3rem] border-none bg-white shadow-2xl p-6 relative transition-all hover:scale-105 ${i === 0 ? 'ring-2 ring-teal-500' : ''}`}>
              {i === 0 && <Star className="absolute -top-3 -right-3 size-12 text-yellow-400 fill-yellow-400" />}
              <CardHeader className="text-left p-0 pb-6 border-b border-slate-50">
                <div className={`size-14 rounded-2xl flex items-center justify-center font-black text-2xl mb-4 ${i === 0 ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                    {i + 1}
                </div>
                <CardTitle className="text-xl font-black uppercase italic truncate text-slate-800">{s.student_name}</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase truncate text-slate-400 tracking-tight">{s.school_name}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-0">
                <div className="p-6 bg-[#FAFBFC] rounded-[2rem] text-center border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{s.exam_name}</p>
                    <div className="text-5xl font-black text-teal-600 tracking-tighter italic">{s.marks}%</div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full py-24 text-slate-300 font-black uppercase tracking-[0.4em] italic border-4 border-dashed rounded-[4rem]">
                Rankings Processing...
            </div>
          )}
        </div>
      </section>

      {/* Class Schedule */}
      <section className="py-32 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
                <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">Class Schedule</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Instructor: Dilshan Uthpala</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {classes.map(cls => (
                    <Card key={cls.id} className="border-none rounded-[3.5rem] bg-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden border border-transparent hover:border-teal-500/20">
                        <CardHeader className="p-10 pb-6">
                            <Badge className="bg-slate-900 text-white border-none px-6 py-2 rounded-full mb-6 w-fit uppercase font-bold tracking-widest">{cls.year}</Badge>
                            <CardTitle className="text-3xl font-black uppercase italic text-slate-800 leading-tight group-hover:text-teal-600 transition-colors">{cls.title}</CardTitle>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block">{cls.type}</span>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-5">
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-600"><div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Calendar size={18} className="text-teal-600"/></div> {cls.class_day}</div>
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-600"><div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Clock size={18} className="text-teal-600"/></div> {cls.class_time}</div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-400"><div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><MapPin size={18}/></div> {cls.institute_name}</div>
                            <Button className="w-full h-16 mt-8 bg-slate-900 hover:bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all" onClick={() => onNavigate('student')}>Enroll Now</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-20 border-l-8 border-teal-500 pl-8">
          <div>
            <h2 className="text-6xl font-black tracking-tighter uppercase italic text-slate-900">Visuals</h2>
            <p className="text-teal-600 font-bold uppercase tracking-widest text-sm mt-3">Moments from logic sessions</p>
          </div>
          <Images className="size-16 text-slate-200 hidden md:block" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {galleries.map((gal) => (
            <Card key={gal.id} className="group cursor-pointer overflow-hidden rounded-[3rem] border-none shadow-2xl transition-all active:scale-95" onClick={() => setSelectedGallery(gal)}>
              <div className="relative h-[28rem] w-full">
                <img src={gal.image_urls[0]} alt={gal.name} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-1000 grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h3 className="font-black text-2xl mb-1 tracking-tighter uppercase italic leading-none">{gal.name}</h3>
                  <Badge className="bg-teal-500 text-white border-none font-black text-[9px] px-3 mt-4">{gal.image_urls.length} ASSETS</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#030712] text-white pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-24 border-b border-white/5 pb-24">
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="bg-white p-2 rounded-xl shadow-lg"><Zap className="text-slate-950 fill-slate-950 size-6" /></div>
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter">Logic</h3>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed italic font-medium">Instilling a rational mindset and simplified logic education through intuitive reasoning.</p>
                
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                        <Mail className="size-4 text-teal-500" /> dilshanuthpalalogic@gmail.com
                    </div>
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                        <Phone className="size-4 text-teal-500" /> +94 77 022 4060
                    </div>
                </div>

                <div className="flex gap-6 pt-6">
                   <a href="https://web.facebook.com/profile.php?id=100094065144515" target="_blank" rel="noreferrer" className="bg-white/5 p-4 rounded-2xl hover:bg-teal-600 transition-all group">
                        <Facebook className="size-5 text-white group-hover:scale-110 transition-transform" />
                   </a>
                   <a href="https://www.youtube.com/@DilshanUthpala" target="_blank" rel="noreferrer" className="bg-white/5 p-4 rounded-2xl hover:bg-teal-600 transition-all group">
                        <Youtube className="size-5 text-white group-hover:scale-110 transition-transform" />
                   </a>
                   <a href="#" className="bg-white/5 p-4 rounded-2xl hover:bg-teal-600 transition-all group">
                        <Instagram className="size-5 text-white group-hover:scale-110 transition-transform" />
                   </a>
                </div>
            </div>
            
            <div>
                <h4 className="font-black mb-10 uppercase text-slate-500 tracking-[0.4em] text-[10px]">Navigation</h4>
                <ul className="space-y-6 text-slate-300 font-bold text-sm uppercase tracking-widest">
                   <li onClick={() => onNavigate('home')} className="hover:text-teal-500 cursor-pointer flex items-center gap-2 group transition-colors italic">
                      <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /> Home Portal
                   </li>
                   <li onClick={() => onNavigate('student')} className="hover:text-teal-500 cursor-pointer flex items-center gap-2 group transition-colors italic">
                      <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /> Student Hub
                   </li>
                   {/* UPDATED: Navigates to Admin Login Gateway */}
                   <li onClick={() => onNavigate('admin-login')} className="hover:text-teal-500 cursor-pointer flex items-center gap-2 group transition-colors italic">
                      <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /> Staff Hub
                   </li>
                </ul>
            </div>

            <div className="space-y-10">
               <div className="p-8 bg-[#0B0F1A] rounded-[2.5rem] border border-white/5 group hover:border-teal-500/40 transition-all shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 -translate-y-12 translate-x-12 rounded-full blur-2xl"></div>
                  <p className="text-[10px] text-teal-500 font-black uppercase tracking-widest mb-6">Developed By</p>
                  <div className="flex items-center justify-between">
                      <p className="text-3xl font-black tracking-tight uppercase italic leading-[0.9] text-white">Lakruwan <br/> Shashika</p>
                      <a href="https://www.linkedin.com/in/lakruwan-shashika/" target="_blank" rel="noreferrer" className="bg-teal-600 p-4 rounded-[1.25rem] text-white hover:bg-teal-500 transition-all shadow-lg">
                        <ArrowUpRight size={28}/>
                      </a>
                  </div>
               </div>
               <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em] text-center italic">© 2025 LOGIC EDUCATION PLATFORM</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Gallery Viewer Popup */}
      {selectedGallery && (
        <Dialog open={!!selectedGallery} onOpenChange={() => setSelectedGallery(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-[4rem] p-12 bg-zinc-950 border border-white/10 shadow-2xl">
            <DialogHeader className="mb-12 text-center">
              <DialogTitle className="text-5xl font-black tracking-tighter italic text-white uppercase">{selectedGallery.name}</DialogTitle>
              <DialogDescription className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] mt-2 italic underline underline-offset-8 decoration-teal-500 decoration-4">Exclusive Gallery Archive</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {selectedGallery.image_urls.map((url: string, i: number) => (
                <div key={i} className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl group transition-all hover:border-teal-500/30">
                  <img src={url} alt={`Gallery asset ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 cursor-zoom-in" onClick={() => window.open(url, '_blank')} />
                </div>
              ))}
            </div>
            <div className="mt-16 flex justify-center">
               <Button variant="outline" className="rounded-full px-16 h-16 font-black uppercase text-xs tracking-widest border-zinc-800 text-white hover:bg-white hover:text-black transition-all" onClick={() => setSelectedGallery(null)}>Close Archive</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}