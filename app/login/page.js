'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const [title, setTitle] = useState('로그인');
    const from = searchParams.get('from') || '/dashboard';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl relative overflow-hidden p-8 md:p-12">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-[#1B5E20] mb-2">
                        {title}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        건강 리포트 확인을 위해 로그인이 필요합니다.
                    </p>
                </div>

                <LoginForm
                    onSuccess={(isNewUser) => {
                        if (isNewUser) {
                            router.push('/survey');
                        } else {
                            router.push(from);
                        }
                    }}
                    onTitleChange={(newTitle) => setTitle(newTitle)}
                />
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
