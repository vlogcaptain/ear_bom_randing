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
    Menu
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Image from 'next/image';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('diagnose'); // diagnose, members, logs
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, totalUsers: 0 });
    const [selectedUserNotes, setSelectedUserNotes] = useState([]);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [noteLoading, setNoteLoading] = useState(false);
    const [activeUser, setActiveUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

            // 통계 계산
            const today = new Date().toDateString();
            const todayCount = surveyData.filter(s => s.createdAt?.toDate().toDateString() === today).length;
            const pendingCount = surveyData.filter(s => (s.status || 'pending') === 'pending').length;
            const completedCount = surveyData.filter(s => s.status === 'completed').length;
            
            setStats({
                today: todayCount,
                pending: pendingCount,
                completed: completedCount,
                totalUsers: userData.length
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
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

    const filteredSurveys = surveys.filter(s => {
        const matchesSearch = s.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        const status = s.status || 'pending';
        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && status === filterStatus;
    });

    const filteredUsers = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-slate-400 text-xs font-black uppercase mb-2">오늘 들어온 요청</div>
                        <div className="text-3xl font-black text-slate-800">{stats.today}건</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-orange-500 text-xs font-black uppercase mb-2">미처리 진단</div>
                        <div className="text-3xl font-black text-slate-800">{stats.pending}건</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-green-600 text-xs font-black uppercase mb-2">진단 완료 (누적)</div>
                        <div className="text-3xl font-black text-slate-800">{stats.completed}건</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-slate-400 text-xs font-black uppercase mb-2">총 회원수</div>
                        <div className="text-3xl font-black text-slate-800">{stats.totalUsers}명</div>
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
                                            <tr key={survey.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700 font-black text-xs border border-green-100 uppercase">
                                                            {survey.userName?.substring(0, 1)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm">{survey.userName}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold">{survey.userId?.substring(0, 8)}...</p>
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
                                                    <button 
                                                        onClick={() => router.push(`/admin/diagnose?id=${survey.id}`)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-black transition-all shadow-sm"
                                                    >
                                                        분석하기
                                                        <ChevronRight size={14} />
                                                    </button>
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
                                                        {user.displayName?.substring(0, 1) || user.email?.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{user.displayName || '이름 없음'}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
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
                                                        onClick={() => fetchUserNotes(user.id, user.displayName || user.email)}
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
                            <p className="text-xs font-bold text-slate-400">총 {surveys.filter(s => s.status === 'completed').length}건의 이력이 있습니다.</p>
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
                                        .filter(s => s.userName?.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .sort((a, b) => {
                                            const dateA = a.diagnosedAt?.toDate() || a.createdAt?.toDate() || 0;
                                            const dateB = b.diagnosedAt?.toDate() || b.createdAt?.toDate() || 0;
                                            return dateB - dateA;
                                        })
                                        .map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-[10px] uppercase">
                                                            {log.userName?.substring(0, 1)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{log.userName}</p>
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
                                                    <button 
                                                        onClick={() => router.push(`/admin/diagnose?id=${log.id}`)}
                                                        className="p-2 text-slate-400 hover:text-black transition-colors"
                                                        title="진단 결과 다시보기"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
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
        </div>
    );
}
