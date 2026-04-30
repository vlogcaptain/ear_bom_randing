'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import UserSignupForm from './UserSignupForm';

export default function LoginModal({ isOpen, onClose }) {
    const [view, setView] = useState('login'); // 'login', 'signup', or 'gate'
    const [title, setTitle] = useState('로그인');

    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
        setTimeout(() => setView('login'), 300); // 닫힐 때 초기화
    };

    const handleAuthSuccess = () => {
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div
                className="bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 pt-10 pb-6 text-center relative border-none">
                    <button
                        onClick={handleClose}
                        className="absolute right-8 top-10 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-3xl font-black text-[#1B5E20] mb-2">
                        {view === 'login' ? title : '회원가입'}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {view === 'login'
                            ? '건강 리포트 확인을 위해 로그인이 필요합니다.'
                            : '새로운 건강 여정을 시작해보세요.'}
                    </p>
                </div>

                {/* Form Content */}
                <div className="px-8 pb-10">
                    {view === 'login' ? (
                        <LoginForm
                            onSuccess={handleAuthSuccess}
                            onTitleChange={(newTitle) => setTitle(newTitle)}
                            onSwitchToSignup={() => { setView('signup'); setTitle('회원가입'); }}
                        />
                    ) : (
                        <UserSignupForm
                            onSuccess={handleAuthSuccess}
                            onSwitchToLogin={() => { setView('login'); setTitle('로그인'); }}
                        />
                    )}
                </div>
            </div>

            {/* Backdrop shadow for closing */}
            <div
                className="absolute inset-0 -z-10"
                onClick={onClose}
            ></div>
        </div>
    );
}
