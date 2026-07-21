'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Video, Mic, MessageSquare, MapPin, FileText } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import Footer from '@/components/Footer';

const typeLabelMap = {
    offline: '대면 상담 (방문)',
    video: '비대면 상담',
    oneday: '원데이 클래스 (60,000원)',
    '5weeks': '5주 입문과정 (400,000원)'
};

function AppointmentContent() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    // Booking States
    const searchParams = useSearchParams();
    const typeParam = searchParams ? searchParams.get('type') : null;

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState('video');
    const [consultationMemo, setConsultationMemo] = useState('');

    useEffect(() => {
        if (typeParam) {
            if (typeParam === 'oneday') setConsultationType('oneday');
            else if (typeParam === '5weeks') setConsultationType('5weeks');
            else if (typeParam === 'offline') setConsultationType('offline');
            else if (typeParam === 'video') setConsultationType('video');
        }
    }, [typeParam]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [agreementChecked, setAgreementChecked] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);

    // Calendar States
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchBookedSlots = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'appointments'));
                const slots = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.status !== 'cancelled' && data.date && data.time) {
                        slots.push({ date: data.date, time: data.time });
                    }
                });
                setBookedSlots(slots);
            } catch (error) {
                console.error("Error fetching appointments: ", error);
            }
        };
        fetchBookedSlots();
    }, []);

    const isTimeSlotBooked = (time) => {
        if (!selectedDate) return false;
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return bookedSlots.some(slot => slot.date === dateStr && slot.time === time);
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6]">
                <div className="w-12 h-12 border-4 border-[#F697AB] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

        const expert = {
        name: "백정숙 수석지도사",
        title: "earbom wellness 대표 전문가",
        image: "/expert_baek.png",
        tags: ["#통증관리", "#스트레스케어", "#이침전문가"],
        description: "수천 년간 이어져 온 전통 이침 요법의 지혜를 전문가의 분석력과 결합하여, 누구나 자신의 건강 상태를 쉽고 정확하게 파악할 수 있는 시대를 열고자 합니다."
    };

    const availability = {
        1: { start: "13:30", end: "19:00" }, // 월
        2: { start: "17:30", end: "20:00" }, // 화
        3: { start: "13:00", end: "17:00" }, // 수
        5: { start: "16:00", end: "20:00" }  // 금
    };

    const generateTimeSlots = (date) => {
        if (!date) return [];
        const day = date.getDay();
        const config = availability[day];
        if (!config) return [];

        const slots = [];
        let [startH, startM] = config.start.split(':').map(Number);
        let [endH, endM] = config.end.split(':').map(Number);

        let current = new Date();
        current.setHours(startH, startM, 0, 0);
        const end = new Date();
        end.setHours(endH, endM, 0, 0);

        while (current <= end) {
            slots.push(current.toTimeString().substring(0, 5));
            current.setMinutes(current.getMinutes() + 30);
        }
        return slots;
    };

    const handleDateSelect = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(date);
        setSelectedTime('');
    };

    const handleBooking = async () => {
        const isCourseType = consultationType === 'oneday' || consultationType === '5weeks';

        if (!isCourseType && (!selectedDate || !selectedTime)) {
            alert('상담 날짜와 시간을 선택해 주세요.');
            return;
        }

        setBookingLoading(true);
        try {
            let dateStr = '';
            let timeStr = '';

            if (consultationType === 'oneday') {
                dateStr = '2026-09-07';
                timeStr = '14:00~17:00';
            } else if (consultationType === '5weeks') {
                dateStr = '2026-09-21';
                timeStr = '14:00~17:00 (5주과정)';
            } else if (selectedDate) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                dateStr = `${year}-${month}-${day}`;
                timeStr = selectedTime;
            }

            // 예약/신청 데이터 DB 저장 진행 (온라인 결제 심사 중이므로 pending 상태로 접수)
            await addDoc(collection(db, 'appointments'), {
                userId: user.uid,
                userName: user.displayName || '사용자',
                expertName: expert.name,
                date: dateStr,
                time: timeStr,
                type: consultationType,
                memo: consultationMemo || '',
                status: 'pending',
                paymentStatus: 'pending_confirmation',
                createdAt: serverTimestamp()
            });

            // 관리자 대상 SMS 알림 전송 (비동기, 예약 성공 자체를 방해하지 않음)
            try {
                const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || '010-5266-0150';
                await fetch('/api/sms/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: adminPhone,
                        message: `[이어봄 알림]\n새로운 예약/신청이 대기 중입니다.\n\n- 신청자: ${user.displayName || '사용자'}님\n- 일정: ${dateStr} (${selectedTime})\n- 구분: ${typeLabelMap[consultationType] || consultationType}\n\n관리자 대시보드에서 승인을 진행해 주세요.`
                    })
                });
            } catch (smsErr) {
                console.error("Failed to send admin notification SMS:", smsErr);
            }

            alert('수강 및 상담 신청이 성공적으로 접수되었습니다.\n\n[무통장 입금 계좌 안내]\n신한은행 907-04-259313 백정숙(이어봄웰니스)\n\n입금 완료해 주신 신청자분께는 담당 매니저가 입금 확인 후 개별 연락(SMS/전화)을 드립니다.');
            router.push('/dashboard');
        } catch (error) {
            console.error("Booking error:", error);
            alert('예약 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setBookingLoading(false);
        }
    };

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
        }

        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(year, month, i);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Limit to 3 months including current month (e.g., if Mar, then Mar, Apr, May)
            const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
            maxDate.setHours(23, 59, 59, 999);

            const isSelectable = availability[date.getDay()] && date >= today && date <= maxDate;
            const isSelected = selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

            days.push(
                <button
                    key={i}
                    onClick={() => isSelectable && handleDateSelect(i)}
                    className={`aspect-square flex items-center justify-center text-sm font-bold rounded-full transition-all
                        ${isSelected ? 'bg-[#F697AB] text-white shadow-md' : isSelectable ? 'hover:bg-[#FFF0F2] text-slate-700' : 'text-slate-200 cursor-not-allowed'}`}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f8f7f6] font-sans text-slate-900 overflow-x-hidden">
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-green-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#F697AB] rounded-xl flex items-center justify-center relative shadow-sm">
                            <Image src="/logo.png" alt="logo" width={52} height={52} className="object-contain invert brightness-0" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-[#C6566D]">earbom wellness</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-[#F697AB] transition-colors">로그아웃</button>
                        <div className="w-10 h-10 bg-[#FFF0F2] rounded-full flex items-center justify-center text-[#F697AB] border border-[#C8E6C9]">
                            <User size={20} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1200px] mx-auto w-full p-6 md:p-8 pt-32 md:pt-40 space-y-10">
                <div className="flex flex-col gap-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/dashboard" className="text-[#F697AB] font-semibold hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> 대시보드
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-slate-900">상담 예약</span>
                    </nav>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">전문가 1:1 상담 예약</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Fixed Expert Profile */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-green-50 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className="w-40 h-48 rounded-3xl overflow-hidden shadow-lg border-4 border-white flex-shrink-0 bg-slate-100">
                                <img src={expert.image} alt={expert.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex justify-center md:justify-start gap-2 mb-2">
                                        {expert.tags.map(tag => <span key={tag} className="text-[11px] font-bold text-[#F697AB] bg-[#FFF0F2] px-2 py-1 rounded-full">{tag}</span>)}
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                        {expert.name}<br />
                                        <span className="text-lg font-bold text-[#F697AB]">{expert.title}</span>
                                    </h2>
                                </div>
                                <p className="text-slate-500 leading-relaxed font-medium">{expert.description}</p>
                            </div>
                        </div>

                        {/* Calendar & Time Selection */}
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-green-50 grid md:grid-cols-2 gap-12">
                            {/* Calendar */}
                            <div className="space-y-8">
                                <h3 className="text-xl font-black flex items-center gap-2 text-slate-800">
                                    <CalendarIcon className="text-[#F697AB]" size={24} /> 1. 날짜 선택
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="hover:text-[#F697AB] transition-colors"><ChevronLeft /></button>
                                        <span className="font-black text-lg text-slate-800">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</span>
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="hover:text-[#F697AB] transition-colors"><ChevronRight /></button>
                                    </div>
                                    <div className="grid grid-cols-7 text-center text-xs font-black text-slate-300 uppercase tracking-widest mb-4">
                                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-3">
                                        {renderCalendar()}
                                    </div>
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-8 border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-12">
                                <h3 className="text-xl font-black flex items-center gap-2 text-slate-800">
                                    <Clock className="text-[#F697AB]" size={24} /> 2. 시간 선택
                                </h3>
                                {!selectedDate ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 py-20">
                                        <CalendarIcon size={48} className="mb-4 opacity-20" />
                                        <p className="font-bold">날짜를 먼저 선택해 주세요.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {generateTimeSlots(selectedDate).length > 0 ? (
                                            generateTimeSlots(selectedDate).map(time => {
                                                const isBooked = isTimeSlotBooked(time);
                                                return (
                                                    <button
                                                        key={time}
                                                        disabled={isBooked}
                                                        onClick={() => !isBooked && setSelectedTime(time)}
                                                        className={`py-4 rounded-2xl font-black text-sm transition-all border-2
                                                            ${isBooked 
                                                                ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' 
                                                                : selectedTime === time 
                                                                    ? 'bg-[#F697AB] border-[#F697AB] text-white shadow-lg' 
                                                                    : 'bg-white border-slate-100 text-slate-600 hover:border-[#F697AB] hover:text-[#F697AB]'}`}
                                                    >
                                                        {time} {isBooked && "(예약 완료)"}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <p className="col-span-2 text-center text-slate-400 py-10 font-bold">해당 요일은 상담이 없습니다.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Consultation Type */}
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-green-50 space-y-8">
                            <h3 className="text-xl font-black flex items-center gap-2 text-slate-800">
                                <Video className="text-[#F697AB]" size={24} /> 3. 상담 및 강좌 종류 선택
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: 'video', label: '1:1 비대면 상담', sub: '온라인 화상 1:1 웰니스 케어', icon: <Video /> },
                                    { id: 'offline', label: '1:1 대면 방문 상담', sub: '서울 광진구 센터 직접 방문', icon: <MapPin /> },
                                    { id: 'oneday', label: '원데이 클래스 (60,000원)', sub: '3시간 실습 체험 / 재료비 포함', icon: <FileText /> },
                                    { id: '5weeks', label: '5주 입문과정 (400,000원)', sub: '주 3시간 × 5주 마스터 코스', icon: <FileText /> }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setConsultationType(type.id)}
                                        className={`flex flex-col items-start text-left gap-3 p-6 rounded-[28px] transition-all border-2
                                            ${consultationType === type.id ? 'bg-[#FFF0F2]/60 border-[#F697AB] text-[#1B5E20] shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-[#F697AB] hover:text-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className={`p-3 rounded-2xl shrink-0 ${consultationType === type.id ? 'bg-[#F697AB] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                {type.icon}
                                            </div>
                                            <span className="font-extrabold text-sm">{type.label}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium pl-1">{type.sub}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Offline Consultation Info */}
                            {consultationType === 'offline' && (
                                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-[#F697AB] mt-1 shrink-0" size={20} />
                                        <div className="space-y-2">
                                            <p className="font-bold text-slate-900">방문 상담 장소 : 서울시 광진구 능동로 59길 27 1층</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Consultation Memo */}
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-green-50 space-y-6">
                            <h3 className="text-xl font-black flex items-center gap-2 text-slate-800">
                                <FileText className="text-[#F697AB]" size={24} /> 4. 상담하고 싶은 내용 (원하는 상담 내용)
                            </h3>
                            <textarea
                                value={consultationMemo}
                                onChange={(e) => setConsultationMemo(e.target.value)}
                                placeholder="원하는 상담 주제, 증상 등 상담 지도사에게 전하고 싶은 내용을 자유롭게 작성해 주세요 (예: 최근 허리 통증 완화, 스트레스 불면증 해소 등)"
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F697AB] focus:border-transparent transition-all font-medium text-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[40px] px-6 py-8 md:px-8 md:py-10 shadow-2xl border border-green-50 sticky top-32 space-y-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 border-b border-slate-50 pb-6 mb-8 uppercase tracking-tighter">예약 확인</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#FFF0F2] group-hover:text-[#F697AB] transition-colors">
                                            <CalendarIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">예약 일정</p>
                                            <p className="font-bold text-slate-800">
                                                {selectedDate ? selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) : '날짜를 선택해 주세요'}
                                                {selectedTime && ` ${selectedTime}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#FFF0F2] group-hover:text-[#F697AB] transition-colors">
                                            {consultationType === 'offline' ? <MapPin size={20} /> : <Video size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">상담 방식</p>
                                            <p className="font-bold text-slate-800">
                                                {consultationType === 'offline' ? '대면 상담 (방문)' : '비대면 상담'} (30분)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                                {/* Bank Account Notice Banner */}
                                <div className="bg-[#FFF0F2]/70 px-5 py-6 rounded-[28px] border border-pink-200/90 space-y-4">
                                    <div className="flex items-center gap-1.5 text-[#C6566D] font-extrabold text-xs uppercase tracking-wider">
                                        <span className="w-2 h-2 bg-[#F697AB] rounded-full animate-ping"></span>
                                        수강료 / 상담비 입금 계좌 안내
                                    </div>
                                    
                                    <div className="bg-white p-3.5 rounded-2xl border border-pink-100 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-extrabold text-slate-800">신한은행</span>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText('90704259313');
                                                    alert('계좌번호(신한은행 907-04-259313)가 클립보드에 복사되었습니다.');
                                                }}
                                                className="text-[11px] font-bold text-[#C6566D] bg-[#FFF0F2] hover:bg-[#F697AB] hover:text-white px-2.5 py-1 rounded-lg transition-all border border-pink-200 cursor-pointer"
                                            >
                                                계좌 복사
                                            </button>
                                        </div>
                                        <p className="font-black text-slate-900 text-sm tracking-tight">907-04-259313</p>
                                        <p className="text-[11px] font-bold text-slate-500">예금주: 백정숙 (이어봄웰니스)</p>
                                    </div>

                                    <div className="space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
                                        <p className="flex items-start gap-1">
                                            <span className="text-[#C6566D] font-bold">🔔</span>
                                            <span>신청 완료 후 수강료를 입금해 주시면, <strong>담당 매니저가 확인 후 개별 연락(SMS/전화)</strong>을 드립니다.</span>
                                        </p>
                                        {consultationType === '5weeks' && (
                                            <p className="text-[11px] font-bold text-[#C6566D] bg-white/90 p-2.5 rounded-xl border border-pink-200">
                                                🎁 원데이 클래스 수강생 특전 5만원 할인이 적용되는 과정입니다.
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t border-pink-200/60 flex justify-between items-center text-[11px] font-bold text-slate-500">
                                        <span>신청 구분: {typeLabelMap[consultationType] || consultationType}</span>
                                        <span className="text-[#C6566D]">입금 확인 후 승인</span>
                                    </div>
                                </div>


                            <div className="space-y-4">
                                <label className="flex items-start gap-3 text-xs text-slate-500 font-medium px-1 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#F697AB] focus:ring-[#F697AB] transition-all cursor-pointer"
                                        checked={agreementChecked}
                                        onChange={(e) => setAgreementChecked(e.target.checked)}
                                    />
                                    <span className="group-hover:text-slate-800 transition-colors leading-relaxed">
                                        예약 전 <Link href="/terms" className="underline font-bold text-[#F697AB]">취소 및 환불 규정</Link>을 확인하였으며, 이에 동의합니다.
                                    </span>
                                </label>
                                <button
                                    onClick={handleBooking}
                                    disabled={bookingLoading || ((consultationType === 'video' || consultationType === 'offline') && (!selectedDate || !selectedTime)) || !agreementChecked}
                                    className="w-full bg-[#F697AB] hover:bg-[#C6566D] text-white font-black py-6 rounded-[24px] shadow-xl shadow-[#F697AB]/20 transition-all transform active:scale-[0.98] text-lg disabled:opacity-50 disabled:grayscale disabled:transform-none"
                                >
                                    {bookingLoading ? '신청 처리 중...' : '예약 및 수강 신청 완료'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function AppointmentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-pale">
                <div className="text-center font-bold text-slate-500">예약 페이지를 불러오는 중입니다...</div>
            </div>
        }>
            <AppointmentContent />
        </Suspense>
    );
}
