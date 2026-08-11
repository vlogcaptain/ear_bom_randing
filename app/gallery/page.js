'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, ZoomIn, LogOut, ChevronDown, ChevronUp, X as XIcon, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { galleryImages, symptomCategories } from './galleryData';

export default function GalleryPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // 필터 상태
    const [selectedImage, setSelectedImage] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);

    // 카테고리 열기/닫기
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // 증상 선택/해제
    const toggleSymptom = (symptom) => {
        setSelectedSymptoms(prev => {
            if (prev.includes(symptom)) {
                return prev.filter(s => s !== symptom);
            } else {
                return [...prev, symptom];
            }
        });
    };

    // 필터 초기화
    const clearFilters = () => {
        setSelectedSymptoms([]);
    };

    // 필터링된 이미지
    const filteredImages = selectedSymptoms.length === 0
        ? galleryImages
        : galleryImages.filter(img =>
            selectedSymptoms.some(symptom => img.tags.includes(symptom))
        );

    // 이미지 경로 생성
    const getImagePath = (image) => {
        return image.path
            ? `/images/gallery/${image.path}/${image.filename}`
            : `/images/gallery/${image.filename}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* 상단 헤더 */}
            <header className="bg-white border-b sticky top-0 z-30 px-4 py-4 sm:px-8 shadow-sm">
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
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                            <ImageIcon className="w-5 h-5 text-emerald-600" />
                            <span className="font-semibold text-emerald-700">{filteredImages.length}</span>
                            <span className="text-emerald-600 text-sm hidden sm:inline">Cases</span>
                        </div>
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-extrabold transition-all"
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:inline">로그아웃</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* 필터 컨트롤 바 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* 필터 헤더 (커튼 토글) */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-[#2E7D32]" />
                            <span className="font-semibold text-slate-800">증상별 필터</span>
                            {selectedSymptoms.length > 0 && (
                                <span className="bg-[#2E7D32] text-white text-xs px-2.5 py-1 rounded-full font-bold">
                                    {selectedSymptoms.length}개 선택
                                </span>
                            )}
                        </div>
                        {isFilterOpen ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {/* 필터 내용 (아코디언) */}
                    {isFilterOpen && (
                        <div className="border-t border-slate-200 bg-slate-50">
                            <div className="px-6 py-5 space-y-4">
                                {Object.entries(symptomCategories).map(([category, symptoms]) => (
                                    <div key={category} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                        {/* 카테고리 헤더 */}
                                        <button
                                            onClick={() => toggleCategory(category)}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="font-semibold text-slate-700 text-sm">{category}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">
                                                    {symptoms.filter(s => selectedSymptoms.includes(s)).length}/{symptoms.length}
                                                </span>
                                                {expandedCategories[category] ? (
                                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                        </button>

                                        {/* 증상 목록 */}
                                        {expandedCategories[category] && (
                                            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                                                <div className="flex flex-wrap gap-2">
                                                    {symptoms.map(symptom => {
                                                        const count = galleryImages.filter(img => img.tags.includes(symptom)).length;
                                                        const isSelected = selectedSymptoms.includes(symptom);

                                                        return (
                                                            <button
                                                                key={symptom}
                                                                onClick={() => toggleSymptom(symptom)}
                                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                                    isSelected
                                                                        ? 'bg-[#2E7D32] text-white shadow-md'
                                                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-[#2E7D32] hover:text-[#2E7D32]'
                                                                }`}
                                                            >
                                                                {symptom} ({count})
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* 필터 액션 */}
                            {selectedSymptoms.length > 0 && (
                                <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSymptoms.map(symptom => (
                                            <span
                                                key={symptom}
                                                className="inline-flex items-center gap-1.5 bg-[#2E7D32] text-white px-3 py-1 rounded-full text-sm"
                                            >
                                                {symptom}
                                                <button
                                                    onClick={() => toggleSymptom(symptom)}
                                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                >
                                                    <XIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
                                    >
                                        전체 초기화
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 그리드 컨텐츠 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
                {/* 결과 요약 */}
                {selectedSymptoms.length > 0 && (
                    <div className="mb-6 text-center">
                        <p className="text-slate-600">
                            <span className="font-bold text-[#2E7D32]">{filteredImages.length}개</span>의 사례가 검색되었습니다
                        </p>
                    </div>
                )}

                {filteredImages.length === 0 ? (
                    <div className="text-center py-20">
                        <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">선택한 증상에 해당하는 사례가 없습니다</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-6 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors"
                        >
                            필터 초기화
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredImages.map((image, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-slate-100"
                                onClick={() => setSelectedImage(image)}
                            >
                                {/* 이미지 컨테이너 */}
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img
                                        src={getImagePath(image)}
                                        alt={image.filename}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>

                                {/* 호버 오버레이 (파일명 표시) */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                                    <span className="text-white font-medium text-base leading-snug transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        {image.filename.replace(/\.(png|jpg|jpeg)$/i, '')}
                                    </span>
                                    <div className="mt-4 p-2 bg-white/20 rounded-full backdrop-blur-sm transform scale-50 opacity-0 group-hover:scale-100 group-group-hover:opacity-100 transition-all duration-500 delay-100">
                                        <ZoomIn className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                {/* 하단 캡션 (모바일 대응) */}
                                <div className="p-3 bg-white border-t border-slate-50 sm:hidden">
                                    <p className="text-xs font-medium text-slate-800 truncate">
                                        {image.filename.replace(/\.(png|jpg|jpeg)$/i, '')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* 이미지 라이트박스 모달 (간이형) */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <div className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
                        <img
                            src={getImagePath(selectedImage)}
                            alt={selectedImage.filename}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 max-w-full">
                            <p className="text-white font-medium text-base sm:text-lg text-center break-words">
                                {selectedImage.filename.replace(/\.(png|jpg|jpeg)$/i, '')}
                            </p>
                            {selectedImage.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                                    {selectedImage.tags.slice(0, 5).map(tag => (
                                        <span
                                            key={tag}
                                            className="text-xs bg-white/20 text-white px-2 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// X 아이콘 컴포넌트
function X({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}
