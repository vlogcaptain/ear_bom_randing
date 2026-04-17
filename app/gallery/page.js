'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, ZoomIn } from 'lucide-react';

export default function GalleryPage() {
    // 업로드된 이미지 리스트 (파일명 기준)
    const images = [
        "갑상선저하증 편두통(우).png", "갑상선저하증 편두통(좌).png",
        "고혈압 고지혈증(우).png", "고혈압 고지혈증(좌).png",
        "고혈압 당뇨 어깨통증(우).png", "고혈압 당뇨 어깨통증(좌).png",
        "고혈압 목디스크(우).png", "고혈압 목디스크(좌).png",
        "긴장성두통 수족냉증(우).png", "긴장성두통 수족냉증(좌).png",
        "당뇨 고지혈 고혈압.png", "두통(우).png", "두통(좌).png",
        "등통증 명치답답 수족냉증.png", "만성피로 뒷목통증 과민성대장.png",
        "만성피로 팔꿈치통증(우).png", "만성피로 팔꿈치통증(좌).png",
        "목 이물감 치루.png", "목통증 가슴답답 자주 건망증빈번(우).png",
        "목통증 가슴답답 자주 건망증빈번(좌).png", "목통증 심한두통.png",
        "발목통증.png", "소화불량 두통.png", "소화불량 뒷골당김 안구건조.png",
        "소화불량 어깨통증.png", "소화불편감 만성피로.png",
        "손발저림 다리통증 건망증.png", "수면불량 장불편감(우).png",
        "수면불량 장불편감(좌).png", "심한 피로감(우).png",
        "심한 피로감(좌).png", "어깨통증.png", "어지럼증 고혈압.png",
        "역류성식도염 수전증.png", "역류성식도염(우).png", "역류성식도염(좌).png",
        "자궁근종으로 자궁부분절제(우).png", "자궁근종으로 자궁부분절제(좌).png",
        "전신통증 특히 목허리통증(우).png", "전신통증 특히 목허리통증(좌).png",
        "척추협착증(우).png", "척추협착증(좌).png",
        "하복부 수족냉증 허리어깨통증.png", "허리 팔 통증심함(우).png",
        "허리 팔 통증심함(좌).png", "허리디스크수술.png"
    ];

    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* 상단 헤더 */}
            <header className="bg-white border-b sticky top-0 z-30 px-4 py-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">이침 사례 갤러리</h1>
                            <p className="text-sm text-slate-500 hidden sm:block">다양한 임상 사례를 통한 이침의 효과 확인</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                        <ImageIcon className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">{images.length}</span>
                        <span className="text-emerald-600 text-sm">Cases</span>
                    </div>
                </div>
            </header>

            {/* 그리드 컨텐츠 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((imgName, index) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-slate-100"
                            onClick={() => setSelectedImage(imgName)}
                        >
                            {/* 이미지 컨테이너 */}
                            <div className="aspect-[3/4] overflow-hidden">
                                <img
                                    src={`/images/gallery/${imgName}`}
                                    alt={imgName}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>

                            {/* 호버 오버레이 (파일명 표시) */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                                <span className="text-white font-medium text-lg leading-snug transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {imgName.replace('.png', '')}
                                </span>
                                <div className="mt-4 p-2 bg-white/20 rounded-full backdrop-blur-sm transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 delay-100">
                                    <ZoomIn className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            {/* 하단 캡션 (모바일 대응) */}
                            <div className="p-4 bg-white border-t border-slate-50 sm:hidden">
                                <p className="text-sm font-medium text-slate-800 truncate">{imgName.replace('.png', '')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* 이미지 라이트박스 모달 (간이형) */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
                        <X className="w-8 h-8" />
                    </button>
                    <div className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
                        <img
                            src={`/images/gallery/${selectedImage}`}
                            alt={selectedImage}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                            <p className="text-white font-medium text-lg text-center">
                                {selectedImage.replace('.png', '')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 아이콘 컴포넌트 추가를 위해 shadcn이나 lucide가 설치되어 있다고 가정 (현재 프로젝트에 lucide-react 있음)
function X({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}
