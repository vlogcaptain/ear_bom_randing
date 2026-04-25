'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    MessageSquare,
    Calendar,
    Settings,
    LogOut,
    PlusCircle,
    Bell,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    Clock,
    User,
    Video,
    Mic,
    FileText,
    AlertCircle,
    Activity
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [latestDiagnosis, setLatestDiagnosis] = useState(null);
    const [loadingDiagnosis, setLoadingDiagnosis] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchAppointments();
            fetchLatestDiagnosis();
        }
    }, [user, loading, router]);

    const fetchLatestDiagnosis = async () => {
        try {
            const q = query(
                collection(db, 'surveys'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const data = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                setLatestDiagnosis(data);
            }
        } catch (error) {
            console.error("Error fetching diagnosis:", error);
        } finally {
            setLoadingDiagnosis(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const q = query(
                collection(db, 'appointments'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(5)
            );
            const querySnapshot = await getDocs(q);
            const appts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 실제 데이터가 있으면 그것을 표시하고, 없는데 데모 사용자라면 샘플 데이터를 표시합니다.
            if (appts.length > 0) {
                setAppointments(appts);
            } else if (user?.uid === 'demo-user-123') {
                setAppointments([
                    {
                        id: 'demo-1',
                        expertName: '김이침 원장',
                        date: '2026-03-04',
                        time: '14:30',
                        type: 'video',
                        status: 'confirmed'
                    },
                    {
                        id: 'demo-2',
                        expertName: '김이침 원장',
                        date: '2026-02-27',
                        time: '16:00',
                        type: 'chat',
                        status: 'confirmed'
                    }
                ]);
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            // 에러 발생 시 데모 사용자라면 샘플 데이터로 폴백
            if (user?.uid === 'demo-user-123') {
                setAppointments([
                    {
                        id: 'demo-1',
                        expertName: '김이침 원장',
                        date: '2026-03-04',
                        time: '14:30',
                        type: 'video',
                        status: 'confirmed'
                    }
                ]);
            }
        } finally {
            setLoadingAppointments(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">인증 정보를 확인 중입니다...</p>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const nextAppointment = appointments.find(a => a.status === 'confirmed');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center relative overflow-hidden p-1.5 shadow-sm">
                                <Image
                                    src="/logo.png"
                                    alt="ear bom healthy logo"
                                    width={40}
                                    height={40}
                                    className="object-contain invert brightness-0"
                                />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-[#1B5E20]">ear bom healthy</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-[#2E7D32] transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800">{user.displayName || user.phoneNumber || '이름 없음'}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{user.email || '회원님'}</p>
                            </div>
                            <div className="w-10 h-10 bg-[#E8F5E9] rounded-full flex items-center justify-center text-[#2E7D32] border border-[#C8E6C9]">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex max-w-7xl mx-auto w-full">
                {/* Sidebar */}
                <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col py-8 px-4 gap-2 text-sm">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'overview' ? 'bg-[#E8F5E9] text-[#2E7D32] font-black shadow-sm' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>대시보드 홈</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'reports' ? 'bg-[#E8F5E9] text-[#2E7D32] font-black shadow-sm' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
                    >
                        <ClipboardList size={20} />
                        <span>진단 리포트</span>
                    </button>
                    <Link href="/chat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all duration-200 font-bold">
                        <MessageSquare size={20} />
                        <span>실시간 상담</span>
                    </Link>
                    <Link href="/appointment" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all duration-200 font-bold">
                        <Calendar size={20} />
                        <span>상담 예약</span>
                    </Link>

                    <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col gap-2">
                        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all duration-200 font-bold">
                            <Settings size={20} />
                            <span>환경 설정</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 font-bold"
                        >
                            <LogOut size={20} />
                            <span>로그아웃</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                                <span className="text-[#2E7D32]">{user.displayName || (user.phoneNumber ? '새로운' : '반가워요!')}</span> 회원님, 안녕하세요!
                            </h2>
                            <p className="text-slate-400 mt-2 font-medium">오늘도 당신의 귀를 통해 건강을 체크해 보세요.</p>
                        </div>
                        <Link href="/survey" className="bg-[#2E7D32] text-white px-6 py-4 rounded-2xl flex items-center gap-2 font-bold hover:bg-[#1B5E20] transition-all duration-300 shadow-lg shadow-[#2E7D32]/20 hover:-translate-y-1">
                            <PlusCircle size={20} />
                            <span>새 건강 진단 시작</span>
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                    <ClipboardList size={24} />
                                </div>
                                {latestDiagnosis?.status === 'completed' ? (
                                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-full">분석 완료</span>
                                ) : latestDiagnosis ? (
                                    <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full animate-pulse">분석 대기중</span>
                                ) : null}
                            </div>
                            <p className="text-slate-500 text-sm font-medium">최근 진단 점수</p>
                            <h3 className="text-2xl font-black text-slate-800 mt-1">
                                {latestDiagnosis?.status === 'completed' ? `${latestDiagnosis.score}점` : '-'}
                            </h3>
                        </div>

                        {/* Updated Appointment Stat Card */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            {nextAppointment ? (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-[#2E7D32]">
                                            <Calendar size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full">예약 완료</span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">예정된 상담</p>
                                    <h3 className="text-xl font-black text-slate-800 mt-1">{nextAppointment.date} {nextAppointment.time}</h3>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                            <Calendar size={24} />
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">예정된 상담</p>
                                    <Link href="/appointment" className="text-sm font-bold text-[#2E7D32] mt-2 block hover:underline">상담 예약하기 →</Link>
                                </>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                    <Clock size={24} />
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">서비스 이용 시간</p>
                            <h3 className="text-2xl font-black text-slate-800 mt-1">128분</h3>
                        </div>
                    </div>

                    {/* Tab Navigation Content */}
                    {activeTab === 'reports' && (
                        <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">상세 진단 리포트</h3>
                                {latestDiagnosis?.diagnosedAt && (
                                    <span className="text-xs font-bold text-slate-400">
                                        진단 일시: {latestDiagnosis.diagnosedAt.toDate ? latestDiagnosis.diagnosedAt.toDate().toLocaleDateString() : 'N/A'}
                                    </span>
                                )}
                            </div>

                            {latestDiagnosis?.status === 'completed' ? (
                                <div className="space-y-8">
                                    {/* Medical Visualization Section */}
                                    {latestDiagnosis.markedAcupoints && latestDiagnosis.markedAcupoints.length > 0 && (
                                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in duration-700">
                                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 bg-[#2E7D32] rounded-xl flex items-center justify-center shadow-lg shadow-[#2E7D32]/20">
                                                        <Activity size={18} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800">전문가 시각적 분석 가이드</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expert Visual Guidance</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-black rounded-full border border-[#2E7D32]/10 uppercase">
                                                    Personalized
                                                </span>
                                            </div>
                                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                                {/* Ear Photo with Interactive Markers */}
                                                <div className="flex-1 bg-slate-900 relative flex items-center justify-center p-6 min-h-[400px]">
                                                    <div className="relative max-w-full max-h-full aspect-square md:aspect-auto">
                                                        <img 
                                                            src={latestDiagnosis.earPhotoUrl} 
                                                            alt="Analyzed Ear" 
                                                            className="rounded-2xl shadow-2xl max-w-full max-h-[500px] object-contain ring-4 ring-white/5"
                                                        />
                                                        {latestDiagnosis.markedAcupoints.map((marker, idx) => (
                                                            <div 
                                                                key={idx}
                                                                className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-help"
                                                                style={{ top: `${marker.y}%`, left: `${marker.x}%` }}
                                                            >
                                                                <div className="relative">
                                                                    <div className="size-5 bg-[#2E7D32] border-2 border-white rounded-full shadow-lg group-hover/pin:scale-125 transition-transform animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${idx * 150}ms` }}></div>
                                                                    <div className="absolute left-7 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm shadow-xl border border-[#E8F5E9] px-3 py-1.5 rounded-xl text-[11px] whitespace-nowrap font-black text-[#2E7D32] opacity-0 group-hover/pin:opacity-100 transition-all translate-x-2 group-hover/pin:translate-x-0 pointer-events-none">
                                                                        {marker.label}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Sidebar Point List */}
                                                <div className="w-full lg:w-72 bg-slate-50/30 p-6 space-y-4">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">마킹된 혈자리 리스트</h5>
                                                    <div className="space-y-2">
                                                        {latestDiagnosis.markedAcupoints.map((marker, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                                <div className="size-6 bg-[#E8F5E9] rounded-lg flex items-center justify-center text-[10px] font-black text-[#2E7D32]">
                                                                    {idx + 1}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-700">{marker.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="p-4 bg-[#2E7D32]/5 rounded-2xl border border-[#2E7D32]/10 mt-6">
                                                        <p className="text-[10px] text-[#2E7D32] font-bold leading-relaxed">
                                                            표시된 위치를 손가락이나 이침 패치로 지압해 주세요. 매일 3회씩 꾸준히 자극하면 건강 개선에 도움이 됩니다.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Structured Report Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                            <div>
                                                <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <FileText size={14} /> 종합 소견
                                                </h4>
                                                <p className="text-slate-700 text-sm leading-relaxed font-medium">{latestDiagnosis.overallCondition}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <TrendingUp size={14} /> 추천 습관
                                                </h4>
                                                <p className="text-slate-700 text-sm leading-relaxed font-medium">{latestDiagnosis.recommendations}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <CheckCircle2 size={14} /> 추천 자극 포인트
                                                </h4>
                                                <p className="text-slate-700 text-sm leading-relaxed font-medium">{latestDiagnosis.acupoints}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <LayoutDashboard size={14} /> 주의할 요인
                                                </h4>
                                                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-4">
                                                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm shrink-0">
                                                        <AlertCircle size={18} />
                                                    </div>
                                                    <p className="text-red-700 text-sm font-bold leading-tight">{latestDiagnosis.forbiddenFoods || '주의할 음식을 식별 중입니다.'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-xs font-black text-pink-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                        <Mic size={14} /> 추천 영양제
                                                    </h4>
                                                    <p className="text-slate-700 text-sm font-bold">{latestDiagnosis.supplements || '없음'}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] p-8 rounded-3xl shadow-lg text-white">
                                                <h4 className="text-xs font-black text-white/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Calendar size={14} /> 다음 상담 추천일
                                                </h4>
                                                <p className="text-2xl font-black">{latestDiagnosis.nextDate ? new Date(latestDiagnosis.nextDate).toLocaleDateString() : '분석 대기'}</p>
                                                <button className="mt-6 w-full py-3 bg-white text-[#1B5E20] rounded-xl font-black text-xs hover:bg-slate-100 transition-all">
                                                    예약 페이지로 이동
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-20 rounded-3xl border border-slate-200 shadow-sm text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Clock className="text-slate-300 animate-pulse" size={32} />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 mb-2">진단 결과를 준비 중입니다</h4>
                                    <p className="text-slate-400 font-medium max-w-sm mx-auto">전문가가 회원님의 귀 사진을 정밀하게 분석하고 있습니다. 완료되면 이곳에서 상세 리포트를 확인하실 수 있습니다.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Appointment List */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                        <Calendar size={20} className="text-[#2E7D32]" />
                                        최근 예약 현황
                                    </h3>
                                    <Link href="/appointment" className="text-xs font-bold text-slate-400 hover:text-[#2E7D32] transition-colors">새 예약</Link>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {loadingAppointments ? (
                                        <div className="p-10 text-center"><div className="w-6 h-6 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                                    ) : appointments.length > 0 ? (
                                        appointments.map((appt) => (
                                            <div key={appt.id} className="p-5 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#2E7D32]">
                                                            {appt.type === 'video' ? <Video size={18} /> : appt.type === 'voice' ? <Mic size={18} /> : <MessageSquare size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{appt.expertName}</p>
                                                            <p className="text-xs text-slate-400 font-medium">{appt.date} • {appt.time} • {appt.status === 'confirmed' ? '예약확정' : '처리중'}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} className="text-slate-300" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center text-slate-300 font-medium text-sm">진행 중인 예약이 없습니다.</div>
                                    )}
                                </div>
                            </div>

                            {/* Analysis Tip or Quick Report Preview */}
                            {latestDiagnosis?.status === 'completed' ? (
                                <div className="bg-[#1B5E20] rounded-3xl p-8 relative overflow-hidden group flex flex-col">
                                    <span className="bg-[#FFD54F] text-[#1B5E20] text-[10px] font-black px-3 py-1 rounded-full w-fit mb-6 uppercase tracking-wider">Expert Opinion</span>
                                    <h3 className="text-2xl font-black text-white leading-tight mb-4">
                                        추천 자극 포인트:<br />
                                        {latestDiagnosis.acupoints?.substring(0, 30)}...
                                    </h3>
                                    <p className="text-green-50/70 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
                                        {latestDiagnosis.overallCondition}
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab('reports')}
                                        className="mt-auto w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 font-bold transition-all backdrop-blur-sm"
                                    >
                                        상세 리포트 전체 보기
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-[#1B5E20] rounded-3xl p-8 relative overflow-hidden group">
                                    <div className="relative z-10 h-full flex flex-col">
                                        <span className="bg-[#FFD54F] text-[#1B5E20] text-[10px] font-black px-3 py-1 rounded-full w-fit mb-6 uppercase tracking-wider">Today's Tip</span>
                                        <h3 className="text-2xl font-black text-white leading-tight mb-4">
                                            귀의 신문혈을<br />자주 자극해 주세요
                                        </h3>
                                        <p className="text-green-50/70 text-sm leading-relaxed mb-6 font-medium">
                                            스트레스 완화와 불면증 해소에 탁월한 효과가 있는 혈자리입니다. 귓바퀴 안쪽 상단의 움푹한 곳을 하루 3번, 1분씩 지압해 보세요.
                                        </p>
                                        <button className="mt-auto w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 font-bold transition-all backdrop-blur-sm">
                                            더 많은 건강 꿀팁 보기
                                        </button>
                                    </div>
                                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
                                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-8 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] font-black text-slate-400 tracking-wider">© 2026 ear bom healthy. All rights reserved.</p>
                    <div className="flex gap-6 text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                        <Link href="#" className="hover:text-[#2E7D32] transition-colors">이용약관</Link>
                        <Link href="#" className="hover:text-[#2E7D32] transition-colors">개인정보처리방침</Link>
                        <Link href="#" className="hover:text-[#2E7D32] transition-colors">고객센터</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
