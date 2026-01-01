"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { 
  Users, Trophy, Trash2, Video, FileText, 
  FolderPlus, ChevronLeft, UserPlus, Clock, Search, 
  MoreVertical, Ban, School, Upload, Pencil, Check, Image as ImageIcon, EyeOff, Bell, ShieldCheck, Send, MessageSquare, ExternalLink, HelpCircle, Phone
} from "lucide-react";
import { cn } from "./ui/utils";

type AdminView = 'students' | 'classes' | 'gallery' | 'notices' | 'staff' | 'inquiries';

export function AdminDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeView, setActiveView] = useState<AdminView>('classes');
  const [classes, setClasses] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classContent, setClassContent] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [messageText, setMessageText] = useState("");
  const [classMessages, setClassMessages] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "" });
  const [newStaff, setNewStaff] = useState({ email: "", password: "", fullName: "" });
  const [examName, setExamName] = useState("Monthly Test");
  const [studentMarks, setStudentMarks] = useState<{ [key: string]: string }>({});
  const [existingResults, setExistingResults] = useState<any[]>([]);
  const [newGalleryName, setNewGalleryName] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [regData, setRegData] = useState({ email: "", password: "", fullName: "", academicYear: "", schoolName: "", phoneNumber: "", institute: "" });
  const [newClass, setNewClass] = useState({ title: "", year: "", type: "Theory", class_day: "", class_time: "", institute_name: "", class_category: "Group", instructor: "Dilshan Uthpala" });
  const [editClassData, setEditClassData] = useState<any>(null);
  const [newContent, setNewContent] = useState({ title: "", url: "", type: "video" });

  useEffect(() => {
    fetchInitialData();
  }, [activeView]);

  useEffect(() => {
    if (selectedClass) {
      fetchFolderContent();
      fetchStudentsInClass(selectedClass.id);
      fetchExistingResults(selectedClass.id);
      fetchClassMessages(selectedClass.id);
    }
  }, [selectedClass]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: cls } = await supabase.from('classes').select('*').order('year', { ascending: false });
      const currentClasses = cls || [];
      setClasses(currentClasses);

      const { data: nts } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      setNotices(nts || []);

      const { data: gals } = await supabase.from('galleries').select('*').order('created_at', { ascending: false });
      setGalleries(gals || []);

      if (activeView === 'staff') {
        const { data: stf } = await supabase.from('profiles').select('*').eq('role', 'admin');
        setStaff(stf || []);
      }

      try {
        const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'student').order('full_name');
        const { data: enrolls } = await supabase.from('enrollments').select('student_id, class_id');

        if (profiles) {
          const merged = profiles.map(p => ({
            ...p,
            enrolled_folders: enrolls?.filter(e => e.student_id === p.id).map(e => currentClasses.find(c => c.id === e.class_id)).filter(Boolean) || []
          }));
          setStudents(merged);
        }
      } catch (e) { console.error("Profile sync fail (RLS issue)"); }

      if (activeView === 'inquiries') await fetchAllQuestions();
    } catch (err: any) { console.error("Global fetch error:", err.message); }
    setLoading(false);
  }

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone_number?.includes(searchQuery)
  );

  async function handleAddAdmin() {
    if (!newStaff.email || !newStaff.password || !newStaff.fullName) return alert("Fill all fields");
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email: newStaff.email.trim(), 
            password: newStaff.password,
            options: { 
              data: { 
                full_name: newStaff.fullName,
                // FIX: Move role here
                role: 'admin' 
              }
            }
          });
      if (authError) throw authError;

      if (authData.user) {
          const { error } = await supabase.from('profiles').upsert([{ 
            id: authData.user.id, 
            full_name: newStaff.fullName, 
            email: newStaff.email.trim(), 
            role: 'admin' 
          }]);
          if (error) throw error;
          alert("Admin registered!");
          setNewStaff({ email: "", password: "", fullName: "" });
          fetchInitialData();
      }
    } catch (err: any) { alert("Auth Error: " + err.message); }
    setLoading(false);
  }

  async function removeAdmin(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id === id) return alert("You cannot delete your own account.");

    if (confirm("Permanently revoke this administrator's access?")) { 
      const { error } = await supabase.from('profiles').delete().eq('id', id); 
      if (error) alert("Deletion Error: " + error.message);
      else fetchInitialData(); 
    }
  }

  async function handleRegisterStudent() {
  if (!regData.email || !regData.password) return alert("Required fields missing");
  setLoading(true);
  
  try {
    // 1. Only call signUp. The Database Trigger handles the 'profiles' table now.
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: regData.email.trim(), 
        password: regData.password,
        options: { 
          data: { 
            full_name: regData.fullName,
            school_name: regData.schoolName,
            phone_number: regData.phoneNumber,
            academic_year: regData.academicYear,
            // FIX: Move role here
            role: 'student' 
          }
        }
      });

    if (authError) throw authError;

    // 2. REMOVE the supabase.from('profiles').insert([...]) block entirely.
    // That block is what caused the 'duplicate key' error.

    setIsRegModalOpen(false); 
    setRegData({ email: "", password: "", fullName: "", academicYear: "", schoolName: "", phoneNumber: "", institute: "" });
    fetchInitialData();
    alert("Student registered successfully via Database Trigger!");
    
  } catch (err: any) {
    alert("Registration Error: " + err.message);
  } finally {
    setLoading(false);
  }
}

async function removeStudent(id: string) {
  if (confirm("Permanently delete this student account?")) {
    // We only delete from the 'profiles' table. 
    // Supabase Auth users should be managed in the Supabase Dashboard.
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      alert("Student profile removed.");
      fetchInitialData(); // Refresh the list
    }
  }
}

  async function toggleStatus(id: string, field: string, currentVal: boolean) {
    const { error } = await supabase.from('profiles').update({ [field]: !currentVal }).eq('id', id);
    if (error) alert("Update failed: " + error.message);
    else {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: !currentVal } : s));
    }
  }

  async function handleSendMessage() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id || !messageText) return alert("Message cannot be empty.");
    const { error } = await supabase.from('class_messages').insert([{
      class_id: selectedClass.id,
      sender_id: session.user.id,
      sender_name: "Dilshan Uthpala",
      message_text: messageText
    }]);
    if (!error) { setMessageText(""); fetchClassMessages(selectedClass.id); }
  }

  async function handleDeleteMessage(messageId: number) {
    if (confirm("Permanently delete this announcement?")) {
      const { error } = await supabase.from('class_messages').delete().eq('id', messageId);
      if (!error) fetchClassMessages(selectedClass.id);
    }
  }

  async function fetchClassMessages(classId: number) {
    const { data } = await supabase.from('class_messages').select('*').eq('class_id', classId).order('created_at', { ascending: false });
    setClassMessages(data || []);
  }

  async function fetchFolderContent() {
    const { data } = await supabase.from('class_content').select('*').eq('class_id', selectedClass.id);
    setClassContent(data || []);
  }

  async function fetchStudentsInClass(classId: number) {
    const { data: enrollData } = await supabase.from('enrollments').select('student_id').eq('class_id', classId);
    const ids = enrollData?.map(e => e.student_id) || [];
    if (ids.length > 0) {
      const { data: profileData } = await supabase.from('profiles').select('*').in('id', ids);
      setClassStudents(profileData || []);
    } else setClassStudents([]);
  }

  async function toggleClassAssignment(studentId: string, classId: number) {
    const { data: existing } = await supabase.from('enrollments').select('*').eq('student_id', studentId).eq('class_id', classId).maybeSingle();
    if (existing) { await supabase.from('enrollments').delete().eq('student_id', studentId).eq('class_id', classId); }
    else { await supabase.from('enrollments').insert([{ student_id: studentId, class_id: classId }]); }
    fetchInitialData();
  }

  async function handlePostNotice() {
    if (!newNotice.title || !newNotice.content) return alert("Fill all fields");
    const { error } = await supabase.from('notices').insert([newNotice]);
    if (!error) { setNewNotice({ title: "", content: "" }); fetchInitialData(); }
  }

  async function deleteNotice(id: number) {
    if (confirm("Remove notice?")) { await supabase.from('notices').delete().eq('id', id); fetchInitialData(); }
  }

  async function handleSaveGallery() {
    if (!newGalleryName || galleryImages.length === 0) return alert("Fill details");
    const { error } = await supabase.from('galleries').insert([{ name: newGalleryName, image_urls: galleryImages }]);
    if (!error) { setNewGalleryName(""); setGalleryImages([]); fetchInitialData(); }
  }

  async function handleDeleteGallery(id: number, urls: string[]) {
    if (confirm("Delete gallery?")) { await supabase.from('galleries').delete().eq('id', id); fetchInitialData(); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !selectedClass) return;
    setUploading(true);
    try {
      const cleanName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const filePath = `${selectedClass.id}/${Date.now()}_${cleanName}`;
      const { error } = await supabase.storage.from('class-materials').upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('class-materials').getPublicUrl(filePath);
      setNewContent(prev => ({ ...prev, url: urlData.publicUrl, type: 'note' }));
    } catch (err) { alert("Upload failed"); } finally { setUploading(false); }
  }

  async function handleAddContent() {
    if (!newContent.title || !newContent.url) return alert("Fill details");
    await supabase.from('class_content').insert([{ ...newContent, class_id: selectedClass.id }]);
    setNewContent({ title: "", url: "", type: "video" });
    fetchFolderContent();
  }

  async function handleDeleteContent(id: string) {
    if (confirm("Remove material?")) { await supabase.from('class_content').delete().eq('id', id); fetchFolderContent(); }
  }

  async function handleCreateClass() {
    if (!newClass.title || !newClass.year) return alert("Fill details");
    await supabase.from('classes').insert([newClass]);
    setNewClass({ title: "", year: "", type: "Theory", class_day: "", class_time: "", institute_name: "", class_category: "Group", instructor: "Dilshan Uthpala" });
    fetchInitialData();
  }

  async function handleUpdateClass() {
    await supabase.from('classes').update(editClassData).eq('id', editClassData.id);
    setEditClassData(null); fetchInitialData();
  }

  async function handleDeleteClass(id: number) {
    if (confirm("Delete class folder?")) { await supabase.from('classes').delete().eq('id', id); setSelectedClass(null); fetchInitialData(); }
  }

  async function fetchExistingResults(classId: number) {
    const { data } = await supabase.from('exam_results').select('*').eq('class_id', classId).order('created_at', { ascending: false });
    setExistingResults(data || []);
  }

  async function handleSaveMark(studentId: string, studentName: string, schoolName: string) {
    const mark = studentMarks[studentId];
    if (!mark) return alert("Enter mark");
    await supabase.from('exam_results').insert([{ student_id: studentId, class_id: selectedClass.id, student_name: studentName, school_name: schoolName || "N/A", marks: parseFloat(mark), exam_name: examName, is_public: true }]);
    setStudentMarks(prev => ({...prev, [studentId]: ""})); fetchExistingResults(selectedClass.id);
  }

  async function handleHideFromPublic(resultId: number) {
    await supabase.from('exam_results').update({ is_public: false }).eq('id', resultId);
    fetchExistingResults(selectedClass.id);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files || files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
        const file = files[i]; const cleanName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filePath = `images/${Date.now()}_${cleanName}`;
        const { error } = await supabase.storage.from('gallery').upload(filePath, file);
        if (!error) {
            const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(filePath);
            setGalleryImages(prev => [...prev, urlData.publicUrl]);
        }
    }
    setUploading(false);
  }

  async function fetchAllQuestions() {
    const { data } = await supabase.from('private_questions').select('*').order('is_resolved', { ascending: true }).order('created_at', { ascending: false });
    setAllQuestions(data || []);
  }

  async function submitReply(id: number) {
    const text = replyText[id];
    if (!text) return alert("Type a reply first");
    await supabase.from('private_questions').update({ admin_reply: text, is_resolved: true, replied_at: new Date().toISOString() }).eq('id', id);
    alert("Reply Sent!");
    setReplyText(prev => { const updated = { ...prev }; delete updated[id]; return updated; });
    fetchAllQuestions();
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-900 italic">Syncing Admin Hub...</div>;

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-foreground">
      <aside className="w-72 border-r bg-white p-6 flex flex-col shadow-sm">
        <div className="mb-8 px-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Logic Admin</h2>
            <p className="text-[9px] font-bold text-teal-600 mt-2 tracking-widest uppercase">මොළ හදන ලොජික් පන්තිය</p>
        </div>
        <nav className="space-y-1 flex-1">
          <Button variant={activeView === 'classes' ? 'default' : 'ghost'} className="w-full justify-start gap-3 rounded-xl h-11 font-bold" onClick={() => { setActiveView('classes'); setSelectedClass(null); }}>
            <FolderPlus size={18} /> Course Folders
          </Button>
          <Button variant={activeView === 'students' ? 'default' : 'ghost'} className="w-full justify-start gap-3 rounded-xl h-11 font-bold" onClick={() => setActiveView('students')}>
            <Users size={18} /> Student Access
          </Button>
          <Button variant={activeView === 'inquiries' ? 'default' : 'ghost'} className="w-full justify-start gap-3 rounded-xl h-11 font-bold" onClick={() => setActiveView('inquiries')}>
            <HelpCircle size={18} /> Student Inquiries
          </Button>
          <Button variant={activeView === 'notices' ? 'default' : 'ghost'} className="w-full justify-start gap-3 rounded-xl h-11 font-bold" onClick={() => setActiveView('notices')}>
            <Bell size={18} /> Notice Board
          </Button>
          <Button variant={activeView === 'gallery' ? 'default' : 'ghost'} className="w-full justify-start gap-3 rounded-xl h-11 font-bold" onClick={() => setActiveView('gallery')}>
            <ImageIcon size={18} /> Gallery Card
          </Button>
          <div className="h-px bg-zinc-100 my-4" />
          <Button variant={activeView === 'staff' ? 'default' : 'ghost'} className="w-full justify-start gap-3 rounded-xl h-11 font-bold" onClick={() => setActiveView('staff')}>
            <ShieldCheck size={18} /> Staff Details
          </Button>
        </nav>
        <Button variant="outline" className="w-full rounded-xl border-2 font-black uppercase text-xs tracking-widest" onClick={() => onNavigate('home')}>Exit Portal</Button>
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        {activeView === 'students' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex justify-between items-center"><h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-800">Student Access</h1><Button className="bg-blue-700 h-12 px-6 rounded-xl font-bold text-white shadow-lg" onClick={() => setIsRegModalOpen(true)}><UserPlus className="mr-2"/> Enroll Student</Button></header>
            <Card className="shadow-sm p-4 flex items-center gap-3 rounded-2xl border bg-white"><Search className="text-slate-400 size-5" /><Input placeholder="Search students..." className="border-none shadow-none focus-visible:ring-0 text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></Card>
            <Card className="shadow-md border-none rounded-3xl overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-zinc-950"><TableRow>
                  <TableHead className="text-white font-bold py-5 pl-8">Student Detail</TableHead>
                  <TableHead className="text-white font-bold">Contact Info</TableHead>
                  <TableHead className="text-white font-bold">Access Folders</TableHead>
                  <TableHead className="text-white font-bold text-center">Fee Status</TableHead>
                  <TableHead className="text-white text-right pr-8 font-bold">Manage</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredStudents.map((s) => (
                    <TableRow key={s.id} className={cn(s.is_suspended && "opacity-50 grayscale", "border-zinc-50")}>
                      <TableCell className="py-6 pl-8">
                        <div className="font-black uppercase text-sm text-slate-800">{s.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-bold italic lowercase">{s.academic_year || "---"} Exam Year</div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 font-bold text-slate-600 text-xs"><Phone size={12} className="text-teal-600"/> {s.phone_number || "N/A"}</div>
                            <div className="text-[10px] text-slate-400 font-medium lowercase">{s.email}</div>
                         </div>
                      </TableCell>
                      <TableCell><div className="flex gap-1 flex-wrap">{s.enrolled_folders?.map((f:any, i:number) => (<Badge key={i} className="bg-blue-50 text-blue-700 border-none text-[9px] font-black uppercase">{f.year} {f.title}</Badge>)) || <span className="text-xs text-slate-300 italic">None</span>}</div></TableCell>
                      <TableCell className="text-center"><Button variant="ghost" size="sm" onClick={() => toggleStatus(s.id, 'is_paid', s.is_paid)} className={cn("rounded-full px-4 h-8 font-black text-[10px] tracking-widest", s.is_paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>{s.is_paid ? 'PAID' : 'PENDING'}</Button></TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreVertical size={18}/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl">
                          {classes.map(c => { const isEnrolled = s.enrolled_folders?.some((f: any) => f.id === c.id); return (<DropdownMenuItem key={c.id} onClick={() => toggleClassAssignment(s.id, c.id)} className="flex justify-between items-center text-xs font-bold px-3"><span>{c.year} {c.title}</span>{isEnrolled && <Check size={14} className="text-blue-600" />}</DropdownMenuItem>); })}
                          <div className="h-px bg-slate-100 my-2" /><DropdownMenuItem className="gap-2 font-bold" onClick={() => toggleStatus(s.id, 'is_suspended', s.is_suspended)}><Ban size={16}/> {s.is_suspended ? 'Activate' : 'Suspend'}</DropdownMenuItem><DropdownMenuItem className="text-red-600 gap-2 font-bold" onClick={() => removeStudent(s.id)}><Trash2 size={16}/> Delete Account</DropdownMenuItem>
                        </DropdownMenuContent></DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeView === 'staff' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <header><h1 className="text-4xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">Administrators</h1></header>
                <Card className="p-8 rounded-[2.5rem] shadow-xl border-none bg-white">
                    <div className="grid grid-cols-3 gap-4 items-end">
                        <div className="space-y-1"><Label>Full Name</Label><Input value={newStaff.fullName} onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Email</Label><Input value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} /></div>
                        <div className="space-y-1"><Label>Password</Label><Input type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} /></div>
                    </div>
                    <Button className="w-full mt-6 py-6 font-black uppercase text-xs tracking-widest bg-slate-900 text-white rounded-2xl" onClick={handleAddAdmin}>Register New Admin</Button>
                </Card>
                <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-md bg-white">
                    <Table>
                        <TableHeader className="bg-slate-900"><TableRow>
                            <TableHead className="text-white py-6 pl-10 font-black uppercase text-[10px] tracking-widest">Admin Name</TableHead>
                            <TableHead className="text-white text-right pr-10 font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {staff.map(s => (
                                <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50">
                                    <TableCell className="py-6 pl-10">
                                        <div className="font-black uppercase text-sm italic">{s.full_name}</div>
                                        <div className="text-[10px] font-bold text-slate-400">{s.email}</div>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <Button variant="ghost" className="text-rose-500 font-black text-[10px] uppercase hover:bg-rose-50 rounded-xl" onClick={() => removeAdmin(s.id)}>Revoke Access</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        )}

        {selectedClass && activeView === 'classes' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => setSelectedClass(null)} className="gap-2 font-bold"><ChevronLeft size={16}/> Folders</Button>
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border shadow-sm">
                <div><h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">{selectedClass.title}</h1><p className="text-teal-600 font-bold uppercase text-[10px] tracking-widest">{selectedClass.institute_name} • {selectedClass.year}</p></div>
                <div className="flex gap-2"><Button variant="outline" className="rounded-xl font-bold" onClick={() => setEditClassData(selectedClass)}><Pencil className="mr-2 size-4"/> Edit</Button><Button variant="destructive" size="icon" className="rounded-xl" onClick={() => handleDeleteClass(selectedClass.id)}><Trash2 size={18}/></Button></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <Card className="p-6 rounded-[2.5rem] bg-white shadow-xl border-t-8 border-slate-900">
                    <CardTitle className="flex gap-2 items-center mb-4 italic uppercase text-lg text-slate-800"><MessageSquare size={20}/> Message Enrolled Students</CardTitle>
                    <Textarea placeholder="Post an update..." className="mb-4 rounded-2xl bg-slate-50 border-none p-4 font-medium" value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                    <Button className="w-full font-black uppercase text-xs tracking-widest bg-teal-600 text-white h-14 rounded-2xl shadow-lg" onClick={handleSendMessage}><Send size={14} className="mr-2"/> Post Message</Button>
                    <div className="mt-8 space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {classMessages.map(m => (
                            <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border group relative">
                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-1"><span>{m.sender_name}</span><span>{new Date(m.created_at).toLocaleDateString()}</span></div>
                                <p className="text-sm font-medium text-slate-700 pr-8">{m.message_text}</p>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-full" onClick={() => handleDeleteMessage(m.id)}><Trash2 size={14}/></Button>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="p-6 rounded-[2.5rem] bg-white shadow-md space-y-4">
                  <CardTitle className="flex gap-2 items-center italic uppercase text-lg text-slate-800"><Upload size={20}/> Upload Materials</CardTitle>
                  <Input placeholder="Title" className="h-12 rounded-xl" value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} />
                  {newContent.type === 'video' ? (<Input placeholder="Link" className="h-12 rounded-xl" value={newContent.url} onChange={e => setNewContent({...newContent, url: e.target.value})} />) : (<div className="border-2 border-dashed p-6 rounded-[1.5rem] text-center bg-slate-50 relative"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" id="file-up" onChange={handleFileUpload} /><Label htmlFor="file-up" className="cursor-pointer font-black uppercase text-[10px] tracking-widest text-slate-400">{uploading ? "Wait..." : (newContent.url ? "File Attached ✅" : "Select PDF")}</Label></div>)}
                  <div className="flex gap-2 pt-2"><Button variant={newContent.type === 'video' ? 'default' : 'outline'} className="flex-1 rounded-xl" onClick={() => setNewContent(p => ({...p, type: 'video', url: ''}))}>Video URL</Button><Button variant={newContent.type === 'note' ? 'default' : 'outline'} className="flex-1 rounded-xl" onClick={() => setNewContent(p => ({...p, type: 'note', url: ''}))}>PDF Handout</Button></div>
                  <Button className="w-full py-7 font-black uppercase text-xs tracking-widest bg-slate-900 text-white rounded-2xl shadow-xl" onClick={handleAddContent} disabled={uploading}>Confirm Upload</Button>
                </Card>
              </div>
              <div className="space-y-8">
                <Card className="p-8 rounded-[2.5rem] bg-white shadow-md border-none">
                    <CardTitle className="mb-6 italic uppercase text-lg text-slate-800 flex justify-between">Folder Content <Badge className="bg-slate-100 text-slate-500 border-none font-bold">{classContent.length}</Badge></CardTitle>
                    <Table><TableBody>{classContent.map(item => (
                        <TableRow key={item.id} className="group border-slate-50 hover:bg-slate-50"><TableCell className="py-4 font-black uppercase text-xs tracking-tight text-slate-700"><div className="flex items-center gap-3"><div className={cn("p-2 rounded-lg", item.type === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500')}>{item.type === 'video' ? <Video size={16}/> : <FileText size={16}/>}</div>{item.title}</div></TableCell><TableCell><a href={item.url} target="_blank" className="p-2 bg-slate-100 rounded-lg inline-block hover:bg-teal-500 text-slate-700 transition-all"><ExternalLink size={14}/></a></TableCell><TableCell className="text-right pr-0"><Button variant="ghost" size="icon" className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDeleteContent(item.id)}><Trash2 size={16}/></Button></TableCell></TableRow>
                    ))}</TableBody></Table>
                 </Card>
                 <Card className="p-8 rounded-[2.5rem] bg-white shadow-xl">
                    <CardTitle className="flex items-center gap-2 italic uppercase text-lg text-slate-800 mb-6"><Trophy className="text-yellow-500"/> Marks Console</CardTitle>
                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-teal-500/30">
                        <Label className="text-[9px] font-black uppercase text-teal-600 tracking-widest ml-1">Current Exam</Label>
                        <Input placeholder="Unit Test #01" value={examName} onChange={e => setExamName(e.target.value)} className="mt-1 font-black uppercase h-12 bg-white border-none shadow-sm"/>
                    </div>
                    <Table>
                        <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="font-black uppercase text-[10px]">Student</TableHead><TableHead className="font-black uppercase text-[10px]">Score %</TableHead><TableHead className="text-right font-black uppercase text-[10px]">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {classStudents.map(student => {
                                const res = existingResults.find(r => r.student_id === student.id);
                                return (
                                    <TableRow key={student.id} className="border-slate-50">
                                        <TableCell className="font-bold text-xs uppercase text-slate-700">{student.full_name}</TableCell>
                                        <TableCell><Input type="number" className="w-16 h-10 font-black text-teal-600 bg-slate-50 border-none shadow-inner" placeholder="0" value={studentMarks[student.id] || ""} onChange={(e) => setStudentMarks({...studentMarks, [student.id]: e.target.value})} /></TableCell>
                                        <TableCell className="text-right flex gap-1 justify-end pt-5">
                                            <Button size="sm" variant="outline" className="h-10 px-4 rounded-xl font-bold uppercase text-[10px] border-2" onClick={() => handleSaveMark(student.id, student.full_name, student.school_name)}>Add</Button>
                                            {res && res.is_public && ( <Button size="sm" variant="ghost" className="h-10 w-10 p-0" onClick={() => handleHideFromPublic(res.id)}><EyeOff size={14} className="text-rose-500"/></Button> )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeView === 'classes' && !selectedClass && (
          <div className="space-y-6">
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">Course Management</h1>
            <Card className="p-8 border-dashed border-2 bg-white/50 rounded-[2.5rem]">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-1"><Label>Year</Label><Input placeholder="2026" value={newClass.year} onChange={e => setNewClass({...newClass, year: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Course Name</Label><Input placeholder="Logic" value={newClass.title} onChange={e => setNewClass({...newClass, title: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Institute</Label><Input placeholder="Sakya" value={newClass.institute_name} onChange={e => setNewClass({...newClass, institute_name: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Type</Label><select className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm" value={newClass.type} onChange={e => setNewClass({...newClass, type: e.target.value})}><option value="Theory">Theory</option><option value="Revision">Revision</option></select></div>
                  <div className="space-y-1"><Label>Category</Label><select className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm" value={newClass.class_category} onChange={e => setNewClass({...newClass, class_category: e.target.value})}><option value="Group">Group Class</option><option value="Hall">Hall Class</option></select></div>
                  <div className="space-y-1"><Label>Day</Label><Input placeholder="Sunday" value={newClass.class_day} onChange={e => setNewClass({...newClass, class_day: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Time</Label><Input placeholder="8:30 AM" value={newClass.class_time} onChange={e => setNewClass({...newClass, class_time: e.target.value})} /></div>
                  <Button onClick={handleCreateClass} className="w-full mt-auto py-6 font-black uppercase text-xs tracking-widest bg-slate-900 text-white rounded-2xl shadow-xl">Create New Folder</Button>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              {classes.map(c => (
                <Card key={c.id} className="hover:border-teal-500 cursor-pointer transition-all shadow-xl group relative rounded-[2.5rem] overflow-hidden bg-white border border-slate-100" onClick={() => setSelectedClass(c)}>
                  <CardHeader className="p-8"><Badge variant="secondary" className="w-fit mb-3 font-bold">{c.year} {c.type}</Badge><CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 leading-tight">{c.title}</CardTitle><div className="mt-4 space-y-1 text-slate-500"><p className="flex items-center gap-2 text-sm font-bold"><School size={14} className="text-teal-600"/> {c.institute_name}</p><p className="flex items-center gap-2 text-xs font-medium"><Clock size={14}/> {c.class_day} @ {c.class_time}</p></div></CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'gallery' && (
          <div className="max-w-6xl mx-auto space-y-10">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-800">Visual Archive</h1>
            <Card className="p-8 border-dashed border-2 rounded-[2rem] bg-white">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1"><Label>Album Name</Label><Input value={newGalleryName} onChange={e => setNewGalleryName(e.target.value)} /></div>
                  <div className="border-2 border-dashed rounded-xl p-8 text-center bg-zinc-50 relative">
                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleGalleryUpload}/>
                    <ImageIcon className="mx-auto size-10 text-zinc-400 mb-2"/>
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">{uploading ? "Uploading..." : "Click to Add Images"}</p>
                  </div>
                  <Button className="w-full py-6 bg-slate-900 text-white rounded-2xl shadow-xl font-bold uppercase tracking-widest" onClick={handleSaveGallery}>Save to Gallery</Button>
                </div>
                <div className="grid grid-cols-4 gap-2 h-fit">
                   {galleryImages.map((img, i) => ( <img key={i} src={img} className="size-20 object-cover rounded-xl border shadow-sm"/> ))}
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
              {galleries.map((gal) => (
                <Card key={gal.id} className="relative group overflow-hidden rounded-[2.5rem] shadow-xl border-none">
                  <img src={gal.image_urls[0]} className="h-56 w-full object-cover transition-transform group-hover:scale-110 duration-700" alt={gal.name}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8"><h3 className="text-white font-black uppercase italic text-xl">{gal.name}</h3></div>
                  <Button variant="destructive" size="icon" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg" onClick={() => handleDeleteGallery(gal.id, gal.image_urls)}><Trash2 size={16}/></Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'notices' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header><h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-800">Public Announcements</h1></header>
            <Card className="p-8 rounded-[2.5rem] shadow-xl border-none bg-white">
              <div className="space-y-4">
                <div className="space-y-1"><Label>Notice Subject</Label><Input value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} /></div>
                <div className="space-y-1"><Label>Content</Label><Textarea rows={4} value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} /></div>
                <Button className="w-full py-6 font-black bg-slate-900 text-white rounded-2xl shadow-lg" onClick={handlePostNotice}>Deploy to Portal</Button>
              </div>
            </Card>
            <div className="grid gap-4">
              {notices.map(nt => (
                <Card key={nt.id} className="p-6 rounded-3xl flex justify-between items-center shadow-sm border-none bg-white">
                  <div><h3 className="font-black uppercase italic tracking-tight">{nt.title}</h3><p className="text-[10px] text-zinc-400 font-bold mb-2">{new Date(nt.created_at).toLocaleString()}</p><p className="text-sm text-zinc-500 max-w-xl leading-relaxed">{nt.content}</p></div>
                  <Button variant="ghost" size="icon" className="text-rose-500 rounded-full hover:bg-rose-50" onClick={() => deleteNotice(nt.id)}><Trash2 size={18}/></Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'inquiries' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                <header><h1 className="text-4xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">Student Inquiries</h1></header>
                <div className="grid gap-6">
                    {allQuestions.map(q => (
                        <Card key={q.id} className={cn("p-6 rounded-[2rem] border-none shadow-xl bg-white", !q.is_resolved && 'ring-2 ring-teal-500')}>
                            <div className="flex justify-between items-start mb-4">
                                <div><h3 className="font-black text-slate-800 uppercase text-lg">{q.student_name}</h3><p className="text-[10px] font-bold text-slate-400">{new Date(q.created_at).toLocaleString()}</p></div>
                                {q.is_resolved ? <Badge className="bg-teal-500 text-white">Replied</Badge> : <Badge className="bg-rose-500 text-white animate-pulse">Pending</Badge>}
                            </div>
                            <p className="text-slate-600 font-medium mb-6 bg-slate-50 p-4 rounded-2xl border">Q: {q.question_text}</p>
                            {!q.is_resolved ? (
                                <div className="flex gap-2">
                                    <Input placeholder="Type your reply..." className="h-12 rounded-xl" value={replyText[q.id] || ""} onChange={(e) => setReplyText({...replyText, [q.id]: e.target.value})} />
                                    <Button onClick={() => submitReply(q.id)} className="bg-teal-600 h-12 px-8 rounded-xl font-bold uppercase text-xs tracking-widest text-white">Deliver Reply</Button>
                                </div>
                            ) : (
                                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100"><p className="text-[10px] font-black text-teal-700 uppercase mb-1">Reply:</p><p className="text-sm font-medium text-slate-700 italic">"{q.admin_reply}"</p></div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        )}

        <Dialog open={isRegModalOpen} onOpenChange={setIsRegModalOpen}>
            <DialogContent className="rounded-[2.5rem] max-w-lg p-12 border-none shadow-2xl bg-white">
                <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">Enroll Student</DialogTitle><DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Initialize a new logic portal account.</DialogDescription></DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1"><Label>Full Name</Label><Input value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Email Address</Label><Input value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Password</Label><Input type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Exam Year</Label><Input placeholder="e.g. 2026" value={regData.academicYear} onChange={e => setRegData({...regData, academicYear: e.target.value})} /></div>
                    <div className="space-y-1"><Label>Phone Number</Label><Input value={regData.phoneNumber} onChange={e => setRegData({...regData, phoneNumber: e.target.value})} /></div>
                    <div className="col-span-2 space-y-1"><Label>School Name</Label><Input value={regData.schoolName} onChange={e => setRegData({...regData, schoolName: e.target.value})} /></div>
                </div>
                <Button className="w-full py-7 font-black uppercase text-xs tracking-widest bg-slate-900 text-white rounded-2xl mt-6 shadow-xl" onClick={handleRegisterStudent} disabled={loading}>Create & Authenticate</Button>
            </DialogContent>
        </Dialog>
        
        {editClassData && (<Dialog open={!!editClassData} onOpenChange={() => setEditClassData(null)}><DialogContent className="rounded-3xl max-w-lg p-12 shadow-2xl border-none bg-white"><DialogHeader><DialogTitle className="text-2xl font-black italic uppercase text-slate-800">Modify Folder</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-4 py-4"><div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Title</Label><Input value={editClassData.title || ""} onChange={e => setEditClassData({...editClassData, title: e.target.value})} /></div><div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Year</Label><Input value={editClassData.year || ""} onChange={e => setEditClassData({...editClassData, year: e.target.value})} /></div><div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Institute</Label><Input value={editClassData.institute_name || ""} onChange={e => setEditClassData({...editClassData, institute_name: e.target.value})} /></div><div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Day</Label><Input value={editClassData.class_day || ""} onChange={e => setEditClassData({...editClassData, class_day: e.target.value})} /></div><div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Time</Label><Input value={editClassData.class_time || ""} onChange={e => setEditClassData({...editClassData, class_time: e.target.value})} /></div><div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</Label><select className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm" value={editClassData.type || ""} onChange={e => setEditClassData({...editClassData, type: e.target.value})}><option value="Theory">Theory</option><option value="Revision">Revision</option></select></div><div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</Label><select className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm" value={editClassData.class_category || ""} onChange={e => setEditClassData({...editClassData, class_category: e.target.value})}><option value="Group">Group Class</option><option value="Hall">Hall Class</option></select></div></div><Button onClick={handleUpdateClass} className="w-full py-7 font-black bg-slate-900 text-white rounded-2xl uppercase text-[10px] tracking-widest">Commit Changes</Button></DialogContent></Dialog>)}
      </main>
    </div>
  );
}