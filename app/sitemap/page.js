'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    Home, 
    ArrowLeft, 
    Compass, 
    Activity, 
    GraduationCap, 
    Image as ImageIcon, 
    MessageSquare, 
    FileText, 
    Sparkles, 
    CheckCircle2, 
    ExternalLink, 
    Copy, 
    Check, 
    MapPin, 
    Phone, 
    BookOpen,
    Share2,
    Calendar
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function SitemapPage() {
    const [copiedTag, setCopiedTag] = useState(false);

    const copyTags = () => {
        const tags = "#이어봄 #이혈요법 #귀건강 #이침 #웰니스 #불면증개선 #만성피로 #통증관리 #원데이클래스 #힐링라이프";
        navigator.clipboard.writeText(tags);
        setCopiedTag(true);
        setTimeout(() => setCopiedTag(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E50] font-sans selection:bg-[#2E7D32]/20">
            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                    <Link 
                        href="/" 
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-[#2E7D32] transition-colors p-1.5 rounded-lg hover:bg-stone-100"
                    >
                        <ArrowLeft size={16} />
                        <span>홈으로</span>
                    </Link>
                    <div className="h-4 w-[1px] bg-stone-200" />
                    <span className="text-xs sm:text-sm font-extrabold text-[#2E7D32] flex items-center gap-1.5">
                        <Compass size={16} /> 사이트맵 & 콘텐츠 가이드
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Link 
                        href="/survey" 
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-[#2E7D32] text-white px-3.5 py-1.5 rounded-full hover:bg-[#1B5E20] transition-colors shadow-xs"
                    >
                        <span>무료 진단하기</span>
                    </Link>
                    <Link 
                        href="/appointment" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold border border-[#2E7D32] text-[#2E7D32] px-3.5 py-1.5 rounded-full hover:bg-[#2E7D32]/5 transition-colors"
                    >
                        <span>강좌/상담 신청</span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E8F5E9]/60 via-[#FDFBF7] to-[#FDFBF7]">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#2E7D32]/20 shadow-xs text-xs font-black text-[#2E7D32] uppercase tracking-wider">
                        <Sparkles size={14} /> earbom.com Directory & Content Hub
                    </div>
                    <h1 className="text-2.5xl sm:text-4xl font-extrabold text-[#1B5E20] tracking-tight leading-tight">
                        이어봄 웰니스 사이트맵
                    </h1>
                    <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        나와 가족을 돌보는 자연 치유 귀 건강 솔루션. <br className="hidden sm:inline"/>
                        이어봄의 모든 서비스와 교육 과정, 그리고 <strong>블로그·쇼츠·SNS 콘텐츠 소재</strong>를 한눈에 살펴보세요.
                    </p>
                </div>
            </section>

            {/* Main Content Grid */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12">

                {/* Section 1: Core Services */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b-2 border-[#2E7D32]/20">
                        <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-black text-sm shadow-xs">
                            01
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-[#1B5E20] flex items-center gap-2">
                            <Activity size={20} className="text-[#2E7D32]" />
                            이어봄 케어 서비스 (온·오프라인)
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Service Card 1 */}
                        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md hover:border-[#2E7D32]/40 transition-all flex flex-col justify-between group">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[#2E7D32] font-extrabold text-xs">
                                        비대면 온라인
                                    </span>
                                    <span className="text-xs text-stone-400 font-bold">소요시간 약 3분</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-extrabold text-stone-800 group-hover:text-[#2E7D32] transition-colors">
                                    무료 귀 건강 온라인 진단
                                </h3>
                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    성별·생년월일 및 5대 건강 설문과 양쪽 귀 사진을 등록하시면, 전문가가 직접 반응점을 분석하여 1:1 맞춤 진단 결과를 처방해 드립니다.
                                </p>
                            </div>
                            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-400">경로: /survey</span>
                                <Link 
                                    href="/survey" 
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32] hover:underline"
                                >
                                    진단 시작하기 &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Service Card 2 */}
                        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md hover:border-[#2E7D32]/40 transition-all flex flex-col justify-between group">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-extrabold text-xs">
                                        오프라인 1:1 예약제
                                    </span>
                                    <span className="text-xs text-stone-400 font-bold">광진구 센터 / 출장</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-extrabold text-stone-800 group-hover:text-[#2E7D32] transition-colors">
                                    1:1 맞춤 방문 상담 및 이침 케어
                                </h3>
                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    전문가와 직접 대면하여 신체 밸런스를 측정하고, 불편한 부위(수면, 통증, 소화 등)에 맞춘 정밀 이혈 패치 부착 및 홈케어 가이드를 전수받습니다.
                                </p>
                            </div>
                            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-400">경로: /appointment</span>
                                <Link 
                                    href="/appointment" 
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32] hover:underline"
                                >
                                    상담 예약하기 &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Section 2: Academy Courses */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b-2 border-[#2E7D32]/20">
                        <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-black text-sm shadow-xs">
                            02
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-[#1B5E20] flex items-center gap-2">
                            <GraduationCap size={20} className="text-[#2E7D32]" />
                            이어봄 아카데미 (커리큘럼 안내)
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Course 1 */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-sm hover:border-[#2E7D32]/40 transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-[#1B5E20] font-black text-[11px]">
                                    One-Day Class
                                </span>
                                <h3 className="text-base font-extrabold text-stone-800">
                                    원데이 힐링 클래스
                                </h3>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    단 하루 3시간으로 배우는 귀 건강 기초와 실전 이혈 셀프 케어 실습. (실습재료 일체 제공)
                                </p>
                                <ul className="text-xs text-stone-500 space-y-1 pt-1 font-medium">
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-[#2E7D32]" /> 차기일정: 9/21 (월) 14:00~17:00
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-[#2E7D32]" /> 수강료: 60,000원
                                    </li>
                                </ul>
                            </div>
                            <Link 
                                href="/appointment" 
                                className="mt-5 block text-center py-2 rounded-xl bg-[#E8F5E9] text-[#1B5E20] font-bold text-xs hover:bg-[#2E7D32] hover:text-white transition-colors"
                            >
                                수강 신청하기
                            </Link>
                        </div>

                        {/* Course 2 */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#2E7D32]/30 shadow-sm hover:border-[#2E7D32] transition-all flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-[#2E7D32] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl">
                                추천 인기 강좌
                            </div>
                            <div className="space-y-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-[#1B5E20] font-black text-[11px]">
                                    5-Week Intensive
                                </span>
                                <h3 className="text-base font-extrabold text-stone-800">
                                    5주 입문 과정
                                </h3>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    나와 소중한 가족을 위한 체계적인 이혈요법 원리와 증상별 처방 집중 마스터.
                                </p>
                                <ul className="text-xs text-stone-500 space-y-1 pt-1 font-medium">
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-[#2E7D32]" /> 차기일정: 9/28~10/28 (주1회)
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-[#2E7D32]" /> 수강료: 400,000원
                                    </li>
                                </ul>
                            </div>
                            <Link 
                                href="/appointment" 
                                className="mt-5 block text-center py-2 rounded-xl bg-[#2E7D32] text-white font-bold text-xs hover:bg-[#1B5E20] transition-colors shadow-xs"
                            >
                                수강 신청하기
                            </Link>
                        </div>

                        {/* Course 3 */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-sm hover:border-[#2E7D32]/40 transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-black text-[11px]">
                                    8-Week Professional
                                </span>
                                <h3 className="text-base font-extrabold text-stone-800">
                                    8주 전문가 자격증 과정
                                </h3>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    이혈건강상담사 및 전문 강사 활동을 위한 심층 해부학적 기전과 임상 실전 트레이닝.
                                </p>
                                <ul className="text-xs text-stone-500 space-y-1 pt-1 font-medium">
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-[#2E7D32]" /> 자격증 발급 & 수료증
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-[#2E7D32]" /> 수강료: 800,000원
                                    </li>
                                </ul>
                            </div>
                            <Link 
                                href="/appointment" 
                                className="mt-5 block text-center py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200 transition-colors"
                            >
                                과정 문의 및 신청
                            </Link>
                        </div>
                    </div>
                </section>


                {/* Section 3: SNS Content & Ear Health Topics */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-[#2E7D32]/20">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-black text-sm shadow-xs">
                                03
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-[#1B5E20] flex items-center gap-2">
                                    <BookOpen size={20} className="text-[#2E7D32]" />
                                    귀 건강 정보 & SNS 콘텐츠 기획 가이드
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={copyTags}
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-stone-700 hover:text-[#2E7D32] hover:border-[#2E7D32]/40 transition-all shadow-xs"
                        >
                            {copiedTag ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            <span>{copiedTag ? '해시태그 복사됨!' : 'SNS 해시태그 복사'}</span>
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                                블로그 포스팅, 유튜브 쇼츠, 인스타그램 릴스 및 카드뉴스 제작 시 바로 활용할 수 있는 <strong>5대 핵심 이혈 테마와 반응점 가이드</strong>입니다.
                            </p>
                        </div>

                        {/* 5 Topic Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                                <div className="font-extrabold text-stone-800 text-sm flex items-center gap-1.5">
                                    <span>😴</span> 수면장애 & 불면증 케어
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    <strong>주요 반응점:</strong> 신문혈, 수면점, 심장구역, 뇌간<br/>
                                    <strong>콘텐츠 포인트:</strong> 자기 전 1분 귀 마사지법, 자율신경 안정 루틴
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                                <div className="font-extrabold text-stone-800 text-sm flex items-center gap-1.5">
                                    <span>⚡</span> 만성피로 & 에너지 회복
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    <strong>주요 반응점:</strong> 신장혈, 간구역, 부신점, 내분비<br/>
                                    <strong>콘텐츠 포인트:</strong> 오후 피로를 날리는 귓바퀴 당기기, 면역 활성화
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                                <div className="font-extrabold text-stone-800 text-sm flex items-center gap-1.5">
                                    <span>🧘</span> 스트레스 & 심신 불안 완화
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    <strong>주요 반응점:</strong> 간혈, 교감신경점, 이륜각, 대뇌피질<br/>
                                    <strong>콘텐츠 포인트:</strong> 가슴 답답함 해소, 호흡과 함께하는 귀 이완법
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                                <div className="font-extrabold text-stone-800 text-sm flex items-center gap-1.5">
                                    <span>🦴</span> 어깨·목·허리 근골격계 통증
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    <strong>주요 반응점:</strong> 경추·흉추·요추 구역, 어깨관절점, 좌골신경<br/>
                                    <strong>콘텐츠 포인트:</strong> 거북목·일자목 귀 지압 포인트, 오십견 완화 팁
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                                <div className="font-extrabold text-stone-800 text-sm flex items-center gap-1.5">
                                    <span>🥗</span> 소화불량 & 식욕·체중 관리
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    <strong>주요 반응점:</strong> 위장혈, 비장구역, 기아점(갈증점), 복부<br/>
                                    <strong>콘텐츠 포인트:</strong> 더부룩할 때 누르는 귀 포인트, 야식 충동 다스리기
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-emerald-50/60 border border-[#2E7D32]/30 flex flex-col justify-between space-y-2">
                                <div>
                                    <div className="font-extrabold text-[#1B5E20] text-sm flex items-center gap-1.5">
                                        <ImageIcon size={15} /> 실제 관리 사례 갤러리
                                    </div>
                                    <p className="text-stone-600 leading-relaxed mt-1">
                                        각 증상별 실제 이혈 패치 부착 사례와 귀 형태 분석 사진 모음
                                    </p>
                                </div>
                                <Link 
                                    href="/gallery" 
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32] hover:underline pt-2"
                                >
                                    갤러리 바로가기 &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Hash Tag Button */}
                        <div className="block sm:hidden pt-2">
                            <button
                                onClick={copyTags}
                                className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5"
                            >
                                {copiedTag ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                <span>{copiedTag ? '해시태그가 복사되었습니다!' : 'SNS 대표 해시태그 복사하기'}</span>
                            </button>
                        </div>
                    </div>
                </section>


                {/* Section 4: Channels & Information */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b-2 border-[#2E7D32]/20">
                        <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center font-black text-sm shadow-xs">
                            04
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-[#1B5E20] flex items-center gap-2">
                            <Share2 size={20} className="text-[#2E7D32]" />
                            공식 소셜 채널 & 오시는 길
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                        {/* Channel Card */}
                        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-stone-800 text-base flex items-center gap-2">
                                <MessageSquare size={18} className="text-[#2E7D32]" />
                                공식 온라인 소통 채널
                            </h3>
                            <div className="space-y-2.5 font-medium">
                                <a 
                                    href="https://blog.naver.com/js_ear" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-emerald-50/60 border border-stone-200/70 hover:border-[#2E7D32]/40 transition-all text-stone-700 hover:text-[#2E7D32]"
                                >
                                    <span className="font-bold">네이버 공식 블로그 (칼럼/강좌 공지)</span>
                                    <ExternalLink size={14} className="text-stone-400" />
                                </a>
                                <a 
                                    href="https://open.kakao.com/o/sTJMmaCi" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-200/70 hover:border-amber-400 transition-all text-stone-700 hover:text-amber-800"
                                >
                                    <span className="font-bold">카카오톡 1:1 오픈채팅 문의</span>
                                    <ExternalLink size={14} className="text-stone-400" />
                                </a>
                                <a 
                                    href="sms:01052660150?body=안녕하세요,%20이어봄%20문의드립니다." 
                                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-rose-50/60 border border-stone-200/70 hover:border-rose-400 transition-all text-stone-700 hover:text-rose-700"
                                >
                                    <span className="font-bold">SMS 문자 상담 (010-5266-0150)</span>
                                    <Phone size={14} className="text-stone-400" />
                                </a>
                            </div>
                        </div>

                        {/* Location & Policies */}
                        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                                <h3 className="font-extrabold text-stone-800 text-base flex items-center gap-2">
                                    <MapPin size={18} className="text-[#2E7D32]" />
                                    오시는 길 & 약관 안내
                                </h3>
                                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                                    <strong>광진구 교육/상담 센터:</strong><br/>
                                    서울특별시 광진구 능동로 59길 27, 1층 (예약제 운영)
                                </p>
                                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                                    <strong>사업자 등록 정보:</strong><br/>
                                    이어봄 웰니스 | 대표: 백정숙 | 사업자등록번호: 821-31-01754
                                </p>
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs font-bold text-stone-500">
                                <Link href="/terms" className="hover:text-[#2E7D32] underline">이용약관</Link>
                                <Link href="/privacy" className="hover:text-[#2E7D32] underline">개인정보처리방침</Link>
                                <Link href="/terms#refund" className="hover:text-[#2E7D32] underline">취소 및 환불규정</Link>
                                <Link href="/" className="hover:text-[#2E7D32] ml-auto">홈으로 이동 &rarr;</Link>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Global Footer */}
            <Footer />
        </div>
    );
}
