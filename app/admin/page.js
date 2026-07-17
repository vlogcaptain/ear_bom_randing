'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Users, 
    ClipboardList, 
    Search, 
    Filter, 
    ExternalLink, 
    LogOut, 
    Clock, 
    CheckCircle2,
    ChevronRight,
    RefreshCcw,
    Loader2,
    MessageCircle,
    X,
    Video as VideoIcon,
    Menu,
    Camera,
    Trash2
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit, where, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Image from 'next/image';
import EditAppointmentModal from '@/components/EditAppointmentModal';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('diagnose'); // diagnose, appUploads, members, logs, appointments
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, totalUsers: 0, todayAppointments: 0, pendingAppointments: 0 });
    const [selectedUserNotes, setSelectedUserNotes] = useState([]);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [noteLoading, setNoteLoading] = useState(false);
    const [activeUser, setActiveUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState(null);

    // App Uploads states
    const [uploads, setUploads] = useState([]);
    const [loadingUploads, setLoadingUploads] = useState(false);
    const [selectedUpload, setSelectedUpload] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [showHidden, setShowHidden] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/admin/login');
                return;
            }
            // 전문가 권한 확인 (보안 규칙에서 걸러지지만 UI에서도 이메일 체크)
            const adminEmails = ['js100216@naver.com', 'vlogcaptain@gmail.com', 'earbombeak@earbom.com'];
            if (!adminEmails.includes(user.email)) {
                router.push('/admin/login');
                return;
            }
            
            fetchDashboardData();
        });
        return () => unsubscribe();
    }, [router]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 설문 요청 가져오기
            const surveysQ = query(collection(db, 'surveys'), orderBy('createdAt', 'desc'));
            const surveysSnapshot = await getDocs(surveysQ);
            const surveyData = surveysSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSurveys(surveyData);

            // 회원 목록 가져오기
            const usersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
            const usersSnapshot = await getDocs(usersQ);
            const userData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userData);

            // 상담 예약 가져오기
            setLoadingAppointments(true);
            const appQ = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
            const appSnapshot = await getDocs(appQ);
            const appData = appSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAppointments(appData);
            setLoadingAppointments(false);

            // 통계 계산
            const today = new Date().toDateString();
            const todayCount = surveyData.filter(s => s.createdAt?.toDate ? s.createdAt.toDate().toDateString() === today : false).length;
            const pendingCount = surveyData.filter(s => (s.status || 'pending') === 'pending').length;
            const completedCount = surveyData.filter(s => s.status === 'completed').length;

            const todayApptCount = appData.filter(a => a.createdAt?.toDate ? a.createdAt.toDate().toDateString() === today : false).length;
            const pendingApptCount = appData.filter(a => (a.status || 'pending') === 'pending').length;
            
            setStats({
                today: todayCount,
                pending: pendingCount,
                completed: completedCount,
                totalUsers: userData.length,
                todayAppointments: todayApptCount,
                pendingAppointments: pendingApptCount
            });

            // 앱 사진 업로드 가져오기
            setLoadingUploads(true);
            const uploadsQ = query(collection(db, 'uploads'), orderBy('uploadedAt', 'desc'), limit(100));
            const uploadsSnapshot = await getDocs(uploadsQ);
            const uploadsData = uploadsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUploads(uploadsData);
            setLoadingUploads(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
            setLoadingUploads(false);
            setLoadingAppointments(false);
        }
    };

    const fetchUserNotes = async (userId, displayName) => {
        setNoteLoading(true);
        setActiveUser({ id: userId, name: displayName });
        setIsNotesModalOpen(true);
        try {
            const notesQ = query(
                collection(db, 'notes'), 
                where('userId', '==', userId), 
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(notesQ);
            const notesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSelectedUserNotes(notesData);
        } catch (error) {
            console.error("Error fetching user notes:", error);
        } finally {
            setNoteLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/admin/login');
    };

    const getUserRealName = (userId, fallbackName) => {
        const found = users.find(u => u.id === userId || u.uid === userId);
        return found?.name || found?.displayName || fallbackName || '이름 없음';
    };

    const getUserContact = (userId) => {
        const found = users.find(u => u.id === userId || u.uid === userId);
        if (!found) return { email: '', phone: '' };
        return {
            email: found.email || '',
            phone: found.phoneNumber || ''
        };
    };

    const filteredSurveys = surveys.filter(s => {
        if (s.isHidden && !showHidden) return false;
        const realName = getUserRealName(s.userId, s.userName);
        const matchesSearch = realName.toLowerCase().includes(searchTerm.toLowerCase());
        const status = s.status || 'pending';
        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && status === filterStatus;
    });

    const filteredUsers = users.filter(u => 
        (u.name || u.displayName)?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAppointments = appointments.filter(a => {
        const realName = getUserRealName(a.userId, a.userName);
        return realName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               a.expertName?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // App Uploads products mapping
    const PRODUCTS = {
        'magnesium': { name: '수면 유도 마그네슘', link: 'https://example.com/products/magnesium' },
        'ear_set_a': { name: '이침 세트 A (두통/어깨)', link: 'https://example.com/products/ear-set-a' },
        'ear_set_b': { name: '이침 세트 B (소화/수면)', link: 'https://example.com/products/ear-set-b' },
        'vitamin_b': { name: '활력 비타민 B 컴플렉스', link: 'https://example.com/products/vitamin-b' },
        'massage_tool': { name: '귀 지압 마사지봉', link: 'https://example.com/products/massage-tool' }
    };

    const filteredUploads = uploads.filter(u => {
        if (u.isHidden && !showHidden) return false;
        const name = u.userName || (u.userEmail ? u.userEmail.split('@')[0] : '사용자');
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (u.userEmail && u.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
        const status = u.status || 'pending';
        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && status === filterStatus;
    });

    const openUploadDetail = (upload) => {
        setSelectedUpload(upload);
        setFeedbackText(upload.feedback || '');
        setIsUploadModalOpen(true);
    };

    const handleAddProductLink = (productKey) => {
        const product = PRODUCTS[productKey];
        if (!product) return;
        const linkText = `\n[추천 제품: ${product.name} - 구매하기: ${product.link}]`;
        setFeedbackText(prev => prev + linkText);
    };

    const handleUploadFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUpload) return;
        setSubmittingFeedback(true);
        try {
            const uploadRef = doc(db, 'uploads', selectedUpload.id);
            await updateDoc(uploadRef, {
                feedback: feedbackText,
                status: 'completed',
                reviewedAt: serverTimestamp()
            });
            
            // Local state update
            setUploads(prev => prev.map(u => u.id === selectedUpload.id ? {
                ...u,
                feedback: feedbackText,
                status: 'completed'
            } : u));
            
            setIsUploadModalOpen(false);
            alert('피드백이 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error("Error saving feedback:", error);
            alert('피드백 저장에 실패했습니다: ' + error.message);
        } finally {
            setSubmittingFeedback(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Admin Header */}
            <header className="bg-[#17171A] text-white h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#2E7D32] rounded flex items-center justify-center">
                            <Image src="/logo.png" alt="logo" width={42} height={42} className="invert brightness-0" />
                        </div>
                        <span className="font-black tracking-tight text-base md:text-lg whitespace-nowrap">EAR BOM <span className="text-green-500">EXPERT</span></span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-4 ml-8 text-sm font-bold text-slate-400">
                        <button 
                            onClick={() => setActiveTab('diagnose')}
                            className={`${activeTab === 'diagnose' ? 'text-white' : 'hover:text-white'} transition-colors`}
                        >
                            진단 대기함
                        </button>
                        <button 
                            onClick={() => setActiveTab('appUploads')}
                            className={`${activeTab === 'appUploads' ? 'text-white' : 'hover:text-white'} transition-colors`}
                        >
                            앱 사진 진단
                        </button>
                        <button 
                            onClick={() => setActiveTab('appointments')}
                            className={`${activeTab === 'appointments' ? 'text-white' : 'hover:text-white'} transition-colors`}
                        >
                            예약 관리
                        </button>
                        <button 
                            onClick={() => setActiveTab('members')}
                            className={`${activeTab === 'members' ? 'text-white' : 'hover:text-white'} transition-colors`}
                        >
                            회원 관리
                        </button>
                        <button 
                            onClick={() => setActiveTab('logs')}
                            className={`${activeTab === 'logs' ? 'text-white' : 'hover:text-white'} transition-colors`}
                        >
                            분석 로그
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="hidden sm:inline-block text-[10px] md:text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full">ADMIN SESSION ACTIVE</span>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="로그아웃"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Mobile Navigation Overlay */}
                {isMobileMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-[#17171A] border-t border-white/5 p-4 flex flex-col gap-2 md:hidden animate-in slide-in-from-top duration-200">
                        <button 
                            onClick={() => { setActiveTab('diagnose'); setIsMobileMenuOpen(false); }}
                            className={`w-full text-left p-4 rounded-xl font-bold text-sm ${activeTab === 'diagnose' ? 'bg-green-600 text-white' : 'text-slate-400'}`}
                        >
                            진단 대기함
                        </button>
                        <button 
                            onClick={() => { setActiveTab('appUploads'); setIsMobileMenuOpen(false); }}
                            className={`w-full text-left p-4 rounded-xl font-bold text-sm ${activeTab === 'appUploads' ? 'bg-green-600 text-white' : 'text-slate-400'}`}
                        >
                            앱 사진 진단
                        </button>
                        <button 
                            onClick={() => { setActiveTab('appointments'); setIsMobileMenuOpen(false); }}
                            className={`w-full text-left p-4 rounded-xl font-bold text-sm ${activeTab === 'appointments' ? 'bg-green-600 text-white' : 'text-slate-400'}`}
                        >
                            예약 관리
                        </button>
                        <button 
                            onClick={() => { setActiveTab('members'); setIsMobileMenuOpen(false); }}
                            className={`w-full text-left p-4 rounded-xl font-bold text-sm ${activeTab === 'members' ? 'bg-green-600 text-white' : 'text-slate-400'}`}
                        >
                            회원 관리
                        </button>
                        <button 
                            onClick={() => { setActiveTab('logs'); setIsMobileMenuOpen(false); }}
                            className={`w-full text-left p-4 rounded-xl font-bold text-sm ${activeTab === 'logs' ? 'bg-green-600 text-white' : 'text-slate-400'}`}
                        >
                            분석 로그
                        </button>
                    </div>
                )}
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[125px]">
                        <div>
                            <div className="text-slate-400 text-xs font-black uppercase mb-2">오늘 들어온 요청</div>
                            <div className="text-3xl font-black text-slate-800">{stats.today + stats.todayAppointments}건</div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-500">
                            <span>진단요청: {stats.today}건</span>
                            <span>예약신청: {stats.todayAppointments}건</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[125px]">
                        <div>
                            <div className="text-orange-500 text-xs font-black uppercase mb-2">미처리 요청 대기</div>
                            <div className="text-3xl font-black text-slate-800">{stats.pending + stats.pendingAppointments}건</div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-500">
                            <span className="text-orange-500">진단대기: {stats.pending}건</span>
                            <span className="text-blue-600">예약대기: {stats.pendingAppointments}건</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[125px]">
                        <div>
                            <div className="text-green-600 text-xs font-black uppercase mb-2">진단 완료 (누적)</div>
                            <div className="text-3xl font-black text-slate-800">{stats.completed}건</div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-2 pt-2 border-t border-slate-50 border-dashed">
                            전체 사용자 누적 피드백 완료
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[125px]">
                        <div>
                            <div className="text-slate-400 text-xs font-black uppercase mb-2">총 회원수</div>
                            <div className="text-3xl font-black text-slate-800">{stats.totalUsers}명</div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-2 pt-2 border-t border-slate-50 border-dashed">
                            가입 회원 통합 관리 데이터
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {activeTab === 'diagnose' ? (
                    <>
                        {/* List Control Bar */}
                        <div className="bg-white p-4 rounded-t-3xl border-x border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                {['all', 'pending', 'completed'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setFilterStatus(st)}
                                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${filterStatus === st ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {st === 'all' ? '전체' : st === 'pending' ? '대기중' : '진단완료'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="text"
                                        placeholder="회원명 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-all select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={showHidden} 
                                        onChange={(e) => setShowHidden(e.target.checked)}
                                        className="rounded border-slate-300 text-[#F697AB] focus:ring-[#F697AB]/20"
                                    />
                                    <span>숨김 의뢰 포함</span>
                                </label>
                                <button 
                                    onClick={fetchDashboardData}
                                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* Main Data Table */}
                        <div className="bg-white border-x border-b border-slate-200 rounded-b-3xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[800px] md:min-w-0">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">사용자</th>
                                        <th className="px-6 py-4">신청 일시</th>
                                        <th className="px-6 py-4">답변 요약</th>
                                        <th className="px-6 py-4">상태</th>
                                        <th className="px-6 py-4 text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-slate-400 font-bold text-sm">데이터를 불러오는 중입니다...</p>
                                            </td>
                                        </tr>
                                    ) : filteredSurveys.length > 0 ? (
                                        filteredSurveys.map((survey) => (
                                            <tr key={survey.id} className={`hover:bg-slate-50 transition-colors group ${survey.isHidden ? 'opacity-60 bg-slate-50/80 border-dashed border-slate-200' : ''}`}>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700 font-black text-xs border border-green-100 uppercase">
                                                            {getUserRealName(survey.userId, survey.userName).substring(0, 1)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm">{getUserRealName(survey.userId, survey.userName)}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold flex flex-wrap gap-2 mt-1">
                                                                {getUserContact(survey.userId).phone && (
                                                                    <span className="text-green-700 font-extrabold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                                        📞 {getUserContact(survey.userId).phone}
                                                                    </span>
                                                                )}
                                                                {getUserContact(survey.userId).email && (
                                                                    <span className="text-blue-700 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                                        ✉️ {getUserContact(survey.userId).email}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Clock size={14} />
                                                        <span className="text-xs font-bold">{survey.createdAt?.toDate().toLocaleString('ko-KR', { 
                                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                                        })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
                                                        {survey.answers ? Object.values(survey.answers).slice(0, 2).join(', ') + ' 외' : '정보 없음'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {(survey.status || 'pending') === 'pending' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase border border-orange-100">
                                                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                                                            진단 대기
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase border border-green-100">
                                                            <CheckCircle2 size={12} />
                                                            진단 완료
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {survey.isHidden ? (
                                                            <button 
                                                                onClick={async () => {
                                                                    if (confirm('이 의뢰의 숨김 처리를 해제하시겠습니까?')) {
                                                                        try {
                                                                            await updateDoc(doc(db, 'surveys', survey.id), { isHidden: false });
                                                                            alert('숨김 해제되었습니다.');
                                                                            fetchDashboardData();
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('숨김 해제에 실패했습니다.');
                                                                        }
                                                                    }
                                                                }}
                                                                className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-black transition-all border border-green-200"
                                                            >
                                                                숨김 해제
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={async () => {
                                                                    if (confirm('이 의뢰를 목록에서 숨기시겠습니까?')) {
                                                                        try {
                                                                            await updateDoc(doc(db, 'surveys', survey.id), { isHidden: true });
                                                                            alert('숨김 처리되었습니다.');
                                                                            fetchDashboardData();
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('숨김 처리에 실패했습니다.');
                                                                        }
                                                                    }
                                                                }}
                                                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-black transition-all"
                                                            >
                                                                숨기기
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={async () => {
                                                                if (confirm(`'${getUserRealName(survey.userId, survey.userName)}' 님의 진단 의뢰를 영구 삭제하시겠습니까? 데이터베이스에서 완전히 삭제되며 되돌릴 수 없습니다.`)) {
                                                                    try {
                                                                        await deleteDoc(doc(db, 'surveys', survey.id));
                                                                        alert('영구 삭제되었습니다.');
                                                                        fetchDashboardData();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('삭제 실패했습니다.');
                                                                    }
                                                                }
                                                            }}
                                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="영구 삭제"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => router.push(`/admin/diagnose?id=${survey.id}`)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-black transition-all shadow-sm"
                                                        >
                                                            분석하기
                                                            <ChevronRight size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center text-slate-300 font-bold text-sm">
                                                표시할 요청 데이터가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'appointments' ? (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-800">예약 신청 내역 ({filteredAppointments.length}건)</h3>
                            <div className="flex gap-2 items-center">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="text"
                                        placeholder="예약자명 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                                    />
                                </div>
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-all select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={showHidden} 
                                        onChange={(e) => setShowHidden(e.target.checked)}
                                        className="rounded border-slate-300 text-[#F697AB] focus:ring-[#F697AB]/20"
                                    />
                                    <span>숨김 의뢰 포함</span>
                                </label>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[900px] md:min-w-0">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">예약자 정보</th>
                                    <th className="px-6 py-4">상담 방식</th>
                                    <th className="px-6 py-4">희망 일정</th>
                                    <th className="px-6 py-4">상담하고 싶은 내용</th>
                                    <th className="px-6 py-4">예약 상태</th>
                                    <th className="px-6 py-4">신청일</th>
                                    <th className="px-6 py-4 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loadingAppointments ? (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center">
                                            <Loader2 className="animate-spin mx-auto mb-2 text-green-600" />
                                            <p className="text-slate-400 text-sm">예약 목록을 로딩 중...</p>
                                        </td>
                                    </tr>
                                ) : filteredAppointments.length > 0 ? (
                                    filteredAppointments.map((appt) => (
                                        <tr key={appt.id} className={`hover:bg-slate-50/50 transition-colors ${appt.isHidden ? 'opacity-60 bg-slate-50/80 border-dashed border-slate-200' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                                        {getUserRealName(appt.userId, appt.userName).substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{getUserRealName(appt.userId, appt.userName)}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">✉️ {getUserContact(appt.userId).email || '이메일 없음'}</p>
                                                        <p className="text-[10px] text-green-600 font-semibold">📞 {getUserContact(appt.userId).phone || '연락처 없음'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {appt.type === 'offline' ? (
                                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-black uppercase border border-green-100">
                                                        대면 (방문)
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase border border-blue-100">
                                                        비대면 (상담)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-slate-700 font-bold">{appt.date} ({appt.time})</p>
                                            </td>
                                            <td className="px-6 py-4 max-w-[300px]">
                                                <p className="text-xs text-slate-500 font-medium whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    {appt.memo || '상담 요청 사항이 기재되지 않았습니다.'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {appt.status === 'confirmed' ? (
                                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-black uppercase border border-green-100">
                                                        예약 확정
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-black uppercase border border-amber-100">
                                                        승인 대기
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {appt.createdAt?.toDate ? appt.createdAt.toDate().toLocaleDateString() : '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {(!appt.isHidden) && (
                                                        <>
                                                            {appt.status !== 'confirmed' && (
                                                                <button 
                                                                    onClick={async () => {
                                                                        if (confirm('이 예약을 확정 및 승인하시겠습니까?')) {
                                                                            try {
                                                                                await updateDoc(doc(db, 'appointments', appt.id), { status: 'confirmed' });
                                                                                
                                                                                // 예약 승인 시에도 사용자에게 자동 승인 확정 SMS 발송 연동
                                                                                const recipientPhone = (getUserContact(appt.userId).phone || appt.phone || '').replace(/[^0-9]/g, '');
                                                                                if (recipientPhone) {
                                                                                    try {
                                                                                        const cleanName = getUserRealName(appt.userId, appt.userName) || '고객';
                                                                                        const smsMessage = `[이어봄 wellness] ${cleanName}님, 신청하신 예약이 확정되었습니다.\n일시: ${appt.date} ${appt.time}\n장소: 서울시 광진구 능동로 59길 27 1층`;
                                                                                        await fetch('/api/sms/send', {
                                                                                            method: 'POST',
                                                                                            headers: { 'Content-Type': 'application/json' },
                                                                                            body: JSON.stringify({
                                                                                                receiver: recipientPhone,
                                                                                                message: smsMessage
                                                                                            })
                                                                                        });
                                                                                    } catch (smsErr) {
                                                                                        console.error("Failed to send confirmation SMS on direct approval:", smsErr);
                                                                                    }
                                                                                }
                                                                                
                                                                                alert('예약이 정상적으로 승인 및 확정되었습니다.');
                                                                                fetchDashboardData();
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                                alert('예약 승인에 실패했습니다.');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black transition-all shadow-sm"
                                                                >
                                                                    예약 승인
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedAppointmentForEdit({
                                                                        id: appt.id,
                                                                        date: appt.date,
                                                                        time: appt.time,
                                                                        userId: appt.userId,
                                                                        userName: appt.userName,
                                                                        realName: getUserRealName(appt.userId, appt.userName),
                                                                        userPhone: getUserContact(appt.userId).phone || appt.phone || ''
                                                                    });
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-black text-white rounded-lg text-[10px] font-black transition-all shadow-sm"
                                                            >
                                                                일정 변경
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    const userPhone = getUserContact(appt.userId).phone || appt.phone || '';
                                                                    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
                                                                    const text = `안녕하세요 이어봄입니다. 신청하신 예약 일정의 조율을 위해 연락드렸습니다.`;
                                                                    if (navigator.clipboard) {
                                                                        navigator.clipboard.writeText(text)
                                                                            .then(() => alert('일정 조율 안내문이 클립보드에 복사되었습니다. 카카오톡 등에 바로 붙여넣어 쓰실 수 있습니다.'))
                                                                            .catch(err => console.error(err));
                                                                    }
                                                                    if (cleanPhone) {
                                                                        window.open(`sms:${cleanPhone}?body=${encodeURIComponent(text)}`, '_self');
                                                                    }
                                                                }}
                                                                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black transition-all border border-amber-200"
                                                                title="안내문 복사 및 문자 전송 조율"
                                                            >
                                                                조율 문자
                                                            </button>
                                                        </>
                                                    )}
                                                    {appt.isHidden ? (
                                                        <button 
                                                            onClick={async () => {
                                                                if (confirm('이 예약의 숨김 처리를 해제하시겠습니까?')) {
                                                                    try {
                                                                        await updateDoc(doc(db, 'appointments', appt.id), { isHidden: false });
                                                                        alert('숨김 해제되었습니다.');
                                                                        fetchDashboardData();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('숨김 해제에 실패했습니다.');
                                                                    }
                                                                }
                                                            }}
                                                            className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-[10px] font-black transition-all border border-green-200"
                                                        >
                                                            숨김 해제
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={async () => {
                                                                if (confirm('이 예약을 목록에서 숨기시겠습니까?')) {
                                                                    try {
                                                                        await updateDoc(doc(db, 'appointments', appt.id), { isHidden: true });
                                                                        alert('숨김 처리되었습니다.');
                                                                        fetchDashboardData();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('숨김 처리에 실패했습니다.');
                                                                    }
                                                                }
                                                            }}
                                                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-black transition-all"
                                                        >
                                                            숨기기
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`'${getUserRealName(appt.userId, appt.userName)}' 님의 예약을 영구 삭제하시겠습니까? 데이터베이스에서 완전히 삭제되며 되돌릴 수 없습니다.`)) {
                                                                    try {
                                                                        await deleteDoc(doc(db, 'appointments', appt.id));
                                                                        alert('예약이 영구 삭제되었습니다.');
                                                                        fetchDashboardData();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('삭제 실패했습니다.');
                                                                    }
                                                            }
                                                        }}
                                                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="영구 삭제"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center text-slate-300 font-bold text-sm">
                                            상담 예약 정보가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'appUploads' ? (
                    <>
                        {/* List Control Bar */}
                        <div className="bg-white p-4 rounded-t-3xl border-x border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                {['all', 'pending', 'completed'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setFilterStatus(st)}
                                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${filterStatus === st ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {st === 'all' ? '전체' : st === 'pending' ? '대기중' : '진단완료'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="text"
                                        placeholder="이름/이메일 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-all select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={showHidden} 
                                        onChange={(e) => setShowHidden(e.target.checked)}
                                        className="rounded border-slate-300 text-[#F697AB] focus:ring-[#F697AB]/20"
                                    />
                                    <span>숨김 의뢰 포함</span>
                                </label>
                                <button 
                                    onClick={fetchDashboardData}
                                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    <RefreshCcw size={18} className={loadingUploads ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* Uploads Grid */}
                        <div className="bg-white border-x border-b border-slate-200 rounded-b-3xl shadow-sm overflow-hidden p-6">
                            {loadingUploads ? (
                                <div className="py-20 text-center">
                                    <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-400 font-bold text-sm">앱 업로드 데이터를 불러오는 중입니다...</p>
                                </div>
                            ) : filteredUploads.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filteredUploads.map((upload) => (
                                        <div 
                                            key={upload.id} 
                                            onClick={() => openUploadDetail(upload)}
                                            className={`border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white flex flex-col group ${upload.isHidden ? 'opacity-60 bg-slate-50/80 border-dashed border-slate-300 shadow-none' : ''}`}
                                        >
                                            <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                                                {upload.fileUrl ? (
                                                    <img 
                                                        src={upload.fileUrl} 
                                                        alt="Ear Photo" 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl">👂</div>
                                                )}
                                                <span className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                                                    (upload.status || 'pending') === 'pending' 
                                                        ? 'bg-orange-500 text-white' 
                                                        : 'bg-green-600 text-white'
                                                }`}>
                                                    {(upload.status || 'pending') === 'pending' ? '대기중' : '완료'}
                                                </span>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-bold text-slate-800 text-sm truncate flex-1">
                                                            {upload.userName || (upload.userEmail ? upload.userEmail.split('@')[0] : '사용자')}
                                                        </h4>
                                                        {upload.isHidden ? (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm('이 의뢰의 숨김 처리를 해제하시겠습니까?')) {
                                                                        try {
                                                                            await updateDoc(doc(db, 'uploads', upload.id), { isHidden: false });
                                                                            alert('숨김 해제되었습니다.');
                                                                            fetchDashboardData();
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('숨김 해제에 실패했습니다.');
                                                                        }
                                                                    }
                                                                }}
                                                                className="text-[10px] text-green-600 hover:text-green-800 font-bold bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 border border-green-200"
                                                            >
                                                                숨김 해제
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm('이 의뢰를 관리자 목록에서 숨기시겠습니까?')) {
                                                                        try {
                                                                            await updateDoc(doc(db, 'uploads', upload.id), { isHidden: true });
                                                                            alert('숨김 처리되었습니다.');
                                                                            fetchDashboardData();
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('숨김 처리에 실패했습니다.');
                                                                        }
                                                                    }
                                                                }}
                                                                className="text-[10px] text-slate-400 hover:text-red-500 font-bold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors shrink-0"
                                                            >
                                                                숨기기
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (confirm(`'${upload.userName || '사용자'}' 님의 앱 사진 의뢰를 영구 삭제하시겠습니까? 데이터베이스에서 완전히 삭제되며 되돌릴 수 없습니다.`)) {
                                                                    try {
                                                                        await deleteDoc(doc(db, 'uploads', upload.id));
                                                                        alert('영구 삭제되었습니다.');
                                                                        fetchDashboardData();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('삭제 실패했습니다.');
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all shrink-0 ml-1.5"
                                                            title="영구 삭제"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1 truncate">
                                                        {upload.userEmail || ''}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold mt-3">
                                                    {upload.uploadedAt ? (
                                                        upload.uploadedAt.toDate 
                                                            ? upload.uploadedAt.toDate().toLocaleString('ko-KR') 
                                                            : new Date(upload.uploadedAt).toLocaleString('ko-KR')
                                                    ) : ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-slate-300 font-bold text-sm">
                                    표시할 진단 의뢰가 없습니다.
                                </div>
                            )}
                        </div>
                    </>
                ) : activeTab === 'members' ? (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-800">전체 회원 목록 ({stats.totalUsers}명)</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text"
                                    placeholder="이름/이메일 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px] md:min-w-0">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">회원명/이메일</th>
                                    <th className="px-6 py-4">가입 시기</th>
                                    <th className="px-6 py-4">상태</th>
                                    <th className="px-6 py-4 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <Loader2 className="animate-spin mx-auto mb-2 text-green-600" />
                                            <p className="text-slate-400 text-sm">로딩 중...</p>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                                        {(user.name || user.displayName)?.substring(0, 1) || user.email?.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{user.name || user.displayName || '이름 없음'}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{user.email || '이메일 없음'}</p>
                                                        <p className="text-[10px] text-green-600 font-semibold">{user.phoneNumber || '연락처 없음'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {user.createdAt?.toDate().toLocaleDateString() || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase border border-blue-100">
                                                    활성 회원
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button 
                                                        onClick={() => fetchUserNotes(user.id, user.name || user.displayName || user.email)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="상담 노트 보기"
                                                    >
                                                        <ClipboardList size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => router.push(`/admin/chat?id=${user.id}`)}
                                                        className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                                                        title="실시간 상담 시작"
                                                    >
                                                        <VideoIcon size={18} />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                                        <ExternalLink size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            if (confirm(`'${user.name || user.displayName || '이름 없음'}' 회원을 영구 삭제하시겠습니까?\n회원의 프로필 계정이 삭제됩니다. (기존 진단/예약 이력은 별도로 완전히 삭제하셔야 무결성이 유지됩니다.)`)) {
                                                                try {
                                                                    await deleteDoc(doc(db, 'users', user.id));
                                                                    alert('회원 프로필이 영구 삭제되었습니다.');
                                                                    fetchDashboardData();
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert('삭제 실패했습니다.');
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="회원 영구 삭제"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center text-slate-300 font-bold text-sm">
                                            검색 결과가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-800">진단 분석 로그 (최근 완료순)</h3>
                            <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-all select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={showHidden} 
                                        onChange={(e) => setShowHidden(e.target.checked)}
                                        className="rounded border-slate-300 text-[#F697AB] focus:ring-[#F697AB]/20"
                                    />
                                    <span>숨김 의뢰 포함</span>
                                </label>
                                <p className="text-xs font-bold text-slate-400">총 {surveys.filter(s => s.status === 'completed').length}건의 이력이 있습니다.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px] md:min-w-0">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">회원정보</th>
                                    <th className="px-6 py-4">진단 완료 일시</th>
                                    <th className="px-6 py-4">점수</th>
                                    <th className="px-6 py-4">주요 소견</th>
                                    <th className="px-6 py-4 text-right">다시보기</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <Loader2 className="animate-spin mx-auto mb-2 text-green-600" />
                                            <p className="text-slate-400 text-sm">기록 불러오는 중...</p>
                                        </td>
                                    </tr>
                                ) : surveys.filter(s => s.status === 'completed').length > 0 ? (
                                    surveys
                                        .filter(s => s.status === 'completed')
                                        .filter(s => {
                                            if (s.isHidden && !showHidden) return false;
                                            const realName = getUserRealName(s.userId, s.userName);
                                            return realName.toLowerCase().includes(searchTerm.toLowerCase());
                                        })
                                        .sort((a, b) => {
                                            const dateA = a.diagnosedAt?.toDate() || a.createdAt?.toDate() || 0;
                                            const dateB = b.diagnosedAt?.toDate() || b.createdAt?.toDate() || 0;
                                            return dateB - dateA;
                                        })
                                        .map((log) => (
                                            <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${log.isHidden ? 'opacity-60 bg-slate-50/80 border-dashed border-slate-200' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-[10px] uppercase">
                                                            {getUserRealName(log.userId, log.userName).substring(0, 1)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{getUserRealName(log.userId, log.userName)}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{log.userId?.substring(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        {(log.diagnosedAt || log.createdAt)?.toDate().toLocaleString('ko-KR', {
                                                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-black ${Number(log.score) >= 80 ? 'text-green-600' : Number(log.score) >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                                                        {log.score}점
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                                                        {log.overallCondition || '내용 없음'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {log.isHidden ? (
                                                            <button 
                                                                onClick={async () => {
                                                                    if (confirm('이 의뢰의 숨김 처리를 해제하시겠습니까?')) {
                                                                        try {
                                                                            await updateDoc(doc(db, 'surveys', log.id), { isHidden: false });
                                                                            alert('숨김 해제되었습니다.');
                                                                            fetchDashboardData();
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('숨김 해제에 실패했습니다.');
                                                                        }
                                                                    }
                                                                }}
                                                                className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-[10px] font-black transition-all border border-green-200"
                                                            >
                                                                숨김 해제
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={async () => {
                                                                    if (confirm('이 의뢰를 목록에서 숨기시겠습니까?')) {
                                                                        try {
                                                                            await updateDoc(doc(db, 'surveys', log.id), { isHidden: true });
                                                                            alert('숨김 처리되었습니다.');
                                                                            fetchDashboardData();
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('숨김 처리에 실패했습니다.');
                                                                        }
                                                                    }
                                                                }}
                                                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-black transition-all"
                                                            >
                                                                숨기기
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={async () => {
                                                                if (confirm(`'${getUserRealName(log.userId, log.userName)}' 님의 완료된 진단 기록을 영구 삭제하시겠습니까? 데이터베이스에서 완전히 삭제되며 되돌릴 수 없습니다.`)) {
                                                                    try {
                                                                        await deleteDoc(doc(db, 'surveys', log.id));
                                                                        alert('영구 삭제되었습니다.');
                                                                        fetchDashboardData();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('삭제 실패했습니다.');
                                                                    }
                                                                }
                                                            }}
                                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="영구 삭제"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => router.push(`/admin/diagnose?id=${log.id}`)}
                                                            className="p-2 text-slate-400 hover:text-black transition-colors"
                                                            title="진단 결과 다시보기"
                                                        >
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-slate-300 font-bold text-sm">
                                            진단 완료된 기록이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Consultation Notes Modal */}
            {isNotesModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNotesModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="font-black text-slate-800 text-lg">{activeUser?.name}님의 상담 노트</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Consultation History</p>
                            </div>
                            <button 
                                onClick={() => setIsNotesModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {noteLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="animate-spin mx-auto mb-2 text-green-600" />
                                    <p className="text-slate-400 text-sm font-bold">노트를 불러오는 중...</p>
                                </div>
                            ) : selectedUserNotes.length > 0 ? (
                                selectedUserNotes.map((note) => (
                                    <div key={note.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-[11px] font-black text-slate-400">
                                                {note.createdAt?.toDate().toLocaleString('ko-KR', {
                                                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                                            {note.text}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-slate-300">
                                    <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-black text-sm">작성된 상담 노트가 없습니다.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => router.push(`/admin/chat?id=${activeUser?.id}`)}
                                className="px-6 py-3 bg-[#2E7D32] text-white rounded-xl text-sm font-black hover:bg-[#1B5E20] transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95"
                            >
                                <VideoIcon size={18} />
                                실시간 상담 시작하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Detail Modal */}
            {isUploadModalOpen && selectedUpload && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="font-black text-slate-800 text-lg">
                                    {selectedUpload.userName || '사용자'}님의 귀 사진 진단
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">App Ear photo diagnosis</p>
                            </div>
                            <button 
                                onClick={() => setIsUploadModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Side: Photo */}
                            <div className="flex flex-col gap-4">
                                <div className="relative h-[250px] md:h-[350px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                    {selectedUpload.fileUrl ? (
                                        <img 
                                            src={selectedUpload.fileUrl} 
                                            alt="Ear Detail" 
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">👂</div>
                                    )}
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3">📋 의뢰 정보</h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-bold">이름</span>
                                            <span className="font-extrabold text-slate-800">{selectedUpload.userName || '사용자'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-bold">이메일</span>
                                            <span className="font-extrabold text-slate-800">{selectedUpload.userEmail || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-bold">요청 일시</span>
                                            <span className="font-extrabold text-slate-800">
                                                {selectedUpload.uploadedAt ? (
                                                    selectedUpload.uploadedAt.toDate 
                                                        ? selectedUpload.uploadedAt.toDate().toLocaleString('ko-KR') 
                                                        : new Date(selectedUpload.uploadedAt).toLocaleString('ko-KR')
                                                ) : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Side: Quiz Answers & Feedback Form */}
                            <div className="flex flex-col gap-6">
                                {/* Quiz Answers */}
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60">
                                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-4">📝 자가 진단 응답</h4>
                                    {selectedUpload.quizAnswers ? (
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            {Object.entries(selectedUpload.quizAnswers).map(([qKey, aVal]) => {
                                                const questionLabels = {
                                                    1: '불편 부위',
                                                    2: '통증 강도',
                                                    3: '피로도',
                                                    4: '소화 상태',
                                                    5: '수면 품질',
                                                    6: '스트레스'
                                                };
                                                const answerLabels = {
                                                    head: '머리/두통',
                                                    neck_shoulder: '목/어깨',
                                                    back: '허리/등',
                                                    digestive: '소화기관',
                                                    none: '없음',
                                                    very_good: '매우 좋음',
                                                    good: '좋음',
                                                    normal: '보통',
                                                    bad: '안좋음',
                                                    very_bad: '매우 안좋음',
                                                    tired: '피곤함',
                                                    very_tired: '매우 피곤함',
                                                    very_low: '매우 낮음',
                                                    low: '낮음',
                                                    high: '높음',
                                                    very_high: '매우 높음'
                                                };
                                                return (
                                                    <div key={qKey} className="flex flex-col gap-1">
                                                        <span className="text-slate-400 font-bold">{questionLabels[qKey] || `질문 ${qKey}`}</span>
                                                        <span className="font-extrabold text-slate-800 bg-white border border-slate-200/60 px-2 py-1.5 rounded-lg text-center">
                                                            {answerLabels[aVal] || aVal}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400">설문 답변 없음</p>
                                    )}
                                </div>
                                
                                {/* Feedback Form */}
                                <form onSubmit={handleUploadFeedbackSubmit} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-600">💬 전문가 피드백</label>
                                        <textarea
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            rows={6}
                                            required
                                            placeholder="사용자의 귀 분석 결과를 토대로 증상 완화를 위한 혈자리 자극 조언이나 기타 피드백을 자세히 기입해주세요..."
                                            className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-600">🛍️ 추천 제품 링크 추가</label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(PRODUCTS).map(([key, p]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => handleAddProductLink(key)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black rounded-lg transition-colors border border-slate-200"
                                                >
                                                    +{p.name} 🔗
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 mt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsUploadModalOpen(false)}
                                            className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-500 text-sm font-black hover:bg-slate-50 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={submittingFeedback}
                                            className="flex-1 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                                        >
                                            {submittingFeedback ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={16} />
                                                    저장 중...
                                                </>
                                            ) : '피드백 저장'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Appointment Modal */}
            <EditAppointmentModal 
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedAppointmentForEdit(null);
                }}
                appointment={selectedAppointmentForEdit}
                onSuccess={fetchDashboardData}
            />
        </div>
    );
}
