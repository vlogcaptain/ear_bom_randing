'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Video, Mic, MessageSquare, MapPin } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Footer from '@/components/Footer';

export default function AppointmentPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    // Booking States
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState('video');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [agreementChecked, setAgreementChecked] = useState(false);

    // Calendar States
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6]">
                <div className="w-12 h-12 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

        const expert = {
        name: "백정숙 수석지도사",
        title: "ear bom healthy 대표 전문가",
        image: "/expert_baek.png",
        tags: ["#통증관리", "#스트레스케어", "#이침전문가"],
        description: "수천 년간 이어져 온 전통 이침 요법의 지혜를 현대적인 AI 기술과 결합하여, 누구나 자신의 건강 상태를 쉽고 정확하게 파악할 수 있는 시대를 열고자 합니다."
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

        if (!selectedDate || !selectedTime) {
            alert('상담 날짜와 시간을 선택해 주세요.');
            return;
        }

        setBookingLoading(true);
        try {
            // 방문 상담(offline)인 경우 결제 로직 진행
            if (consultationType === 'offline') {
                if (!window.PortOne) {
                    alert('결제 모듈이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.');
                    setBookingLoading(false);
                    return;
                }

                const paymentId = `payment-${crypto.randomUUID()}`;
                const amount = 10000; // UI상 표시된 최종 결제 금액

                const paymentResponse = await window.PortOne.requestPayment({
                    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
                    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
                    paymentId: paymentId,
                    orderName: `${expert.name} 전문가 상담 예약`,
                    totalAmount: amount,
                    currency: "CURRENCY_KRW",
                    payMethod: "CARD",
                    customer: {
                        fullName: user.displayName || "사용자",
                        email: user.email || "",
                    },
                });

                // 결제 실패 처리
                if (paymentResponse.code !== undefined) {
                    alert(`결제 실패: ${paymentResponse.message}`);
                    setBookingLoading(false);
                    return;
                }

                // 서버 사이드 결제 검증
                const verifyRes = await fetch("/api/payment/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId: paymentResponse.paymentId }),
                });

                const verifyData = await verifyRes.json();
                if (!verifyData.success) {
                    alert(`결제 검증 실패: ${verifyData.message}`);
                    setBookingLoading(false);
                    return;
                }
            }

            // 결제 성공(혹은 무료 상담) 시 DB 저장 진행
            await addDoc(collection(db, 'appointments'), {
                userId: user.uid,
                userName: user.displayName || '사용자',
                expertName: expert.name,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
                type: consultationType,
                status: 'confirmed',
                paymentStatus: consultationType === 'offline' ? 'paid' : 'free',
                createdAt: serverTimestamp()
            });
            alert('예약이 성공적으로 완료되었습니다.');
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
                        ${isSelected ? 'bg-[#2E7D32] text-white shadow-md' : isSelectable ? 'hover:bg-[#E8F5E9] text-slate-700' : 'text-slate-200 cursor-not-allowed'}`}
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
                        <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center relative overflow-hidden p-1.5 shadow-sm">
                            <Image src="/logo.png" alt="logo" width={40} height={40} className="object-contain invert brightness-0" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-[#1B5E20]">ear bom healthy</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-[#2E7D32] transition-colors">로그아웃</button>
                        <div className="w-10 h-10 bg-[#E8F5E9] rounded-full flex items-center justify-center text-[#2E7D32] border border-[#C8E6C9]">
                            <User size={20} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1200px] mx-auto w-full p-6 md:p-8 pt-32 md:pt-40 space-y-10">
                <div className="flex flex-col gap-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/dashboard" className="text-[#2E7D32] font-semibold hover:underline flex items-center gap-1">
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
                                        {expert.tags.map(tag => <span key={tag} className="text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-1 rounded-full">{tag}</span>)}
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                        {expert.name}<br />
                                        <span className="text-lg font-bold text-[#2E7D32]">{expert.title}</span>
                                    </h2>
                                </div>
                                <p className="text-slate-500 leading-relaxed font-medium">{expert.description}</p>
                                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-orange-500 mt-0.5">info</span>
                                    <p className="text-sm text-orange-800 font-bold leading-relaxed text-left">
                                        "외부강의 일정으로 방문 상담은 아래의 시간에 가능합니다"<br />
                                        <span className="text-xs font-medium text-orange-700 mt-1 block">
                                            월 13:30~19:00 / 화 17:30~20:00 / 수 13:00~17:00 / 금 16:00~20:00
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Calendar & Time Selection */}
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-green-50 grid md:grid-cols-2 gap-12">
                            {/* Calendar */}
                            <div className="space-y-8">
                                <h3 className="text-xl font-black flex items-center gap-2 text-slate-800">
                                    <CalendarIcon className="text-[#2E7D32]" size={24} /> 1. 날짜 선택
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="hover:text-[#2E7D32] transition-colors"><ChevronLeft /></button>
                                        <span className="font-black text-lg text-slate-800">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</span>
                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="hover:text-[#2E7D32] transition-colors"><ChevronRight /></button>
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
                                    <Clock className="text-[#2E7D32]" size={24} /> 2. 시간 선택
                                </h3>
                                {!selectedDate ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 py-20">
                                        <CalendarIcon size={48} className="mb-4 opacity-20" />
                                        <p className="font-bold">날짜를 먼저 선택해 주세요.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {generateTimeSlots(selectedDate).length > 0 ? (
                                            generateTimeSlots(selectedDate).map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-4 rounded-2xl font-black text-sm transition-all border-2
                                                        ${selectedTime === time ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-[#2E7D32] hover:text-[#2E7D32]'}`}
                                                >
                                                    {time}
                                                </button>
                                            ))
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
                                <Video className="text-[#2E7D32]" size={24} /> 3. 상담 방식
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'video', label: '화상 상담', icon: <Video /> },
                                    { id: 'offline', label: '방문 상담', icon: <MapPin /> },
                                    { id: 'voice', label: '음성 상담', icon: <Mic /> },
                                    { id: 'chat', label: '채팅 상담', icon: <MessageSquare /> }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setConsultationType(type.id)}
                                        className={`flex flex-col items-center gap-4 p-8 rounded-[32px] transition-all border-2
                                            ${consultationType === type.id ? 'bg-[#E8F5E9]/50 border-[#2E7D32] text-[#2E7D32] shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-[#2E7D32] hover:text-slate-600'}`}
                                    >
                                        <div className={`p-4 rounded-2xl ${consultationType === type.id ? 'bg-[#2E7D32] text-white' : 'bg-slate-50'}`}>
                                            {type.icon}
                                        </div>
                                        <span className="font-black text-sm">{type.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Offline Consultation Info */}
                            {consultationType === 'offline' && (
                                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-[#2E7D32] mt-1 shrink-0" size={20} />
                                        <div className="space-y-2">
                                            <p className="font-bold text-slate-900">방문 상담 장소 : 서울시 광진구 능동로 59길 27 1층</p>
                                            <p className="text-sm font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full inline-block">매주 목요일 오전 11~12시 이침 무료 특강</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[40px] px-6 py-8 md:px-8 md:py-10 shadow-2xl border border-green-50 sticky top-32 space-y-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 border-b border-slate-50 pb-6 mb-8 uppercase tracking-tighter">예약 확인</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#E8F5E9] group-hover:text-[#2E7D32] transition-colors">
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
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#E8F5E9] group-hover:text-[#2E7D32] transition-colors">
                                            {consultationType === 'offline' ? <MapPin size={20} /> : <Video size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">상담 방식</p>
                                            <p className="font-bold text-slate-800">
                                                {consultationType === 'video' ? '화상 상담' :
                                                    consultationType === 'voice' ? '음성 상담' :
                                                        consultationType === 'chat' ? '채팅 상담' : '방문 상담'} (30분)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                                <div className="bg-[#f8fcf8] px-5 py-6 rounded-[32px] border border-[#E8F5E9] space-y-4">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 font-bold text-[13px] shrink-0">상담 비용</span>
                                        <span className="font-black text-slate-800 text-right text-[13px] whitespace-nowrap">
                                            {consultationType === 'offline' ? '상담+침 시술 30,000원' : '결제 금액이 없습니다'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end py-4 border-t border-[#E8F5E9] mt-4 gap-2">
                                        <span className="font-black text-slate-900 shrink-0 pb-1 text-sm">최종 결제 금액</span>
                                        <div className="text-right whitespace-nowrap">
                                            <div className="flex items-baseline justify-end">
                                                <span className="text-3xl font-black text-[#2E7D32] tracking-tighter leading-none">
                                                    {consultationType === 'offline' ? '10,000' : '0'}
                                                </span>
                                                <span className="text-lg font-black text-[#2E7D32] ml-0.5">원</span>
                                            </div>
                                            {consultationType === 'offline' && (
                                                <p className="text-[11px] font-bold text-orange-600 mt-1">(20,000원 현장 결제)</p>
                                            )}
                                        </div>
                                    </div>
                                </div>


                            <div className="space-y-4">
                                <label className="flex items-start gap-3 text-xs text-slate-500 font-medium px-1 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32] transition-all cursor-pointer"
                                        checked={agreementChecked}
                                        onChange={(e) => setAgreementChecked(e.target.checked)}
                                    />
                                    <span className="group-hover:text-slate-800 transition-colors leading-relaxed">
                                        예약 전 <Link href="/terms" target="_blank" className="underline font-bold text-[#2E7D32]">취소 및 환불 규정</Link>을 확인하였으며, 이에 동의합니다.
                                    </span>
                                </label>
                                <button
                                    onClick={handleBooking}
                                    disabled={bookingLoading || !selectedDate || !selectedTime || !agreementChecked}
                                    className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black py-6 rounded-[24px] shadow-xl shadow-[#2E7D32]/20 transition-all transform active:scale-[0.98] text-lg disabled:opacity-50 disabled:grayscale disabled:transform-none"
                                >
                                    {bookingLoading ? '예약 처리 중...' : (consultationType === 'offline' ? '예약 및 결제하기' : '예약하기')}
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
