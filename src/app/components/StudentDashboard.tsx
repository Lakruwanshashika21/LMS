"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
  BookOpen, FileText, GraduationCap, Download, 
  Play, LogOut, Bell, Lock, XCircle, User, Trophy, Send, HelpCircle, Quote, Menu, X
} from "lucide-react";

export function StudentDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [myMarks, setMyMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mobile UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Messaging & Q&A State
  const [classMessages, setClassMessages] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [myQuestions, setMyQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId && profile?.is_paid && !profile?.is_suspended) {
      fetchClassSpecificData();
    }

    if (profile?.id) {
      const profileSubscription = supabase
        .channel(`profile-updates-${profile.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` },
          (payload) => {
            setProfile(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(profileSubscription);
      };
    }
  }, [selectedClassId, profile?.id, profile?.is_paid, profile?.is_suspended]);

  async function fetchInitialData() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      onNavigate('home');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    setProfile(profileData);

    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select(`classes (*)`)
      .eq('student_id', session.user.id);

    if (enrollmentData) {
      const formatted = enrollmentData.map((e: any) => e.classes).filter(Boolean);
      setEnrolledClasses(formatted);
      if (formatted.length > 0) setSelectedClassId(formatted[0].id);
    }

    const { data: markData } = await supabase
      .from('exam_results')
      .select(`*, classes (title)`)
      .eq('student_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (markData) setMyMarks(markData);

    const { data: questions } = await supabase
      .from('private_questions')
      .select('*')
      .eq('student_id', session.user.id)
      .order('created_at', { ascending: false });
    setMyQuestions(questions || []);

    setLoading(false);
  }

  async function fetchClassSpecificData() {
    if (!selectedClassId) return;

    const { data: contentData } = await supabase
      .from('class_content')
      .select('*')
      .eq('class_id', selectedClassId)
      .order('created_at', { ascending: false });
    if (contentData) setContent(contentData);

    const { data: messages } = await supabase
      .from('class_messages')
      .select('*')
      .eq('class_id', selectedClassId)
      .order('created_at', { ascending: false });
    setClassMessages(messages || []);
  }

  async function handleAskQuestion() {
    if (!questionText.trim() || !profile) return;
    
    const { error } = await supabase
      .from('private_questions')
      .insert([{ 
        student_id: profile.id, 
        student_name: profile.full_name,
        question_text: questionText.trim() 
      }]);

    if (!error) {
      setQuestionText("");
      const { data } = await supabase
        .from('private_questions')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      setMyQuestions(data || []);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('home');
  };

  // Reusable Sidebar Content
  const SidebarView = () => (
    <div className="flex flex-col h-full">
      <div className="mb-10 px-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Logic Student</h2>
        <p className="text-[9px] font-bold text-teal-600 tracking-[0.2em] uppercase mt-1">Authorized Access</p>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        <p className="text-[11px] uppercase font-black text-slate-400 ml-3 mb-4 tracking-widest">Available Folders</p>
        {enrolledClasses.map(cls => (
          <Button 
            key={cls.id} 
            variant={selectedClassId === cls.id ? "default" : "ghost"} 
            className={`w-full justify-start h-auto py-5 px-4 rounded-2xl transition-all mb-2 ${
              selectedClassId === cls.id ? 'bg-slate-900 shadow-xl ring-4 ring-slate-100' : 'hover:bg-slate-50'
            }`}
            onClick={() => {
              setSelectedClassId(cls.id);
              setIsSidebarOpen(false); // Close mobile menu on select
            }}
          >
            <BookOpen className={`mr-4 h-6 w-6 ${selectedClassId === cls.id ? 'text-teal-400' : 'text-slate-400'}`}/> 
            <div className="text-left overflow-hidden">
              <div className={`text-sm font-black truncate uppercase ${selectedClassId === cls.id ? 'text-white' : 'text-slate-700'}`}>{cls.title}</div>
              <div className={`text-[10px] font-bold ${selectedClassId === cls.id ? 'text-slate-400' : 'text-slate-400'}`}>
                {cls.year} • {cls.type}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="pt-6 border-t mt-auto space-y-4">
        <div className="px-4 py-3 bg-slate-50 rounded-2xl flex items-center gap-3 border">
           <div className="size-10 bg-white rounded-xl flex items-center justify-center border shadow-sm font-black text-teal-600 italic">L</div>
           <div className="overflow-hidden">
              <p className="text-xs font-black truncate">{profile?.full_name}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{profile?.school_name}</p>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="text-xs h-10 rounded-xl font-bold" onClick={() => onNavigate('home')}>Home</Button>
          <Button variant="ghost" className="text-xs h-10 rounded-xl font-bold text-rose-500 hover:bg-rose-50" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-teal-600 animate-pulse italic tracking-tighter">ESTABLISHING SECURE GATEWAY...</div>;

  if (!profile?.is_paid || profile?.is_suspended) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <Card className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-md border-t-8 border-rose-500 bg-white">
          <div className="bg-rose-50 p-5 rounded-full w-fit mx-auto mb-6">
            {profile?.is_suspended ? <XCircle className="size-12 text-rose-600" /> : <Lock className="size-12 text-rose-600" />}
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter uppercase text-slate-800">Access Restricted</h2>
          <p className="text-sm md:text-base text-slate-500 mb-8 font-medium leading-relaxed">
            {profile?.is_suspended 
              ? "Your account is currently suspended. Please contact the administration." 
              : "Payment verification pending. Please settle your monthly dues to unlock your course materials."}
          </p>
          <Button className="w-full py-6 md:py-7 rounded-2xl font-black bg-slate-900 text-white shadow-xl" onClick={() => onNavigate('home')}>Exit Portal</Button>
        </Card>
      </div>
    );
  }

  const selectedClassInfo = enrolledClasses.find(c => c.id === selectedClassId);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b z-50">
         <div className="flex items-center gap-2">
            <div className="size-8 bg-slate-900 rounded-lg flex items-center justify-center text-teal-400 font-black italic text-xs">L</div>
            <span className="font-black uppercase italic text-sm tracking-tight">Logic Portal</span>
         </div>
         <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
         </Button>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)}>
           <div className="w-80 h-full bg-white p-6 relative animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 p-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}>
                 <X size={24} />
              </button>
              <SidebarView />
           </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-80 border-r p-6 bg-white flex-col shadow-sm">
        <SidebarView />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          
          {/* HEADER CARD */}
          <header className="flex flex-col md:flex-row justify-between items-start bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border relative overflow-hidden gap-4">
            <div className="absolute top-0 right-0 w-32 h-full bg-teal-50 -skew-x-12 translate-x-10 opacity-50 hidden md:block"></div>
            <div className="space-y-3 relative z-10">
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-slate-800 leading-tight">
                {selectedClassInfo?.title || "Course Portal"}
              </h1>
              <div className="flex gap-2">
                  <Badge className="bg-teal-600 text-white border-none px-4 py-1 font-bold rounded-full text-[10px] md:text-xs">
                    {selectedClassInfo?.year || "----"}
                  </Badge>
                  <Badge variant="outline" className="border-slate-200 text-slate-500 px-4 py-1 font-bold rounded-full uppercase text-[9px] md:text-[10px]">
                    {selectedClassInfo?.type || "----"}
                  </Badge>
              </div>
            </div>
            <div className="md:text-right relative z-10">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Instructor</p>
              <p className="text-lg md:text-xl font-black text-slate-900 italic leading-none">Dilshan Uthpala</p>
            </div>
          </header>

          <Tabs defaultValue="video" className="w-full">
            <TabsList className="mb-6 md:mb-8 p-1 bg-slate-200/50 rounded-2xl h-14 md:h-16 w-full md:w-fit overflow-x-auto justify-start no-scrollbar shadow-inner">
              <TabsTrigger value="video" className="rounded-xl font-black text-[10px] md:text-xs uppercase px-4 md:px-6 h-full"><Play size={14} className="mr-2 hidden md:block"/> Lessons</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-xl font-black text-[10px] md:text-xs uppercase px-4 md:px-6 h-full"><FileText size={14} className="mr-2 hidden md:block"/> Materials</TabsTrigger>
              <TabsTrigger value="marks" className="rounded-xl font-black text-[10px] md:text-xs uppercase px-4 md:px-6 h-full"><GraduationCap size={14} className="mr-2 hidden md:block"/> Performance</TabsTrigger>
              <TabsTrigger value="inquiry" className="rounded-xl font-black text-[10px] md:text-xs uppercase px-4 md:px-6 h-full"><HelpCircle size={14} className="mr-2 hidden md:block"/> Q&A Help</TabsTrigger>
            </TabsList>

            {/* CLASS UPDATES */}
            {classMessages.length > 0 && (
                <div className="mb-8 md:mb-10 space-y-3">
                    <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest ml-2 flex items-center gap-2"><Bell size={12}/> Class Updates</p>
                    {classMessages.map(m => (
                        <Card key={m.id} className="border-none bg-teal-600 text-white rounded-2xl md:rounded-3xl shadow-xl p-5 md:p-6 relative overflow-hidden group">
                            <Quote className="absolute -right-2 -bottom-2 size-16 md:size-24 opacity-10" />
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-teal-100">Folder Announcement</span>
                                <span className="text-[9px] font-bold opacity-60">{new Date(m.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="font-bold text-base md:text-lg leading-relaxed relative z-10">{m.message_text}</p>
                        </Card>
                    ))}
                </div>
            )}

            <TabsContent value="video" className="grid gap-4">
              {content.filter(c => c.type === 'video').length > 0 ? (
                content.filter(c => c.type === 'video').map(v => (
                  <Card key={v.id} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-2xl md:rounded-[2rem] border-none shadow-sm gap-4">
                     <div className="flex items-center gap-4 md:gap-6">
                       <div className="bg-slate-100 p-4 rounded-xl text-slate-800">
                          <Play className="size-6 fill-current" />
                       </div>
                       <div>
                          <span className="font-black text-base md:text-xl block uppercase tracking-tight text-slate-800 leading-tight">{v.title}</span>
                          <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 italic">Lesson • {new Date(v.created_at).toLocaleDateString()}</span>
                       </div>
                     </div>
                     <Button className="w-full sm:w-auto rounded-xl px-8 font-black bg-teal-600 text-white uppercase text-xs h-12" onClick={() => window.open(v.url, '_blank')}>Play Lesson</Button>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-4 border-dashed rounded-[2rem] md:rounded-[3rem] text-slate-300 font-bold uppercase tracking-widest italic text-xs">No recordings available</div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="grid gap-4">
              {content.filter(c => c.type === 'note').map(n => (
                <Card key={n.id} className="p-4 md:p-6 flex items-center justify-between bg-white rounded-2xl md:rounded-[2rem] border-none shadow-sm">
                   <div className="flex items-center gap-4 md:gap-6">
                     <div className="bg-orange-50 p-4 rounded-xl text-orange-500"><FileText className="size-6" /></div>
                     <div>
                        <span className="font-black text-base md:text-xl block uppercase tracking-tight text-slate-800 leading-tight">{n.title}</span>
                        <p className="text-[9px] font-bold text-teal-600 uppercase tracking-widest italic">PDF Handout</p>
                     </div>
                   </div>
                   <Button variant="ghost" size="icon" className="rounded-xl size-12 hover:bg-teal-50 text-teal-600 border border-slate-100" onClick={() => window.open(n.url, '_blank')}>
                      <Download size={20}/>
                   </Button>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="marks" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-2 gap-2">
                  <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tight text-slate-800">Verified Result History</h3>
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1.5 rounded-full font-bold w-fit">Total: {myMarks.length}</Badge>
              </div>
              <Card className="border-none shadow-xl overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white">
                <div className="overflow-x-auto">
                   <Table className="min-w-[600px]">
                      <TableHeader className="bg-slate-900">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="py-6 pl-8 font-black uppercase text-[10px] text-white">Date</TableHead>
                          <TableHead className="font-black uppercase text-[10px] text-white text-center">Exam Details</TableHead>
                          <TableHead className="text-right pr-8 font-black uppercase text-[10px] text-white">Final Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myMarks.map((m, index) => (
                          <TableRow key={m.id} className={`border-slate-50 ${index === 0 ? 'bg-teal-50/20' : ''}`}>
                            <TableCell className="py-6 pl-8 text-xs font-bold text-slate-400">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-teal-600">{m.classes?.title}</span>
                                    <span className="font-black text-slate-800 uppercase italic text-xs">{m.exam_name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                                <span className="text-3xl font-black text-teal-600 italic tracking-tighter leading-none">{m.marks}%</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="inquiry" className="grid gap-6">
                <Card className="p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl border-t-8 border-teal-500 bg-white">
                    <CardTitle className="mb-4 uppercase italic text-lg text-slate-800 flex items-center gap-2"><HelpCircle size={20} className="text-teal-600"/> Help Desk</CardTitle>
                    <div className="flex flex-col gap-3">
                        <Input 
                            placeholder="Describe your logical doubt..." 
                            className="h-12 rounded-xl bg-slate-50 border-none px-4" 
                            value={questionText} 
                            onChange={e => setQuestionText(e.target.value)} 
                        />
                        <Button className="bg-slate-900 text-white rounded-xl h-12 font-black uppercase text-[10px] tracking-widest" onClick={handleAskQuestion}><Send size={14} className="mr-2"/> Send Inquiry</Button>
                    </div>
                </Card>

                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Inquiry History</p>
                    {myQuestions.map(q => (
                        <Card key={q.id} className="p-5 rounded-2xl border-none shadow-md bg-white">
                            <div className="flex justify-between mb-3">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(q.created_at).toLocaleDateString()}</span>
                                {q.is_resolved ? <Badge className="bg-teal-500 text-white border-none text-[8px]">Answered</Badge> : <Badge className="bg-slate-100 text-slate-400 border-none font-bold italic uppercase text-[8px]">Pending</Badge>}
                            </div>
                            <p className="font-bold text-slate-700 mb-4 text-sm">Q: {q.question_text}</p>
                            {q.admin_reply && (
                                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                                    <p className="text-[9px] font-black text-teal-700 uppercase mb-1">Reply:</p>
                                    <p className="text-xs font-medium text-slate-700 italic leading-relaxed">"{q.admin_reply}"</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}