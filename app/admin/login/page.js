'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function AdminLoginPage() {
    const router = useRouter();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 전문가 세션 확인
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const adminEmails = ['js100216@naver.com', 'vlogcaptain@gmail.com', 'earbombeak@earbom.com'];
            if (user && adminEmails.includes(user.email)) {
                router.push('/admin');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Firebase Auth 로그인
            await signInWithEmailAndPassword(auth, id, password);
            
            // 로그인 성공 시 useEffect의 onAuthStateChanged가 /admin으로 리다이렉트 처리함
        } catch (err) {
            console.error("Admin Login Error:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('아이디 또는 비밀번호가 일치하지 않습니다.');
            } else if (err.code === 'auth/invalid-email') {
                setError('올바른 이메일 형식이 아닙니다.');
            } else {
                setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-[#2E7D32] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-900/10">
                        <Image
                            src="/logo.png"
                            alt="ear bom healthy logo"
                            width={84}
                            height={84}
                            className="object-contain invert brightness-0"
                        />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">전문가 관리 시스템</h1>
                    <p className="text-slate-500 font-medium mt-2">ADMIN CONSOLE</p>
                </div>

                {/* Login Card */}
                <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm font-bold p-4 rounded-xl border border-red-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">관리자 아이디</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder="ID를 입력해 주세요"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">비밀번호</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호를 입력해 주세요"
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-all font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1B5E20] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#1B5E20]/90 transition-all shadow-lg shadow-green-900/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>로그인</span>
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full group-hover:animate-ping"></div>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-slate-400 text-xs font-medium">
                    © 2026 ear bom healthy. Authorized expert only.
                </div>
            </div>
        </div>
    );
}
