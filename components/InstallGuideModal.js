'use client';

import { useState } from 'react';
import { X, Smartphone, QrCode, Monitor, Apple, Smartphone as AndroidIcon } from 'lucide-react';
import Image from 'next/image';

export default function InstallGuideModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('ios'); // ios, android

    if (!isOpen) return null;

    const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://earbom.app";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div
                className="bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 pt-10 pb-4 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute right-8 top-10 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Smartphone size={32} className="text-[#2E7D32]" />
                    </div>
                    <h2 className="text-3xl font-black text-[#1B5E20] mb-2 leading-tight">
                        모바일에서 설치하고<br />편하게 이용하세요!
                    </h2>
                    <p className="text-slate-500 font-medium">
                        스마트폰으로 아래 QR 코드를 스캔해 주세요.
                    </p>
                </div>

                {/* Platform Tabs */}
                <div className="px-8 pb-4">
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setActiveTab('ios')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'ios' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Apple size={16} />
                            iOS
                        </button>
                        <button
                            onClick={() => setActiveTab('android')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'android' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <AndroidIcon size={16} />
                            Android
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-10 flex flex-col items-center">
                    {/* QR Code Placeholder */}
                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 mb-8 relative group">
                        <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                            <img 
                                src={qrUrl} 
                                alt="QR Code to earbom.app"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#FFB74D] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                            earbom.app 접속
                        </div>
                    </div>

                    {/* Guide Steps */}
                    <div className="w-full space-y-4">
                        <div className="flex gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                <span className="font-bold text-[#2E7D32]">1</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed pt-1">
                                스마트폰 카메라로 <span className="font-bold text-gray-900">QR 코드를 스캔</span>하여 서비스에 접속합니다.
                            </p>
                        </div>
                        <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                                <span className="font-bold text-gray-500">2</span>
                            </div>
                            <div className="text-sm text-gray-600 leading-relaxed pt-1">
                                <p className="font-bold text-gray-900 mb-1">홈 화면에 추가하기</p>
                                {activeTab === 'ios' ? (
                                    <p className="text-xs">
                                        <span className="text-indigo-600 font-bold">iOS:</span> 브라우저 하단 <span className="font-bold">[공유]</span> 버튼 클릭 → <span className="font-bold">[홈 화면에 추가]</span> 선택
                                    </p>
                                ) : (
                                    <p className="text-xs">
                                        <span className="text-[#2E7D32] font-bold">Android:</span> 브라우저 우측 상단 <span className="font-bold">[설정/더보기]</span> 클릭 → <span className="font-bold">[앱 설치]</span> 또는 <span className="font-bold">[홈 화면에 추가]</span> 선택
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-8 bg-[#2E7D32] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#1B5E20] transition-all"
                    >
                        확인했습니다
                    </button>
                </div>
            </div>

            {/* Backdrop for closing */}
            <div
                className="absolute inset-0 -z-10"
                onClick={onClose}
            ></div>
        </div>
    );
}
