'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import UserSignupForm from '../../components/UserSignupForm';
import { ChevronLeft } from 'lucide-react';

function SignupContent() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-20">
            <div className="bg-white w-full max-w-[600px] rounded-[40px] shadow-2xl relative overflow-hidden p-8 md:p-12">
                <div className="mb-10">
                    <Link href="/login" className="inline-flex items-center gap-1 text-[#2E7D32] font-bold text-sm hover:underline mb-6">
                        <ChevronLeft size={16} /> 로그인으로 돌아가기
                    </Link>
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-[#1B5E20] mb-2">회원가입</h2>
                        <p className="text-slate-500 font-medium">ear bom healthy의 새로운 가족이 되어보세요.</p>
                    </div>
                </div>

                <UserSignupForm />

                <p className="text-center text-slate-400 text-sm font-medium mt-8">
                    이미 계정이 있으신가요? <Link href="/login" className="text-[#2E7D32] font-bold hover:underline">로그인하기</Link>
                </p>
            </div>
        </div>
    );
}

export default function Signup() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <SignupContent />
        </Suspense>
    );
}
