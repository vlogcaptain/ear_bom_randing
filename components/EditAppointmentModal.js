'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Calendar, Clock, X, AlertCircle } from 'lucide-react';

export default function EditAppointmentModal({ isOpen, onClose, appointment, onSuccess }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('14:00');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const timeSlots = [
        '10:00', '11:00', '12:00', '13:00', '14:00', 
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    useEffect(() => {
        if (appointment) {
            setDate(appointment.date || '');
            setTime(appointment.time || '14:00');
            setError('');
        }
    }, [appointment, isOpen]);

    if (!isOpen || !appointment) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        if (!date) {
            setError('예약 날짜를 지정해 주세요.');
            return;
        }
        if (!time) {
            setError('예약 시간대를 지정해 주세요.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            // 1. Firestore 예약 정보 업데이트 및 상태를 확정(confirmed)으로 변경
            const appRef = doc(db, 'appointments', appointment.id);
            await updateDoc(appRef, {
                date: date,
                time: time,
                status: 'confirmed'
            });

            // 2. 알리고 자동 확정 안내 문자 전송 (실패하더라도 전체 트랜잭션이 깨지지 않게 안전 처리)
            const recipientPhone = (appointment.userPhone || appointment.phone || '').replace(/[^0-9]/g, '');
            if (recipientPhone) {
                try {
                    const cleanName = appointment.realName || appointment.name || '고객';
                    const smsMessage = `[이어봄 wellness] ${cleanName}님, 조율하신 예약이 확정되었습니다.\n일시: ${date} ${time}\n장소: 서울시 광진구 능동로 59길 27 1층`;
                    
                    console.log("[DEBUG] Sending auto-confirmation SMS to:", recipientPhone);
                    await fetch('/api/sms/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            receiver: recipientPhone,
                            message: smsMessage
                        })
                    });
                } catch (smsErr) {
                    console.error("[ERROR] Failed to send automatic confirmation SMS:", smsErr);
                }
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("[ERROR] Failed to update appointment:", err);
            setError('예약 정보 변경 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#2E7D32]">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800">예약 일정 조율/변경</h2>
                        <p className="text-xs text-slate-500 font-medium">회원 정보: {appointment.realName || appointment.name || '이름없음'}</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-xs font-bold border border-red-100">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                    {/* 날짜 선택 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 ml-1">변경할 예약일</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all text-sm font-semibold"
                                required
                            />
                        </div>
                    </div>

                    {/* 시간 슬롯 선택 */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 ml-1">변경할 시간대</label>
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setTime(slot)}
                                    className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                                        time === slot
                                            ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md shadow-[#2E7D32]/10'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black text-xs transition-all"
                            disabled={saving}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="py-4 bg-black hover:bg-slate-900 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving ? '수정 및 확정 중...' : '수정 및 승인 확정'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
