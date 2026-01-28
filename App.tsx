
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Briefcase, 
  HelpCircle, 
  ClipboardCheck, 
  Bell, 
  User, 
  Plus, 
  ArrowRight,
  Search,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Download,
  CheckCircle2,
  Info,
  FileDown,
  GripVertical,
  X,
  Zap,
  Star,
  Trophy,
  AlertCircle,
  Link as LinkIcon,
  GraduationCap,
  Globe,
  FileText as DocIcon,
  Languages
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as docx from 'docx';
import { SyllabusResult, GeneratedContent, ViewState, SyllabusTopic, DifficultyLevel, AppLanguage } from './types';
import { generateSyllabus, generateDetailedContent } from './geminiService';

const translations = {
  uz: {
    appName: "Ustoz Pro",
    dashboard: "Asosiy Panel",
    createSyllabus: "Syllabus Yaratish",
    myCourses: "Mening Kurslarim",
    archived: "Arxivlangan",
    newLesson: "Yangi Dars",
    syllabusGen: "Syllabus Generatsiyasi",
    standard: "Dunyodagi eng yaxshi ta'lim standartlari asosida",
    subjectName: "Fan nomi va yo'nalishi",
    difficulty: "Murakkablik darajasi",
    topicCount: "Mavzular soni (Dars haftalari)",
    generateBtn: "Syllabus Generatsiya Qilish",
    generating: "Syllabus tayyorlanmoqda...",
    beginner: "Boshlang'ich",
    intermediate: "O'rta",
    advanced: "Yuqori",
    searchPlaceholder: "Mavzulardan qidirish...",
    dragHint: "💡 Darslarni o'rnini almashtirish uchun kartochkalarni sudrab (Drag-and-drop) o'tkazing.",
    createMaterials: "Materiallarni Yaratish",
    deepAnalysis: "Chuqur Tahlil Ketmoqda...",
    analysisDesc: "Ushbu dars uchun 3000+ so'zlik ma'ruza matni, keyslar, 20 ta savol va 30 ta test shakllantirilmoqda.",
    lectureNote: "Ma'ruza Matni",
    eduCase: "Educational Case",
    kazus: "Kazus",
    questions: "20+ Savollar",
    tests: "30+ Testlar",
    back: "Ortga",
    downloadPDF: "PDF Yuklash",
    downloadDocx: "Word (DOCX)",
    downloadConfirmTitle: "Yuklab olishni tasdiqlang",
    confirmYes: "Ha, yuklayman",
    confirmNo: "Yo'q",
    sourcesTitle: "Asos Bo'lgan Syllabuslar (Reference)",
    viewSource: "Manbani ko'rish"
  },
  en: {
    appName: "Ustoz Pro",
    dashboard: "Dashboard",
    createSyllabus: "Create Syllabus",
    myCourses: "My Courses",
    archived: "Archived",
    newLesson: "New Lesson",
    syllabusGen: "Syllabus Generation",
    standard: "Based on world-class education standards",
    subjectName: "Subject Name & Direction",
    difficulty: "Difficulty Level",
    topicCount: "Number of Topics (Weeks)",
    generateBtn: "Generate Syllabus",
    generating: "Preparing syllabus...",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    searchPlaceholder: "Search topics...",
    dragHint: "💡 Drag and drop cards to reorder lessons.",
    createMaterials: "Generate Materials",
    deepAnalysis: "Deep Analysis in Progress...",
    analysisDesc: "Formulating 3000+ word lecture notes, cases, 20 questions, and 30 tests for this lesson.",
    lectureNote: "Lecture Notes",
    eduCase: "Educational Case",
    kazus: "Case Study",
    questions: "20+ Questions",
    tests: "30+ Tests",
    back: "Back",
    downloadPDF: "Download PDF",
    downloadDocx: "Word (DOCX)",
    downloadConfirmTitle: "Confirm Download",
    confirmYes: "Yes, download",
    confirmNo: "No",
    sourcesTitle: "Reference Syllabuses",
    viewSource: "View Source"
  },
  ru: {
    appName: "Ustoz Pro",
    dashboard: "Панель управления",
    createSyllabus: "Создать Силлабус",
    myCourses: "Мои курсы",
    archived: "Архив",
    newLesson: "Новый урок",
    syllabusGen: "Генерация Силлабуса",
    standard: "На основе мировых образовательных стандартов",
    subjectName: "Название предмета",
    difficulty: "Уровень сложности",
    topicCount: "Количество тем (недель)",
    generateBtn: "Генерировать Силлабус",
    generating: "Подготовка силлабуса...",
    beginner: "Начальный",
    intermediate: "Средний",
    advanced: "Продвинутый",
    searchPlaceholder: "Поиск тем...",
    dragHint: "💡 Перетаскивайте карточки, чтобы изменить порядок уроков.",
    createMaterials: "Создать материалы",
    deepAnalysis: "Идет глубокий анализ...",
    analysisDesc: "Формируются конспекты лекций (3000+ слов), кейсы, 20 вопросов и 30 тестов.",
    lectureNote: "Текст лекции",
    eduCase: "Учебный кейс",
    kazus: "Казус (ситуация)",
    questions: "20+ Вопросов",
    tests: "30+ Тестов",
    back: "Назад",
    downloadPDF: "Скачать PDF",
    downloadDocx: "Word (DOCX)",
    downloadConfirmTitle: "Подтвердите загрузку",
    confirmYes: "Да, скачать",
    confirmNo: "Нет",
    sourcesTitle: "Эталонные силлабусы (Источники)",
    viewSource: "Просмотреть источник"
  }
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-6 py-4 transition-colors ${
      active ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const ActionCard = ({ title, subtitle, icon: Icon, buttonLabel, onClick }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50/50 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{subtitle}</p>
      </div>
      <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-end justify-between">
      <button 
        onClick={onClick}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700 transition-colors"
      >
        <span>{buttonLabel}</span>
        <ArrowRight size={18} />
      </button>
      <div className="relative">
         <div className="w-16 h-16 bg-blue-50 rounded-full opacity-50 flex items-center justify-center">
            <Icon size={32} className="text-blue-200" />
         </div>
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ isOpen, onClose, onConfirm, message, t }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, message: string, t: any }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">{t.downloadConfirmTitle}</h3>
          <p className="text-slate-500 mb-8">{message}</p>
          <div className="flex w-full space-x-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              {t.confirmNo}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              {t.confirmYes}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<AppLanguage>('uz');
  const t = translations[lang];
  
  const [view, setView] = useState<ViewState>('dashboard');
  const [activeTab, setActiveTab] = useState<ActiveTab>('lecture');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [topicCount, setTopicCount] = useState(14);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [syllabus, setSyllabus] = useState<SyllabusResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<SyllabusTopic | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });

  const difficultyOptions = [
    { value: 'beginner', label: t.beginner, icon: Zap, color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'intermediate', label: t.intermediate, icon: Star, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'advanced', label: t.advanced, icon: Trophy, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  const handleCreateSyllabus = async () => {
    if (!subject) return;
    setLoading(true);
    setSearchQuery('');
    try {
      const result = await generateSyllabus(subject, topicCount, difficulty, lang);
      setSyllabus(result);
      setView('view-syllabus');
    } catch (err) {
      alert("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async (topic: SyllabusTopic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setView('generating-content');
    try {
      const result = await generateDetailedContent(topic.title, syllabus?.subject || '', syllabus?.difficulty || difficulty, lang);
      setContent(result);
      setView('content-viewer');
      setActiveTab('lecture');
    } catch (err) {
      alert("Error occurred. Please try again.");
      setView('view-syllabus');
    } finally {
      setLoading(false);
    }
  };

  const executePDFGeneration = (title: string, data: { heading: string, body: string | string[] }[]) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let y = 30;

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin, 35);
    y = 70;

    data.forEach(section => {
      if (y > pageHeight - 40) { doc.addPage(); y = 30; }
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text(section.heading, margin, y);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 15;
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      const contentList = Array.isArray(section.body) ? section.body : [section.body];
      contentList.forEach(item => {
        const lines = doc.splitTextToSize(item, maxWidth);
        lines.forEach((line: string) => {
          if (y > pageHeight - 20) { doc.addPage(); y = 30; }
          doc.text(line, margin, y);
          y += 7;
        });
        y += 5;
      });
      y += 10;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`${t.appName} | Page ${i} / ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  const executeDocxGeneration = async (title: string, data: { heading: string, body: string | string[] }[]) => {
    const sections = data.map(section => {
      const contentList = Array.isArray(section.body) ? section.body : [section.body];
      return [
        new docx.Paragraph({
          text: section.heading,
          heading: docx.HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        ...contentList.map(item => 
          new docx.Paragraph({
            children: [new docx.TextRun({ text: item, size: 24 })],
            spacing: { after: 120 },
          })
        ),
      ];
    }).flat();

    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            text: title,
            heading: docx.HeadingLevel.TITLE,
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...sections
        ],
      }],
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSyllabusPDF = () => {
    if (!syllabus) return;
    setConfirmModal({
      isOpen: true,
      message: `Confirm PDF download for ${syllabus.subject}?`,
      onConfirm: () => {
        const diffLabel = difficultyOptions.find(o => o.value === syllabus.difficulty)?.label || syllabus.difficulty;
        executePDFGeneration(`${syllabus.subject}_Syllabus`, [
          { heading: t.appName, body: [`Subject: ${syllabus.subject}`, `Difficulty: ${diffLabel}`, `Topics: ${syllabus.topics.length}`] },
          { heading: "Curriculum", body: syllabus.topics.map(t => `Week ${t.week}: ${t.title}\n${t.description}`) },
          { heading: "References", body: syllabus.sources.map(s => `${s.university}: ${s.title}`) }
        ]);
      }
    });
  };

  const handleDownloadSyllabusDocx = () => {
    if (!syllabus) return;
    setConfirmModal({
      isOpen: true,
      message: `Confirm Word (DOCX) download for ${syllabus.subject}?`,
      onConfirm: () => {
        const diffLabel = difficultyOptions.find(o => o.value === syllabus.difficulty)?.label || syllabus.difficulty;
        executeDocxGeneration(`${syllabus.subject} Syllabus`, [
          { heading: "Overview", body: [`Subject: ${syllabus.subject}`, `Level: ${diffLabel}`, `Weeks: ${syllabus.topics.length}`] },
          { heading: "Weekly Schedule", body: syllabus.topics.map(t => `Week ${t.week}: ${t.title} - ${t.description}`) },
          { heading: "Sources", body: syllabus.sources.map(s => `${s.university}: ${s.title} (${s.url})`) }
        ]);
      }
    });
  };

  const handleDownloadMaterialPDF = () => {
    if (!content || !selectedTopic) return;
    setConfirmModal({
      isOpen: true,
      message: `Confirm PDF download for ${selectedTopic.title}?`,
      onConfirm: () => {
        executePDFGeneration(`${selectedTopic.title} Materials`, [
          { heading: "Lecture", body: content.lectureNote },
          { heading: "Case Study", body: content.educationalCase },
          { heading: "Questions", body: content.questions },
          { heading: "Tests", body: content.tests.map(t => `${t.question}\nCorrect: ${t.correctAnswer}`) }
        ]);
      }
    });
  };

  const handleDownloadMaterialDocx = () => {
    if (!content || !selectedTopic) return;
    setConfirmModal({
      isOpen: true,
      message: `Confirm Word (DOCX) download for ${selectedTopic.title}?`,
      onConfirm: () => {
        executeDocxGeneration(`${selectedTopic.title} Lesson Materials`, [
          { heading: t.lectureNote, body: content.lectureNote },
          { heading: t.eduCase, body: content.educationalCase },
          { heading: t.kazus, body: content.kazus },
          { heading: t.questions, body: content.questions },
          { heading: t.tests, body: content.tests.map(t => `${t.question}\nOptions: ${t.options.join(', ')}\nAnswer: ${t.correctAnswer}`) }
        ]);
      }
    });
  };

  const filteredTopics = syllabus?.topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen flex text-slate-800 bg-[#f8fafc]">
      <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} t={t} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={confirmModal.onConfirm} />

      <aside className="w-72 bg-blue-900 flex flex-col fixed h-full z-10 shadow-2xl no-print">
        <div className="p-8 flex items-center space-x-3 text-white">
          <div className="bg-white p-2 rounded-xl text-blue-900 shadow-lg"><BookOpen size={28} /></div>
          <span className="text-2xl font-black tracking-tight uppercase">{t.appName}</span>
        </div>
        <nav className="flex-1 mt-4">
          <SidebarItem icon={LayoutDashboard} label={t.dashboard} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem icon={FileText} label={t.createSyllabus} active={view === 'create-syllabus' || view === 'view-syllabus'} onClick={() => setView('create-syllabus')} />
        </nav>
        <div className="p-6 bg-blue-950/50 mt-auto">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">AU</div>
             <div><p className="text-sm font-bold text-white">Azizbek Ustoz</p><p className="text-xs text-blue-300">Pro Teacher</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72">
        <header className="bg-white/80 backdrop-blur-md px-10 py-6 flex justify-between items-center border-b border-slate-200 sticky top-0 z-20 no-print">
          <div><h1 className="text-2xl font-bold text-slate-900">{t.appName}</h1></div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
               {(['uz', 'en', 'ru'] as AppLanguage[]).map(l => (
                 <button 
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {l}
                 </button>
               ))}
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <button className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition-all">
              <Plus size={18} /><span>{t.newLesson}</span>
            </button>
          </div>
        </header>

        <div className="p-10">
          {view === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ActionCard title={t.createSyllabus} subtitle="Top university standard syllabus generation." icon={FileText} buttonLabel="Start" onClick={() => setView('create-syllabus')} />
              <ActionCard title={t.lectureNote} subtitle="3000+ words detailed lecture notes." icon={BookOpen} buttonLabel="View" onClick={() => {}} />
              <ActionCard title={t.eduCase} subtitle="Problem-solution based cases." icon={Briefcase} buttonLabel="Prepare" onClick={() => {}} />
              <ActionCard title={t.tests} subtitle="30+ MCQ questions." icon={ClipboardCheck} buttonLabel="Enter" onClick={() => {}} />
              <ActionCard title={t.questions} subtitle="20+ comprehension questions." icon={HelpCircle} buttonLabel="Create" onClick={() => {}} />
            </div>
          )}

          {view === 'create-syllabus' && (
            <div className="max-w-3xl mx-auto bg-white rounded-[2rem] p-12 shadow-xl border border-slate-100 animate-in zoom-in">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4"><FileText size={40} /></div>
                <h2 className="text-3xl font-black text-slate-900">{t.syllabusGen}</h2>
                <p className="text-slate-500 mt-2">{t.standard}</p>
              </div>
              <div className="space-y-8">
                <div><label className="block text-sm font-bold text-slate-700 mb-3">{t.subjectName}</label>
                  <input type="text" placeholder="e.g. Artificial Intelligence" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-lg" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-3">{t.difficulty}</label>
                  <div className="grid grid-cols-3 gap-4">
                    {difficultyOptions.map((opt) => (
                      <button key={opt.value} onClick={() => setDifficulty(opt.value as DifficultyLevel)} className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all space-y-2 ${difficulty === opt.value ? `${opt.color} ring-4 ring-blue-500/10` : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}><opt.icon size={24} /><span className="font-bold text-sm">{opt.label}</span></button>
                    ))}
                  </div>
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-3">{t.topicCount}</label>
                  <div className="flex items-center space-x-4"><input type="range" min="1" max="30" step="1" className="flex-1 accent-blue-600" value={topicCount} onChange={(e) => setTopicCount(parseInt(e.target.value))} /><span className="w-16 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">{topicCount}</span></div>
                </div>
                <button disabled={loading || !subject} onClick={handleCreateSyllabus} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-3 disabled:opacity-50">{loading ? <><Loader2 className="animate-spin" /><span>{t.generating}</span></> : <>{t.generateBtn}<ArrowRight size={24} /></>}</button>
              </div>
            </div>
          )}

          {view === 'view-syllabus' && syllabus && (
            <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in">
               <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl border shadow-sm no-print gap-6">
                <button onClick={() => setView('create-syllabus')} className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"><ChevronLeft size={24} /><span>{t.back}</span></button>
                <div className="text-center">
                   <div className="flex items-center justify-center space-x-2 mb-1"><h2 className="text-2xl font-black uppercase">{syllabus.subject}</h2><span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${difficultyOptions.find(o => o.value === syllabus.difficulty)?.color}`}>{difficultyOptions.find(o => o.value === syllabus.difficulty)?.label}</span></div>
                   <p className="text-sm text-blue-600 font-bold">{syllabus.topics.length} lesson course</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleDownloadSyllabusPDF} className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"><FileDown size={20} /></button>
                  <button onClick={handleDownloadSyllabusDocx} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"><DocIcon size={20} /></button>
                </div>
               </div>

               <div className="relative max-w-xl mx-auto no-print"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="text-slate-400" size={20} /></div><input type="text" placeholder={t.searchPlaceholder} className="w-full pl-12 pr-12 py-4 bg-white border rounded-2xl focus:outline-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredTopics.map((topic, index) => (
                   <div key={topic.id} className="bg-white rounded-[2rem] p-8 border transition-all group flex flex-col relative hover:shadow-xl">
                      <div className="flex justify-between items-start mb-6"><div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white">{topic.week}</div></div>
                      <h4 className="text-xl font-bold mb-3 leading-tight">{topic.title}</h4>
                      <p className="text-slate-500 text-sm mb-8 flex-1 line-clamp-3">{topic.description}</p>
                      <button onClick={() => handleGenerateContent(topic)} className="w-full py-4 bg-slate-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all">{t.createMaterials}</button>
                   </div>
                 ))}
               </div>

               {syllabus.sources && syllabus.sources.length > 0 && (
                 <div className="mt-16 no-print">
                   <div className="flex items-center space-x-3 mb-8"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><GraduationCap size={24} /></div><h3 className="text-2xl font-black">{t.sourcesTitle}</h3></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {syllabus.sources.map((source, idx) => (
                       <div key={idx} className="bg-white p-7 rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20"><Globe size={64} className="text-blue-900" /></div>
                         <div className="flex justify-between items-start mb-5"><span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1.5 rounded-xl">{source.university}</span><ExternalLink size={18} className="text-slate-300 group-hover:text-blue-600" /></div>
                         <h4 className="text-lg font-black text-slate-800 line-clamp-2 leading-snug flex-1 mb-6">{source.title}</h4>
                         <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-2xl transition-all font-bold text-sm w-fit"><LinkIcon size={16} /><span>{t.viewSource}</span></a>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          )}

          {view === 'generating-content' && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-pulse">
                <div className="relative"><div className="w-32 h-32 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center"><BookOpen className="text-blue-600" size={48} /></div></div>
                <div><h2 className="text-4xl font-black text-slate-900">{t.deepAnalysis}</h2><p className="text-slate-500 mt-4 text-xl max-w-lg mx-auto">{t.analysisDesc}</p></div>
             </div>
          )}

          {view === 'content-viewer' && selectedTopic && content && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-1000">
               <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl">
                  <div className="flex items-center justify-between mb-8 border-b pb-8 no-print">
                    <button onClick={() => setView('view-syllabus')} className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 font-bold"><ChevronLeft size={24} /><span>{t.back}</span></button>
                    <div className="text-center"><span className="text-xs font-black text-blue-600 uppercase tracking-widest">CONTENT HUB</span><h2 className="text-3xl font-black mt-1">{selectedTopic.title}</h2></div>
                    <div className="flex space-x-2">
                       <button onClick={handleDownloadMaterialPDF} className="flex items-center space-x-2 px-6 py-3 bg-red-600 rounded-2xl text-white hover:bg-red-700 transition-all font-bold"><FileDown size={20} /><span>PDF</span></button>
                       <button onClick={handleDownloadMaterialDocx} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition-all font-bold"><DocIcon size={20} /><span>DOCX</span></button>
                    </div>
                  </div>

                  <div className="flex p-2 bg-slate-100 rounded-[1.5rem] mb-10 overflow-x-auto gap-2 no-print">
                    {[
                      { id: 'lecture', label: t.lectureNote, icon: BookOpen },
                      { id: 'case', label: t.eduCase, icon: Briefcase },
                      { id: 'kazus', label: t.kazus, icon: ClipboardCheck },
                      { id: 'questions', label: t.questions, icon: HelpCircle },
                      { id: 'tests', label: t.tests, icon: CheckCircle2 },
                    ].map((tab) => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id as ActiveTab)} className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}><tab.icon size={20} /><span>{tab.label}</span></button>
                    ))}
                  </div>

                  <div className="min-h-[500px]">
                    {activeTab === 'lecture' && <div className="prose prose-blue max-w-none"><div className="bg-blue-50/50 p-10 rounded-[2rem] border text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">{content.lectureNote}</div></div>}
                    {activeTab === 'case' && <div className="bg-orange-50/50 p-10 rounded-[2rem] border text-slate-800 text-lg leading-relaxed whitespace-pre-wrap">{content.educationalCase}</div>}
                    {activeTab === 'kazus' && <div className="bg-purple-50/50 p-10 rounded-[2rem] border text-slate-800 text-lg leading-relaxed whitespace-pre-wrap">{content.kazus}</div>}
                    {activeTab === 'questions' && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{content.questions.map((q, i) => (<div key={i} className="bg-slate-50 p-6 rounded-2xl flex items-start space-x-4 border hover:bg-white transition-all"><div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 font-bold">{i+1}</div><p className="font-bold">{q}</p></div>))}</div>}
                    {activeTab === 'tests' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{content.tests.map((test, i) => (<div key={i} className="bg-white border p-8 rounded-3xl shadow-sm"><span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Test {i+1}</span><p className="font-bold mt-4 mb-6">{test.question}</p><div className="space-y-3">{test.options.map((opt, idx) => (<div key={idx} className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600">{opt}</div>))}</div><div className="mt-6 pt-6 border-t flex items-center justify-between"><span className="text-xs font-black text-slate-400">Answer:</span><span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-black">{test.correctAnswer}</span></div></div>))}</div>}
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

type ActiveTab = 'lecture' | 'case' | 'kazus' | 'questions' | 'tests';
