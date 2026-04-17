'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Phone, User, Loader2, Check } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function UserSignupForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
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
            // 1. Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // 2. Update Profile Name
            await updateProfile(user, {
                displayName: formData.name
            });

            // 3. Send Verification Email
            await sendEmailVerification(user);

            // 4. Save additional info to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                createdAt: serverTimestamp(),
                role: 'user'
            });

            alert('회원가입이 완료되었습니다! 입력하신 이메일함에서 인증 메일을 확인해 주세요.');
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

    return (
        <form onSubmit={handleSignup} className="space-y-5">
            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 border border-red-100">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

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
                className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#1B5E20] transition-all shadow-lg shadow-[#2E7D32]/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={24} />
                        처리 중...
                    </>
                ) : '가입하기'}
            </button>
        </form>
    );
}
