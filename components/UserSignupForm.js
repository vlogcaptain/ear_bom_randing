'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Phone, User, Loader2, Check, MessageSquare, Info } from 'lucide-react';
import { 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function UserSignupForm({ onSwitchToLogin }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authMode, setAuthMode] = useState('email'); // 'email' or 'phone'
    const recaptchaVerifierRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
    });

    // Phone Auth State
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);

    useEffect(() => {
        const initRecaptcha = () => {
            if (typeof window !== 'undefined' && authMode === 'phone' && !recaptchaVerifierRef.current && auth) {
                try {
                    const container = document.getElementById('recaptcha-container-signup');
                    if (container) {
                        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container-signup', {
                            'size': 'invisible',
                            'callback': () => {
                                console.log('reCAPTCHA solved');
                            }
                        });
                        recaptchaVerifierRef.current = verifier;
                    }
                } catch (err) {
                    console.error('reCAPTCHA initialization failed:', err);
                }
            }
        };

        if (mounted && authMode === 'phone') {
            initRecaptcha();
        }

        return () => {
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                    recaptchaVerifierRef.current = null;
                } catch (e) { }
            }
        };
    }, [authMode, mounted]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (formData.password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: formData.name
            });

            await sendEmailVerification(user);

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                createdAt: serverTimestamp(),
                role: 'user'
            });

            alert('회원가입이 완료되었습니다!');
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('이미 사용 중인 이메일입니다.');
            } else {
                setError('회원가입 처리 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            setError('이름을 입력해 주세요.');
            return;
        }
        if (!formData.phoneNumber) {
            setError('전화번호를 입력해 주세요.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            if (!recaptchaVerifierRef.current) {
                throw new Error('reCAPTCHA 초기화 실패. 잠시 후 다시 시도해 주세요.');
            }
            const formattedPhone = formData.phoneNumber.startsWith('+') ? formData.phoneNumber : `+82${formData.phoneNumber.replace(/^0/, '')}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
            setConfirmationResult(confirmation);
        } catch (err) {
            console.error('Phone Auth Error:', err);
            setError(`인증번호 전송 실패: ${err.message || '번호를 확인해 주세요.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await confirmationResult.confirm(verificationCode);
            const user = result.user;

            // Update display name
            await updateProfile(user, {
                displayName: formData.name
            });

            // Save to Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                    createdAt: serverTimestamp(),
                    role: 'user'
                });
            }

            alert('회원가입 및 로그인이 완료되었습니다!');
            router.push('/dashboard');
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
                    type="button"
                    onClick={() => { setAuthMode('phone'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'phone' ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Phone size={16} />
                    전화번호 가입
                </button>
                <button
                    type="button"
                    onClick={() => { setAuthMode('email'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'email' ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Mail size={16} />
                    이메일 가입
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 border border-red-100">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

            {authMode === 'email' ? (
                <form onSubmit={handleEmailSignup} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">이름</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                placeholder="홍길동"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">이메일</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                placeholder="example@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">비밀번호</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">비밀번호 확인</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#1B5E20] transition-all shadow-lg shadow-[#2E7D32]/20 disabled:opacity-50 mt-4"
                    >
                        {loading ? '처리 중...' : '이메일로 가입하기'}
                    </button>
                </form>
            ) : (
                <div className="space-y-5">
                    {!confirmationResult ? (
                        <form onSubmit={handleSendCode} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">이름</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                        placeholder="홍길동"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">전화번호</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/5 transition-all"
                                        placeholder="01012345678"
                                        required
                                    />
                                </div>
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
                        <form onSubmit={handleVerifyAndSignup} className="space-y-5">
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
                                <div className="mt-2 space-y-1 ml-1">
                                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                        <Info size={12} />
                                        인증번호는 Google 시스템을 통해 국외발송됩니다. 스팸 차단 설정을 확인해 주세요.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#1B5E20] transition-all shadow-lg shadow-[#2E7D32]/20 disabled:opacity-50 mt-4"
                            >
                                {loading ? '가입 처리 중...' : '인증 및 가입 완료'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            <div id="recaptcha-container-signup"></div>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm font-medium mb-3">
                    이미 계정이 있으신가요?
                </p>
                <button 
                    type="button"
                    onClick={() => onSwitchToLogin ? onSwitchToLogin() : router.push('/login')} 
                    className="w-full py-4 bg-white border-2 border-[#2E7D32] text-[#2E7D32] rounded-2xl font-black text-lg hover:bg-[#2E7D32]/5 transition-all"
                >
                    로그인하고 계속하기
                </button>
            </div>
        </div>
    );
}
