'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    ChevronLeft, 
    Save, 
    Calendar, 
    AlertCircle, 
    Activity, 
    FileText, 
    Sparkles, 
    Utensils, 
    Pill,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    CheckCircle,
    MapPin
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import MarkingModal from '@/components/MarkingModal';

function DiagnoseContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
    const [markedAcupoints, setMarkedAcupoints] = useState([]);
    const [activeEar, setActiveEar] = useState('left'); // 'left' or 'right'
    
    // 진단 7가지 필드 상태
    const [form, setForm] = useState({
        score: 85,
        opinion: '',
        habits: '',
        acupoints: '',
        nextDate: '',
        forbiddenFoods: '',
        supplements: ''
    });

    useEffect(() => {
        if (!id) {
            router.push('/admin');
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/admin/login');
                return;
            }
            // 전문가 권한 확인
            const adminEmails = ['js100216@naver.com', 'vlogcaptain@gmail.com', 'earbombeak@earbom.com'];
            if (!adminEmails.includes(user.email)) {
                router.push('/admin/login');
                return;
            }
            
            fetchSurvey();
        });
        return () => unsubscribe();
    }, [id, router]);

    const fetchSurvey = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'surveys', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                let realName = '';
                let userPhone = '';
                let userEmail = '';
                if (data.userId) {
                    try {
                        const userSnap = await getDoc(doc(db, 'users', data.userId));
                        if (userSnap.exists()) {
                            const uData = userSnap.data();
                            realName = uData.name || uData.displayName || '';
                            userPhone = uData.phoneNumber || uData.phone || '';
                            userEmail = uData.email || '';
                        }
                    } catch (userErr) {
                        console.error("Error fetching user profile for survey:", userErr);
                    }
                }
                
                setSurvey({ ...data, realName, userPhone, userEmail });
                // 기존 데이터가 있으면 채워넣기 (수정 모드 대비)
                if (data.status === 'completed') {
                    setForm({
                        score: data.score || 85,
                        opinion: data.overallCondition || '',
                        habits: data.recommendations || '',
                        acupoints: data.acupoints || '',
                        nextDate: data.nextDate || '',
                        forbiddenFoods: data.forbiddenFoods || '',
                        supplements: data.supplements || ''
                    });
                    setMarkedAcupoints(data.markedAcupoints || []);
                }
            } else {
                alert('해당 데이터를 찾을 수 없습니다.');
                router.push('/admin');
            }
        } catch (error) {
            console.error("Error fetching survey:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        setShowConfirm(false);
        try {
            const docRef = doc(db, 'surveys', id);
            await updateDoc(docRef, {
                status: 'completed',
                score: Number(form.score),
                overallCondition: form.opinion || '',
                recommendations: form.habits || '',
                acupoints: form.acupoints || '',
                nextDate: form.nextDate || '',
                forbiddenFoods: form.forbiddenFoods || '',
                supplements: form.supplements || '',
                markedAcupoints: markedAcupoints || [],
                diagnosedAt: serverTimestamp()
            });

            // 사용자 대상 진단 완료 SMS 알림 전송 (비동기)
            if (survey?.userPhone) {
                try {
                    await fetch('/api/sms/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: survey.userPhone,
                            message: `[이어봄 알림]\n${survey.realName || '고객'}님, 이침 전문가 진단 분석이 완료되었습니다.\n\n지금 바로 이어봄 대시보드에 로그인하셔서 확인해 주세요.\n\n- 확인 경로: 이어봄 로그인 -> 대시보드`
                        })
                    });
                } catch (smsErr) {
                    console.error("Failed to send user notification SMS:", smsErr);
                }
            }

            alert('진단이 성공적으로 완료되었습니다.');
            router.push('/admin');
        } catch (error) {
            console.error("Save Error:", error);
            alert('저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-slate-800 tracking-tighter">진단 데이터 분석 중...</p>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
            {/* Minimal Header */}
            <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/admin')}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-4 w-[1px] bg-slate-200 ml-2"></div>
                    <h1 className="text-sm font-black text-slate-800">
                        {survey?.realName || survey?.userName} <span className="text-slate-400 font-bold ml-1">사용자 정밀 진단</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowConfirm(true)}
                        disabled={saving}
                        className="bg-black text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
                        진단 결과 전송
                    </button>
                </div>
            </header>

            {/* Custom Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 mx-auto">
                            <Save size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 text-center mb-2">진단 결과 전송</h2>
                        <p className="text-slate-500 text-sm font-medium text-center mb-8">
                            작성하신 진단 내용을 저장하고<br />회원님께 결과를 전달하시겠습니까?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all"
                            >
                                취소
                            </button>
                            <button 
                                onClick={handleSave}
                                className="py-4 bg-black text-white rounded-2xl font-black text-xs hover:shadow-lg transition-all"
                            >
                                전송하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                {/* Left Side: Image Viewer */}
                <div className="w-full md:w-1/2 h-[400px] md:h-full bg-slate-900 relative flex items-center justify-center p-4 md:p-8 shrink-0">
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black text-white uppercase tracking-widest mb-2">
                            User Submitted Photo
                        </div>
                        <div className="flex gap-2">
                            {(survey?.leftEarUrl && survey?.rightEarUrl) && (
                                <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10 mr-2">
                                    <button 
                                        onClick={() => setActiveEar('left')}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeEar === 'left' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                                    >
                                        L
                                    </button>
                                    <button 
                                        onClick={() => setActiveEar('right')}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeEar === 'right' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                                    >
                                        R
                                    </button>
                                </div>
                            )}
                            <button 
                                onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                                className={`w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all ${zoom >= 3 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                disabled={zoom >= 3}
                            >
                                <ZoomIn size={18} />
                            </button>
                            <button 
                                onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
                                className={`w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all ${zoom <= 0.5 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                disabled={zoom <= 0.5}
                            >
                                <ZoomOut size={18} />
                            </button>
                            <button onClick={() => setZoom(1)} className="w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-all">
                                <RotateCcw size={18} />
                            </button>
                            <button 
                                onClick={() => setIsMarkingModalOpen(true)}
                                className="px-6 h-10 bg-green-600 hover:bg-green-500 text-white rounded-xl flex items-center gap-2 text-xs font-black transition-all shadow-lg"
                            >
                                <MapPin size={16} />
                                {activeEar === 'left' ? '왼쪽' : '오른쪽'} 마킹
                            </button>
                        </div>
                    </div>

                    <div className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out" style={{ transform: `scale(${zoom})` }}>
                        {(survey?.leftEarUrl || survey?.rightEarUrl || survey?.earPhotoUrl) ? (
                            <div className="relative">
                                <img 
                                    src={activeEar === 'left' ? (survey.leftEarUrl || survey.earPhotoUrl) : (survey.rightEarUrl || survey.earPhotoUrl)} 
                                    alt="Ear Photo" 
                                    className="max-w-full max-h-[700px] block rounded-lg shadow-2xl transition-all duration-500"
                                />
                                {markedAcupoints.filter(p => !p.side || p.side === activeEar).map((point, idx) => (
                                    <div 
                                        key={idx}
                                        className="absolute w-3 h-3 bg-red-500 border border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"
                                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                    >
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 bg-black/70 text-white text-[8px] px-1 rounded whitespace-nowrap">
                                            {point.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-500 text-sm font-bold bg-slate-800 px-6 py-4 rounded-2xl">사진 데이터가 없습니다.</div>
                        )}
                    </div>

                </div>

                {/* Right Side: Inputs */}
                <div className="w-full md:w-1/2 bg-white overflow-y-auto p-6 md:p-10 custom-scrollbar">
                    <div className="max-w-2xl mx-auto space-y-10">
                        
                        {/* Survey Summary Section */}
                        {survey?.answers && Object.keys(survey.answers).length > 0 && (
                            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={16} className="text-green-600" /> 설문 요약
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                                    {Object.entries(survey.answers).map(([key, value]) => (
                                        <div key={key} className="flex flex-col gap-1 p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                                            <span className="text-slate-400 font-black text-[9px] uppercase tracking-wider">{key}</span>
                                            <span className="text-slate-800 font-bold leading-relaxed whitespace-pre-wrap">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Score Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={16} className="text-orange-500" /> 1. 진단 점수
                                </h2>
                                <span className="text-3xl font-black text-slate-800">{form.score}점</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={form.score}
                                onChange={(e) => setForm({...form, score: e.target.value})}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2E7D32]"
                            />
                        </section>

                        <div className="h-[1px] bg-slate-100"></div>

                        {/* Opinion Section */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={16} className="text-blue-500" /> 2. 종합 소견
                            </h2>
                            <textarea
                                value={form.opinion}
                                onChange={(e) => setForm({...form, opinion: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 min-h-[120px]"
                                placeholder="사용자의 현재 귀 상태와 종합적인 건강 상태를 적어주세요."
                            />
                        </section>

                        {/* Habits Section */}
                        <section className="space-y-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} className="text-green-500" /> 3. 추천 습관
                            </h2>
                            <textarea
                                value={form.habits}
                                onChange={(e) => setForm({...form, habits: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 min-h-[100px]"
                                placeholder="일상생활에서 실천하면 좋은 습관들을 추천해 주세요."
                            />
                        </section>

                        {/* Acupoints Section */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle size={16} className="text-purple-500" /> 4. 추천 자극 포인트
                                </h2>
                                <button 
                                    onClick={() => setIsMarkingModalOpen(true)}
                                    className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 border border-purple-100"
                                >
                                    <MapPin size={12} />
                                    사진에 마킹하기
                                </button>
                            </div>
                            <textarea
                                value={form.acupoints}
                                onChange={(e) => setForm({...form, acupoints: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 min-h-[80px]"
                                placeholder="자극하면 도움이 될 혈자리 정보를 입력해 주세요."
                            />
                        </section>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Food Section */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Utensils size={16} className="text-red-500" /> 5. 주의할 음식
                                </h2>
                                <textarea
                                    value={form.forbiddenFoods}
                                    onChange={(e) => setForm({...form, forbiddenFoods: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 min-h-[80px]"
                                    placeholder="피해야 할 음식을 적어주세요."
                                />
                            </section>

                            {/* Supplement Section */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Pill size={16} className="text-pink-500" /> 6. 추천 영양제
                                </h2>
                                <textarea
                                    value={form.supplements}
                                    onChange={(e) => setForm({...form, supplements: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 min-h-[80px]"
                                    placeholder="도움이 될 영양 요소를 추천해 주세요."
                                />
                            </section>
                        </div>

                        {/* Next Appointment Section */}
                        <section className="space-y-4 pb-10">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={16} className="text-teal-600" /> 7. 다음 상담 추천일
                            </h2>
                            <input
                                type="date"
                                value={form.nextDate}
                                onChange={(e) => setForm({...form, nextDate: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            />
                        </section>

                    </div>
                </div>
            </div>

            <MarkingModal 
                isOpen={isMarkingModalOpen}
                onClose={() => setIsMarkingModalOpen(false)}
                onSave={(points) => {
                    // Add side information to markers
                    const pointsWithSide = points.map(p => ({ ...p, side: activeEar }));
                    // Merge with markers from the other side
                    const otherSidePoints = markedAcupoints.filter(p => p.side && p.side !== activeEar);
                    setMarkedAcupoints([...otherSidePoints, ...pointsWithSide]);
                    setIsMarkingModalOpen(false);
                }}
                imageUrl={activeEar === 'left' ? (survey?.leftEarUrl || survey?.earPhotoUrl) : (survey?.rightEarUrl || survey?.earPhotoUrl)}
                initialMarkers={markedAcupoints.filter(p => p.side === activeEar)}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </div>
    );
}

export default function DiagnosePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-slate-800 tracking-tighter">애플리케이션 준비 중...</p>
                </div>
            </div>
        }>
            <DiagnoseContent />
        </Suspense>
    );
}
