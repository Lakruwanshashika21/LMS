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
  Play, LogOut, Bell, Lock, XCircle, ChevronLeft, User, Trophy, Send, HelpCircle, Quote
} from "lucide-react";

export function StudentDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [myMarks, setMyMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [selectedClassId, profile]);

  async function fetchInitialData() {
    setLoading(true);
    // Explicitly check session to prevent "undefined" errors
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      onNavigate('home');
      return;
    }

    // 1. Fetch User Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    setProfile(profileData);

    // 2. Fetch Enrolled Classes
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select(`classes (*)`)
      .eq('student_id', session.user.id);

    if (enrollmentData) {
      const formatted = enrollmentData.map((e: any) => e.classes).filter(Boolean);
      setEnrolledClasses(formatted);
      if (formatted.length > 0) setSelectedClassId(formatted[0].id);
    }

    // 3. Fetch Full Marks History
    const { data: markData } = await supabase
      .from('exam_results')
      .select(`*, classes (title)`)
      .eq('student_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (markData) setMyMarks(markData);

    // 4. Fetch Inquiry History
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

    // Fetch Class Materials
    const { data: contentData } = await supabase
      .from('class_content')
      .select('*')
      .eq('class_id', selectedClassId)
      .order('created_at', { ascending: false });
    if (contentData) setContent(contentData);

    // Fetch Direct Class Messages
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
      // Refresh Inquiry List
      const { data } = await supabase
        .from('private_questions')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      setMyQuestions(data || []);
    } else {
      alert("Submission Error: " + error.message);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('home');
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-teal-600 animate-pulse italic tracking-tighter">ESTABLISHING SECURE GATEWAY...</div>;

  if (!profile?.is_paid || profile?.is_suspended) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <Card className="p-10 rounded-[3rem] shadow-2xl max-w-md border-t-8 border-rose-500 bg-white">
          <div className="bg-rose-50 p-5 rounded-full w-fit mx-auto mb-6">
            {profile?.is_suspended ? <XCircle className="size-12 text-rose-600" /> : <Lock className="size-12 text-rose-600" />}
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase text-slate-800">Access Restricted</h2>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            {profile?.is_suspended 
              ? "Your account is currently suspended. Please contact the administration." 
              : "Payment verification pending. Please settle your monthly dues to unlock your course materials."}
          </p>
          <Button className="w-full py-7 rounded-2xl font-black bg-slate-900 text-white shadow-xl" onClick={() => onNavigate('home')}>Exit Portal</Button>
        </Card>
      </div>
    );
  }

  const selectedClassInfo = enrolledClasses.find(c => c.id === selectedClassId);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 border-r p-6 bg-white flex flex-col shadow-sm">
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
              onClick={() => setSelectedClassId(cls.id)}
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
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* HEADER */}
          <header className="flex justify-between items-start bg-white p-8 rounded-[2.5rem] shadow-sm border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-full bg-teal-50 -skew-x-12 translate-x-10 opacity-50"></div>
            <div className="space-y-3 relative z-10">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-800">{selectedClassInfo?.title || "Course Portal"}</h1>
              <div className="flex gap-2">
                  <Badge className="bg-teal-600 text-white border-none px-4 py-1 font-bold rounded-full">{selectedClassInfo?.year || "----"}</Badge>
                  <Badge variant="outline" className="border-slate-200 text-slate-500 px-4 py-1 font-bold rounded-full uppercase text-[10px]">{selectedClassInfo?.type || "----"}</Badge>
              </div>
            </div>
            <div className="text-right relative z-10">
              <p className="text-xs uppercase font-black text-slate-400 tracking-widest mb-1">Instructor</p>
              <p className="text-xl font-black text-slate-900 italic leading-none">Dilshan Uthpala</p>
            </div>
          </header>

          <Tabs defaultValue="video" className="w-full">
            <TabsList className="mb-8 p-1.5 bg-slate-200/50 rounded-[1.5rem] h-16 w-fit shadow-inner">
              <TabsTrigger value="video" className="rounded-xl font-black text-xs uppercase px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md"><Play size={14} className="mr-2"/> Recordings</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-xl font-black text-xs uppercase px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md"><FileText size={14} className="mr-2"/> Materials</TabsTrigger>
              <TabsTrigger value="marks" className="rounded-xl font-black text-xs uppercase px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md"><GraduationCap size={14} className="mr-2"/> Performance</TabsTrigger>
              <TabsTrigger value="inquiry" className="rounded-xl font-black text-xs uppercase px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md"><HelpCircle size={14} className="mr-2"/> Q&A Help</TabsTrigger>
            </TabsList>

            {/* FOLDER ANNOUNCEMENTS */}
            {classMessages.length > 0 && (
                <div className="mb-10 space-y-3">
                    <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest ml-2 flex items-center gap-2"><Bell size={12}/> Class Updates</p>
                    {classMessages.map(m => (
                        <Card key={m.id} className="border-none bg-teal-600 text-white rounded-3xl shadow-xl shadow-teal-900/10 p-6 relative overflow-hidden group">
                            <Quote className="absolute -right-2 -bottom-2 size-24 opacity-10 group-hover:scale-110 transition-transform" />
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-100">Folder Announcement</span>
                                <span className="text-[10px] font-bold opacity-60">{new Date(m.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="font-bold text-lg leading-relaxed relative z-10">{m.message_text}</p>
                        </Card>
                    ))}
                </div>
            )}

            <TabsContent value="video" className="grid gap-4">
              {content.filter(c => c.type === 'video').length > 0 ? (
                content.filter(c => c.type === 'video').map(v => (
                  <Card key={v.id} className="p-6 flex items-center justify-between bg-white rounded-[2rem] border-none shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group">
                     <div className="flex items-center gap-6">
                       <div className="bg-slate-100 p-5 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                          <Play className="size-7 fill-current" />
                       </div>
                       <div>
                          <span className="font-black text-xl block uppercase tracking-tight text-slate-800">{v.title}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 italic">Logical Analysis • {new Date(v.created_at).toLocaleDateString()}</span>
                       </div>
                     </div>
                     <Button size="lg" className="rounded-2xl px-10 font-black bg-teal-600 hover:bg-teal-700 text-white uppercase text-xs h-14" onClick={() => window.open(v.url, '_blank')}>Play Lesson</Button>
                  </Card>
                ))
              ) : (
                <div className="py-24 text-center border-4 border-dashed rounded-[3rem] text-slate-300 font-bold uppercase tracking-widest italic">Choose a course folder to view recordings</div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="grid gap-4">
              {content.filter(c => c.type === 'note').map(n => (
                <Card key={n.id} className="p-6 flex items-center justify-between bg-white rounded-[2rem] border-2 border-transparent hover:border-teal-500/20 transition-all shadow-sm">
                   <div className="flex items-center gap-6">
                     <div className="bg-orange-50 p-5 rounded-2xl text-orange-500"><FileText className="size-7" /></div>
                     <div>
                        <span className="font-black text-xl block uppercase tracking-tight text-slate-800">{n.title}</span>
                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest italic leading-none mt-1">Verified PDF Material</p>
                     </div>
                   </div>
                   <Button variant="ghost" size="icon" className="rounded-2xl size-14 hover:bg-teal-50 text-teal-600 transition-all border border-slate-100" onClick={() => window.open(n.url, '_blank')}>
                      <Download className="h-7 w-7"/>
                   </Button>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="marks" className="space-y-6">
              <div className="flex justify-between items-center px-4">
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-800">Verified Result History</h3>
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1.5 rounded-full font-bold">Total Entries: {myMarks.length}</Badge>
              </div>
              <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
                <Table>
                  <TableHeader className="bg-slate-900">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="py-6 pl-10 font-black uppercase text-[10px] text-white">Date Released</TableHead>
                      <TableHead className="font-black uppercase text-[10px] text-white text-center">Paper / Exam Details</TableHead>
                      <TableHead className="text-right pr-10 font-black uppercase text-[10px] text-white">Final Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myMarks.map((m, index) => (
                      <TableRow key={m.id} className={`border-slate-50 hover:bg-slate-50 transition-colors ${index === 0 ? 'bg-teal-50/20' : ''}`}>
                        <TableCell className="py-8 pl-10 text-xs font-bold text-slate-400">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-teal-600 mb-0.5">{m.classes?.title}</span>
                                <span className="font-black text-slate-800 uppercase italic text-sm">{m.exam_name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right pr-10">
                            <div className="flex flex-col items-end">
                                <span className="text-4xl font-black text-teal-600 italic tracking-tighter leading-none">{m.marks}%</span>
                                <span className="text-[8px] font-black uppercase text-slate-300 mt-1">Assessment Confirmed</span>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="inquiry" className="grid gap-8">
                <Card className="p-8 rounded-[2.5rem] shadow-xl border-t-8 border-teal-500 bg-white">
                    <CardTitle className="mb-4 uppercase italic text-xl text-slate-800 flex items-center gap-2"><HelpCircle size={20} className="text-teal-600"/> Help Desk</CardTitle>
                    <CardDescription className="mb-6 font-medium text-slate-500">Ask a question directly to Dilshan Uthpala. All inquiries are private between you and the instructor.</CardDescription>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Describe your logical doubt here..." 
                            className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus-visible:ring-teal-500" 
                            value={questionText} 
                            onChange={e => setQuestionText(e.target.value)} 
                        />
                        <Button className="bg-slate-900 text-white rounded-2xl px-10 font-black uppercase text-xs hover:bg-black transition-all" onClick={handleAskQuestion}><Send size={16} className="mr-2"/> Ask</Button>
                    </div>
                </Card>

                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Conversation History</p>
                    {myQuestions.map(q => (
                        <Card key={q.id} className="p-6 rounded-[2rem] border-none shadow-md bg-white">
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(q.created_at).toLocaleDateString()}</span>
                                {q.is_resolved ? <Badge className="bg-teal-500 text-white border-none">Answered</Badge> : <Badge className="bg-slate-100 text-slate-500 border-none font-bold italic uppercase text-[9px]">Awaiting Reply</Badge>}
                            </div>
                            <p className="font-bold text-slate-700 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">Q: {q.question_text}</p>
                            {q.admin_reply && (
                                <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-full bg-teal-600/5 -skew-x-12 translate-x-10"></div>
                                    <p className="text-[10px] font-black text-teal-700 uppercase mb-2 tracking-widest">Instructor Reply:</p>
                                    <p className="text-sm font-medium text-slate-700 italic relative z-10 leading-relaxed">"{q.admin_reply}"</p>
                                </div>
                            )}
                        </Card>
                    ))}
                    {myQuestions.length === 0 && <div className="py-24 text-center text-slate-300 font-bold uppercase italic border-4 border-dashed rounded-[3rem]">No recorded inquiries</div>}
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}