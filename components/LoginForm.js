'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Check, Phone, MessageSquare, X, UserCircle } from 'lucide-react';
import {
    signInWithEmailAndPassword,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signInAnonymously
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginForm({ onSuccess, onTitleChange, onSwitchToSignup }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState('phone'); // 'email' or 'phone'
    const recaptchaVerifierRef = useRef(null);


    // Email Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone Auth State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const initRecaptcha = () => {
            if (typeof window !== 'undefined' && authMode === 'phone' && !recaptchaVerifierRef.current) {
                try {
                    const container = document.getElementById('recaptcha-container');
                    if (container) {
                        console.log('Initializing reCAPTCHA (size: normal for debugging)...');
                        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                            'size': 'normal',
                            'callback': (response) => {
                                console.log('reCAPTCHA solved, token obtained');
                            },
                            'expired-callback': () => {
                                console.log('reCAPTCHA expired, resetting...');
                            }
                        });
                        recaptchaVerifierRef.current = verifier;
                        console.log('reCAPTCHA initialized successfully');
                    }
                } catch (err) {
                    console.error('reCAPTCHA initialization failed:', err);
                }
            }
        };

        if (authMode === 'phone') {
            initRecaptcha();
        }

        return () => {
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                    recaptchaVerifierRef.current = null;
                    console.log('reCAPTCHA cleared');
                } catch (e) {
                    console.error('Error clearing reCAPTCHA:', e);
                }
            }
        };
    }, [authMode]);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (onSuccess) onSuccess();
            else router.push('/dashboard');
        } catch (err) {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!recaptchaVerifierRef.current) {
                throw new Error('reCAPTCHA가 초기화되지 않았습니다. 잠시 후 다시 시도해 주세요.');
            }
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+82${phoneNumber.replace(/^0/, '')}`;
            console.log('Attempting signInWithPhoneNumber for:', formattedPhone);
            console.log('Auth Instance Status:', auth ? 'Initialized' : 'Missing');
            console.log('reCAPTCHA Verifier Ref:', recaptchaVerifierRef.current ? 'Ready' : 'Missing');

            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
            setConfirmationResult(confirmation);
            if (onTitleChange) onTitleChange('인증번호 입력');
        } catch (err) {
            console.error('Phone Auth Error:', err);
            if (err.code === 'auth/invalid-app-credential') {
                setError('앱 설정이 올바르지 않거나 도메인이 허용되지 않았습니다. (Firebase Console 설정 확인 필요)');
            } else {
                setError(`인증번호 전송 실패: ${err.message || '번호를 확인해 주세요.'}`);
            }
            // 에러 발생 시 리캡차 초기화
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                    recaptchaVerifierRef.current = null;
                } catch (e) { }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await confirmationResult.confirm(verificationCode);
            if (onSuccess) onSuccess();
            else router.push('/dashboard');
        } catch (err) {
            setError('인증번호가 일치하지 않습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                <button
                    onClick={() => { setAuthMode('phone'); setConfirmationResult(null); setError(''); if (onTitleChange) onTitleChange('로그인'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'phone' ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Phone size={16} />
                    전화번호 인증
                </button>
                <button
                    onClick={() => { setAuthMode('email'); setError(''); if (onTitleChange) onTitleChange('로그인'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'email' ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Mail size={16} />
                    이메일 로그인
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 border border-red-100">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

            {authMode === 'email' ? (
                <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">이메일</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                placeholder="example@email.com"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">비밀번호</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#1B5E20] transition-all shadow-lg shadow-[#2E7D32]/20 disabled:opacity-50 mt-4"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
            ) : (
                <div className="space-y-5">
                    {!confirmationResult ? (
                        <form onSubmit={handleSendCode} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">전화번호</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                        placeholder="01012345678"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 ml-1">'-' 없이 숫자만 입력해 주세요.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#1B5E20] transition-all shadow-lg shadow-[#2E7D32]/20 disabled:opacity-50 mt-4"
                            >
                                {loading ? '전송 중...' : '인증번호 받기'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">인증번호</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                        placeholder="6자리 숫자 입력"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfirmationResult(null)}
                                    className="text-xs text-[#2E7D32] font-bold hover:underline ml-1"
                                >
                                    번호 재입력
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#1B5E20] transition-all shadow-lg shadow-[#2E7D32]/20 disabled:opacity-50 mt-4"
                            >
                                {loading ? '확인 중...' : '인증 완료'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            <div id="recaptcha-container" className="mt-4 flex justify-center"></div>


            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-medium mb-3">
                    처음이신가요?
                </p>
                <button 
                    onClick={() => router.push('/signup')} 
                    className="w-full py-4 bg-white border-2 border-[#2E7D32] text-[#2E7D32] rounded-2xl font-black text-lg hover:bg-[#2E7D32]/5 transition-all"
                >
                    회원가입하고 시작하기
                </button>
            </div>

            <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-start gap-3">
                    <Check className="text-[#2E7D32] mt-0.5" size={18} />
                    <div>
                        <p className="text-[13px] font-bold text-slate-800 mb-1">안전한 개인정보 보호</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            귀하의 건강 데이터는 암호화되어 안전하게 관리되며, 서비스 목적 외에는 사용되지 않습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
