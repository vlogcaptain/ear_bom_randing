'use client';

import { useState, useEffect } from 'react';
import { Microscope, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import HistoryModal from '@/components/HistoryModal';
import ResearchModal from '@/components/ResearchModal';
import InstallGuideModal from '@/components/InstallGuideModal';
import Footer from '@/components/Footer';

const reviewsData = [
  {
    id: 1,
    name: "김OO 님",
    content: "수업 내용은 알차고 다양한 신체 관련 건강 지식도 배울 수 있어서 좋았습니다. 동영상 강의와 귀 모형을 통한 침점 교육도 도움이 많이 된 것 같습니다. 실습 시간이 부족한 것 같은 느낌이 유일한 단점인 것 같네요. 선생님도 전문적이고 친절하시고 재미있게 수업해 주셔서 즐거운 수업이 될 수 있었습니다. 감사합니다.",
    images: ["/images/reviews/review_1.jpg"]
  },
  {
    id: 2,
    name: "김OO 님",
    content: "새로운 세계를 알게 되어 감사하고, 가족과 주변인에게 아주 작은 나눔을 하게 되어 또한 감사합니다. 더 깊고 넓은 배움이 이어지길 바라며 선생님께 감사 인사드립니다.",
    images: ["/images/reviews/review_2.jpg"]
  },
  {
    id: 3,
    name: "방OO 님",
    content: "백정숙 선생님과 좋은 인연을 이어가게 되어 감사합니다. 건강해지고 싶어 수강하게 되었는데, 제 귀 모습을 보며.. 작은 변화가 보이고, 통증이 사라짐을 느끼며... 신기하고 호기심이 생깁니다. 부족함이 많아 선생님 지도하에 열심히 배워보겠습니다.",
    images: ["/images/reviews/review_3.jpg"]
  },
  {
    id: 4,
    name: "김OO 님",
    content: "우연히 이침 강좌를 수강하게 되어 3개월 동안 배웠지만 아직 실력은 미숙합니다. 그래도 나름 열심히 공부하여 주위 지인들에게 소개도 하며 부족한 실력으로 이침도 놓아주면 아주 좋아했습니다. 잘 가르쳐 주셔서 감사드립니다.!",
    images: ["/images/reviews/review_4.jpg"]
  },
  {
    id: 5,
    name: "혜OO 님",
    content: "정숙 선생님 :) 이번학기 수업도 선생님의 열정으로 정말 재밌게 들었어요. 이혈테라피라는 생소하기만 했던 공부를 이제는 저의 일상이 되어 다른 사람과 저의 건강을 돌볼 수 있게 되어 감사합니다. 늘 앞으로도 오래오래 인연을 이어가 늘 저의 나침반이 되어주시면 좋겠어요. ♡ 선생님의 미모와 열정이 제게는 늘 동기부여가 됩니다. 앞으로도 잘 부탁드려요.",
    images: ["/images/reviews/review_5.jpg"]
  },
  {
    id: 6,
    name: "강OO 님",
    content: "처음 교육을 접했을 때 반신반의했습니다. 과연 나에게 도움이 될까 하는 의문 때문이었습니다. 하지만 새로운 변화를 기대하는 마음으로 한 걸음 내딛게 되었습니다. 특히 기억에 남는 것은 작은 습관의 변화였습니다. 잘은 못하지만 1주일에 한 번씩 실습한다는 마음으로 꾸준히 연습을 했습니다. 손가락이 아파 구부릴 수가 없었는데 꾸준히 이침을 한 결과 손가락도 구부러지는 '기적!!'이 있었습니다.\n\n교육을 통해 얻은 가장 큰 수확은 자신감이었습니다. 적극적으로 무엇이든 할 수 있는 삶을 바라보게 되었고, 제 자신을 성장시키는 소중한 기회였습니다. 배운 것을 모두 실천할 수는 없지만 욕심을 내고 앞으로도 더욱 배워야 할 것 같습니다. 기회가 된다면 주위 사람들에게 이침의 장점을 많이 알리고, 이를 살려 건강을 챙길 수 있었으면 좋겠습니다.",
    images: ["/images/reviews/review_6.jpg"]
  },
  {
    id: 7,
    name: "혜OO 님",
    content: "12주가 금방 갔습니다. 아프고 나서 내 몸이 주는 신호를 잘 캐치해야지라는 생각만 있었는데, 귀를 통해 그 문이 열린 것 같아서 개인적으로 너무 기쁘고 감사합니다. 이제 시작이지만 시작이 반이니 앞으로도 이침하면서 건강을 잘 챙기도록 하겠습니다. 선생님도 건강하셔서 계속 멋진 강의 해주세요.",
    images: ["/images/reviews/review_7.jpg"]
  }
];

export default function Home() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
    const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [selectedReviewImages, setSelectedReviewImages] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleStartClick = () => {
        if (!loading && user) {
            router.push('/dashboard');
        } else {
            setIsLoginModalOpen(true);
        }
    };

    const handleInstallClick = (e) => {
        // Simple mobile detection
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (!isMobile) {
            e.preventDefault();
            setIsInstallModalOpen(true);
        }
    };

    // Body scroll lock when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    return (
        <div className="flex flex-col min-h-screen">
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
            <HistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
            />
            <ResearchModal
                isOpen={isResearchModalOpen}
                onClose={() => setIsResearchModalOpen(false)}
            />
            <InstallGuideModal
                isOpen={isInstallModalOpen}
                onClose={() => setIsInstallModalOpen(false)}
            />
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-green-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center relative shadow-sm">
                            <Image
                                src="/logo.png"
                                alt="ear bom healthy logo"
                                width={52}
                                height={52}
                                className="object-contain invert brightness-0"
                            />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-[#1B5E20]">ear bom healthy</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 font-medium text-gray-500">
                        <Link className="hover:text-primary transition-colors" href="#concept">이침 원리</Link>
                        <Link className="hover:text-primary transition-colors" href="#how-it-works">사용방법</Link>
                        <Link className="hover:text-primary transition-colors" href="#features">주요기능</Link>
                        <Link className="hover:text-primary transition-colors" href="/gallery">갤러리</Link>
                        <Link className="hover:text-primary transition-colors" href="/dashboard" target="_blank" rel="noopener noreferrer">대시보드</Link>
                        <Link className="hover:text-primary transition-colors" href="/appointment" target="_blank" rel="noopener noreferrer">상담예약</Link>
                        <Link className="hover:text-primary transition-colors" href="/chat" target="_blank" rel="noopener noreferrer">실시간 상담</Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={28} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay - Moved outside header for better layering */}
            {mounted && (
                <div 
                    className={`fixed inset-0 z-[999] bg-white transition-all duration-300 ease-in-out md:hidden ${
                        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
                >
                    <div className="flex flex-col h-full bg-white">
                        <div className="flex items-center justify-between p-6 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#2E7D32] rounded-lg flex items-center justify-center relative shadow-sm">
                                    <Image
                                        src="/logo.png"
                                        alt="ear bom healthy logo"
                                        width={42}
                                        height={42}
                                        className="invert brightness-0"
                                    />
                                </div>
                                <span className="text-xl font-black text-[#1B5E20]">ear bom healthy</span>
                            </div>
                            <button 
                                className="p-2 text-gray-800"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X size={32} />
                            </button>
                        </div>
                        <nav className="flex flex-col p-8 gap-10 text-2xl font-black text-gray-900 overflow-y-auto">
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="#concept">이침 원리</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="#how-it-works">사용방법</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="#features">주요기능</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/gallery">갤러리</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard" target="_blank" rel="noopener noreferrer">대시보드</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/appointment" target="_blank" rel="noopener noreferrer">상담예약</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} href="/chat" target="_blank" rel="noopener noreferrer">실시간 상담</Link>
                        </nav>
                        <div className="mt-auto p-8 border-t border-gray-50">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleStartClick();
                                }}
                                className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl text-xl font-bold shadow-xl"
                            >
                                무료 진단 시작하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-pale">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div className="z-10">
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-primary text-sm font-semibold mb-6 shadow-sm">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                Ear smart 건강 진단 서비스
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-primary-dark mb-6">
                                당신의 귀로<br />건강을 읽다
                            </h1>
                            <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
                                이침(耳鍼) 요법의 지혜와 Smart한 기술의 만남.<br />
                                복잡한 검사 없이 귀 사진 한 장으로 당신의 오늘을 진단합니다.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start max-w-4xl">
                                <button
                                    onClick={handleStartClick}
                                    className="bg-[#2E7D32] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-[#1B5E20] transition-all shadow-lg shadow-green-900/10 min-w-[200px]"
                                >
                                    무료로 시작하기
                                </button>
                                <div className="flex flex-col gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => setIsHistoryModalOpen(true)}
                                        className="bg-white text-[#2E7D32] border-2 border-[#2E7D32] px-6 py-4 rounded-2xl text-lg font-bold hover:bg-green-50 transition-all text-center whitespace-nowrap"
                                    >
                                        자세히 알아보기
                                    </button>
                                    <button
                                        onClick={() => setIsResearchModalOpen(true)}
                                        className="bg-indigo-50 text-indigo-700 border-2 border-indigo-200 px-6 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-100 transition-all text-center flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        <Microscope size={20} className="text-indigo-600" />
                                        임상 연구 확인
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-[40px] overflow-hidden shadow-2xl rotate-2 aspect-[4/3] relative">
                                <Image
                                    src="/ear_acupoint.png"
                                    alt="Ear Acupoint Wellness"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 md:p-8 rounded-[32px] shadow-xl flex items-center gap-5">
                                <div className="w-14 h-14 bg-[#FFB74D] rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-3xl">bolt</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">전문가 분석 완료까지</p>
                                    <p className="font-bold text-xl md:text-2xl text-gray-900 border-none">평균 1일</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Section */}
                <section className="py-24 bg-white" id="problem">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <span className="text-accent-deep font-bold text-lg mb-4 block">MODERN HEALTH FATIGUE</span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
                            바쁜 일상 속, 당신의 몸이 보내는<br />신호를 놓치고 있진 않나요?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
                            {[
                                { icon: "bedtime", title: "만성 피로", desc: "충분히 자도 풀리지 않는 몸의 무거움" },
                                { icon: "psychology", title: "스트레스", desc: "원인을 알 수 없는 예민함과 답답함" },
                                { icon: "restaurant", title: "소화 불량", desc: "불규칙한 식사로 인한 상습적 더부룩함" },
                            ].map((item, idx) => (
                                <div key={idx} className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
                                    <span className="material-symbols-outlined !text-6xl text-primary-light mb-4">{item.icon}</span>
                                    <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Concept Section */}
                <section className="py-24 bg-pale overflow-hidden" id="concept">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="relative order-2 md:order-1">
                                <div className="absolute -z-10 w-[140%] h-[140%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[40px] border-white/50 rounded-full"></div>
                                <div className="rounded-[40px] overflow-hidden shadow-2xl relative aspect-square md:aspect-[4/5]">
                                    <Image
                                        src="/ear_acupoint.png"
                                        alt="Ear Acupoint Concept"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            <div className="order-1 md:order-2">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-dark">귀는 우리 몸의 작은 지도입니다</h2>
                                <p className="text-lg text-gray-800 mb-8 leading-relaxed">
                                    이침(耳鍼) 요법은 귀를 인체의 축소판으로 봅니다. 신체 각 부위와 연결된 반응점을 분석하면 현재 당신의 오장육부 상태를 정밀하게 파악할 수 있습니다.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        { title: "2,000년의 지혜", desc: "오랜 세월 검증된 동양의학적 이침 원리" },
                                        { title: "비침습적 진단", desc: "바늘 없이 사진 촬영만으로 안전한 분석" },
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                                            <div>
                                                <h4 className="font-bold">{item.title}</h4>
                                                <p className="text-gray-500">{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works Section */}
                <section className="py-24 bg-white" id="how-it-works">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">단 3단계로 끝나는 정밀 진단</h2>
                            <p className="text-gray-500">전문적인 진단을 이제 일상에서 경험하세요</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: "01", icon: "person_edit", title: "정보 입력", desc: "정확한 분석을 위해 성별과 나이대를 선택해주세요." },
                                { step: "02", icon: "add_a_photo", title: "귀 사진 촬영", desc: <>밝은 곳에서 <span className="font-bold text-gray-900 text-lg">양쪽</span> 귀의 선명한 사진을 찍어주세요.</> },
                                { step: "03", icon: "analytics", title: "이침 전문가 정밀 분석", desc: "이침 전문가의 혈자리 분석을 바탕으로 맞춤형 결과 리포트를 제공합니다." },
                            ].map((item, idx) => (
                                <div key={idx} className="text-center group">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined !text-7xl text-primary">{item.icon}</span>
                                    </div>
                                    <div className="text-orange-600 font-bold mb-2">STEP {item.step}</div>
                                    <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                    <p className="text-gray-500 whitespace-pre-line">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-green-50/50" id="features">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">귀로 시작하는<br />스마트 웰니스 케어</h2>
                                <p className="text-gray-500">단순 분석을 넘어 실질적인 솔루션을 제안합니다.</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: "psychology_alt", title: "이침 전문가 정밀 분석", desc: "수만 장의 이침 데이터를 보유한 이침 전문가가 귀의 미세한 변화를 감지합니다." },
                                { icon: "description", title: "개인 맞춤 건강 리포트", desc: "신체 장기별 활성도와 현재 컨디션을 누구나 이해하기 쉬운 리포트로 제공합니다." },
                                { icon: "spa", title: "데일리 웰니스 가이드", desc: "나에게 꼭 필요한 이침 자극법과 생활 습관 가이드로 일상의 건강을 챙깁니다." },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-10 rounded-[32px] shadow-sm hover:shadow-xl transition-shadow border border-green-100">
                                    <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-primary !text-5xl">{item.icon}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Expert Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-dark">ear bom healthy와 함께하는 전문가</h2>
                            <p className="text-gray-500">풍부한 경험을 바탕으로 한 신뢰할 수 있는 데이터로 검수합니다</p>
                        </div>
                        <div className="bg-white rounded-[40px] shadow-custom border border-green-50 overflow-hidden">
                            <div className="grid md:grid-cols-2">
                                <div className="h-full min-h-[500px] relative">
                                    <Image
                                        src="/expert_baek.png"
                                        alt="백정숙 수석지도사"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-8 md:p-16 flex flex-col justify-center">
                                    <span className="text-primary font-bold mb-4 block text-lg">ear bom healthy 대표 전문가</span>
                                    <h3 className="text-4xl font-extrabold mb-4 text-gray-800">백정숙 수석지도사</h3>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {["#통증관리", "#스트레스케어", "#이침전문가"].map((tag, idx) => (
                                            <span key={idx} className="text-primary text-sm font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-100">{tag}</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-500 text-lg leading-relaxed mb-10">
                                        "수천 년간 이어져 온 전통 이침 요법의 지혜를 현대적인 AI 기술과 결합하여, 누구나 자신의 건강 상태를 쉽고 정확하게 파악할 수 있는 시대를 열고자 합니다. 데이터에 근거한 정밀한 분석과 따뜻한 인술의 조화를 통해 현대인들의 무너진 건강 밸런스를 되찾아 드리는 것이 저의 철학입니다."
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-lg text-primary-dark border-b border-green-100 pb-2 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">work</span>
                                                경력
                                            </h4>
                                            <ul className="space-y-2">
                                                {[
                                                    "(現) 국제이침협회 수석지도사",
                                                    "(現) 서울시립대학교 평생교육원 강사",
                                                    "(現) 국립금오공과대학교 평생교육원 강사",
                                                    "(現) 서울 성동문화재단 강사",
                                                    "(前) 서울 광진문화원 강사",
                                                ].map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                                        <span className="text-primary mt-1">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-bold text-lg text-primary-dark border-b border-green-100 pb-2 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">verified</span>
                                                자격
                                            </h4>
                                            <ul className="space-y-2">
                                                {[
                                                    "국제이침협회 귀상담사 수석지도사",
                                                    "국제이침협회 귀상담사 지도사",
                                                    "국제이침협회 귀상담사 1급",
                                                    "사회복지사 2급",
                                                    "치매예방활동가",
                                                ].map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                                                        <span className="text-primary mt-1">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="md:col-span-2 space-y-4">
                                            <h4 className="font-bold text-lg text-primary-dark border-b border-green-100 pb-2 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">school</span>
                                                출강이력
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                                {[
                                                    "국제이침협회 서울교육장 취미반",
                                                    "국제이침협회 서울교육장 자격증반",
                                                    "서울시립대학교 평생교육원",
                                                    "서울 성동문화재단 건강강좌",
                                                    "서울 광진문화원 생활문화강좌",
                                                    "MG새마을금고 문화대학 건강특강",
                                                    "NH농협 여성대학 건강특강",
                                                    "서울 성동근로자복지센터 건강특강 외 다수",
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <span className="text-primary">•</span>
                                                        <span>{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Course Information Section */}
                <section className="py-24 bg-pale" id="course">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="bg-white rounded-[40px] shadow-xl border border-green-100 p-8 md:p-16">
                            <div className="flex flex-col lg:flex-row gap-12">
                                <div className="lg:w-1/2">
                                    <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full text-primary text-sm font-semibold mb-6">
                                        <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                        민간자격등록번호: 2023-000664 (문체부 주무)
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary-dark mb-8 leading-tight">
                                        국제이침협회 <br className="hidden md:block" />
                                        <span className="text-[#2E7D32]">귀 상담사 1급</span> 자격증반
                                    </h2>
                                    
                                    <div className="space-y-8">
                                        {[
                                            {
                                                icon: "target",
                                                title: "목표",
                                                content: "건강의 근본적인 문제 해결을 위한 이혈이침요법과 실전 기술 학습"
                                            },
                                            {
                                                icon: "calendar_today",
                                                title: "일정",
                                                content: "오프라인 강의(8주 과정)"
                                            },
                                            {
                                                icon: "groups",
                                                title: "대상",
                                                content: (
                                                    <ul className="space-y-2">
                                                        <li className="flex gap-2">
                                                            <span className="text-primary">•</span>
                                                            <span>건강 관리 및 상담에 관심 있는 일반인 및 초보자</span>
                                                        </li>
                                                        <li className="flex gap-2">
                                                            <span className="text-primary">•</span>
                                                            <span>건강지도강사를 통한 제 2의 직업, 상담을 통한 수익연계를 위한 건강 매니저로 성장하고자 하는 분</span>
                                                        </li>
                                                    </ul>
                                                )
                                            }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                                                    <div className="text-gray-600 leading-relaxed">{item.content}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-12">
                                        <Link 
                                            href="/appointment"
                                            className="inline-flex items-center gap-2 bg-[#2E7D32] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-[#1B5E20] transition-all shadow-lg"
                                        >
                                            강좌 수강 문의하기
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                                
                                <div className="lg:w-1/2">
                                    <div className="bg-green-50/50 rounded-3xl p-8 md:p-10 border border-green-100 flex flex-col h-full gap-6">
                                        <h3 className="text-2xl font-bold text-center text-gray-800 shrink-0">
                                            국제이현협회의 <span className="text-primary">귀상담사 교육</span>은?
                                        </h3>
                                        <div className="flex flex-col gap-6 flex-1">
                                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-50 flex-1 flex items-center">
                                                <p className="text-lg leading-relaxed text-gray-700 w-full">
                                                    <u>스트레스 완화, 통증 관리 등</u>, 귀의 120개 이상의 혈자리 활용하여 <strong className="text-gray-900">효과적인 건강 진단 및 관리 가능</strong>
                                                </p>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-50 flex-1 flex items-center">
                                                <p className="text-lg leading-relaxed text-gray-700 w-full">
                                                    비침습적 방법으로 <strong className="text-gray-900">누구나 실습 가능하며(접근성)</strong>, <u>약물 사용 없이</u> 자연 치유와 건강 증진할 수 있는 <strong className="text-gray-900">안정성</strong>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 shrink-0">
                                            <div className="text-center text-sm text-gray-400">
                                                * 본 교육은 국제이침협회의 정식 커리큘럼을 따릅니다.
                                            </div>
                                            <div className="text-center border-t border-green-100 pt-4">
                                                <Link href="/terms" className="text-xs text-gray-400 hover:text-primary transition-all underline">
                                                    강좌 취소 및 환불 규정 안내
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reviews Section */}
                <section className="py-24 bg-[#F9FBF9]" id="reviews">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="text-[#2E7D32] font-bold text-lg mb-4 block">STUDENT REVIEWS</span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1B5E20]">수강생들이 증명하는 생생한 변화</h2>
                            <p className="text-gray-500 mt-4">정성껏 써주신 자필 강의 참여 후기입니다.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reviewsData.map((review) => (
                                <div key={review.id} className="bg-white p-8 rounded-3xl border border-green-50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-bold text-lg text-gray-800">{review.name}</span>
                                            <span className="text-xs bg-green-50 text-[#2E7D32] px-3 py-1 rounded-full font-medium">수강생 후기</span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{review.content}</p>
                                    </div>
                                    {review.images && review.images.length > 0 && (
                                        <button
                                            onClick={() => setSelectedReviewImages(review.images)}
                                            className="mt-6 flex items-center gap-2 text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors self-end"
                                        >
                                            <span className="material-symbols-outlined text-sm">image</span>
                                            원본 손글씨 보기
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats & Testimonial Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-16">신뢰할 수 있는 기술력</h2>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="flex flex-col items-center">
                                <div className="text-5xl font-extrabold text-green-700 mb-4">98%</div>
                                <p className="font-bold text-xl mb-2">분석 정확도</p>
                                <p className="text-gray-500">풍부한 경험으로 도출된 알고리즘을 통한<br />정밀한 이미지 판독력</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-5xl font-extrabold text-green-700 mb-4">150+</div>
                                <p className="font-bold text-xl mb-2">학습 데이터 기반</p>
                                <p className="text-gray-500">다양한 임상 사례와 동양의학<br />데이터베이스를 바탕으로 구축</p>
                            </div>
                        </div>
                        <div className="mt-20 p-12 rounded-[32px] bg-green-50/50 border border-green-100 italic text-green-800">
                            "단순히 증상을 알려주는 것을 넘어, 내 몸의 소리에 귀 기울일 수 있는 좋은 습관이 되었습니다."<br />
                            <span className="font-bold mt-4 block not-italic">— 실제 사용자 김OO 님</span>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="bg-[#1B5E20] rounded-[48px] p-12 md:p-20 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2E7D32] rounded-full -mr-32 -mt-32 opacity-20"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F9A825] rounded-full -ml-24 -mb-24 opacity-20"></div>
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 relative z-10">
                                지금 바로 당신의<br />건강 상태를 체크해보세요
                            </h2>
                            <p className="text-lg md:text-xl mb-12 opacity-90 relative z-10">
                                귀 사진 한 장이면 충분합니다. 10초 만에 만나는 건강 보고서.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                                <button
                                    onClick={handleStartClick}
                                    className="bg-white text-green-900 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                                >
                                    무료 진단 시작하기
                                </button>
                                <a 
                                    href="https://earbom.app" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={handleInstallClick}
                                    className="bg-transparent border-2 border-white/50 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined">install_mobile</span>
                                    앱 설치하고 시작하기
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Medical Disclaimer */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-orange-500 fill-1">warning</span>
                                <h3 className="font-bold text-lg text-gray-800">의료 면책 조항</h3>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-4xl mx-auto">
                                본 서비스에서 제공하는 정보는 사용자의 건강 상태 이해를 돕기 위한 참고용이며, 전문 의료인의 진단, 치료, 조언을 대체할 수 없습니다. 의학적 소견이 필요한 경우 반드시 전문의와 상담하십시오.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {selectedReviewImages && (
                <div 
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setSelectedReviewImages(null)}
                >
                    <div className="relative max-w-4xl w-full bg-white rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button 
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 transition-colors"
                            onClick={() => setSelectedReviewImages(null)}
                        >
                            <X size={28} />
                        </button>
                        <h4 className="text-lg font-bold text-gray-900 mb-6">자필 후기 원본 보기</h4>
                        
                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-h-[70vh] overflow-y-auto">
                            {selectedReviewImages.map((imgSrc, idx) => (
                                <div key={idx} className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-50">
                                    <Image
                                        src={imgSrc}
                                        alt={`자필 후기 원본 ${idx + 1}`}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
