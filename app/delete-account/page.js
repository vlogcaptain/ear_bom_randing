'use client';

import React from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Trash2, 
    Smartphone, 
    Mail, 
    ShieldAlert, 
    CheckCircle2, 
    Clock, 
    AlertCircle 
} from 'lucide-react';
import Footer from '@/components/Footer';

// ==========================================
// 설정값 / 상수 분리 (문의 이메일 및 서비스 정보)
// ==========================================
const CONFIG = {
    appName: "earbom wellness (이어봄 웰니스)",
    companyName: "이어봄 웰니스",
    supportEmail: "vlogcaptain@gmail.com", // 문의 및 삭제 요청 이메일
    responseTime: "영업일 기준 7일 이내",
    lastUpdated: "2026년 11월 23일",
    appPlatforms: "Android (Google Play) / iOS (App Store)"
};

export default function DeleteAccountPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E50] font-sans selection:bg-[#2E7D32]/20">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
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
                        <Trash2 size={16} /> 계정 및 데이터 삭제 안내
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-stone-500">
                    <Link 
                        href="/privacy" 
                        className="hover:text-[#2E7D32] transition-colors"
                    >
                        개인정보처리방침
                    </Link>
                    <Link 
                        href="/terms" 
                        className="hover:text-[#2E7D32] transition-colors"
                    >
                        이용약관
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                
                {/* Header Title Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
                    <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider inline-block">
                        ACCOUNT DELETION & DATA RETENTION
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                        {CONFIG.appName} 계정 및 데이터 삭제 안내
                    </h1>
                    <p className="text-sm text-stone-600 leading-relaxed font-medium">
                        이어봄 웰니스는 사용자의 개인정보 자기결정권을 존중하며, 구글 플레이(Google Play) 및 애플(Apple)의 개발자 계정 삭제 정책을 준수합니다. 본 페이지에서는 앱 내에서 로그인 계정 및 기기 내 데이터를 삭제(탈퇴)하는 방법과, 서버에 저장된 프로필·건강 설문·귀 사진 등 관련 데이터의 삭제를 이메일로 요청하는 절차를 안내합니다.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2 text-xs text-stone-400 font-bold border-t border-stone-100">
                        <span>대상 앱: {CONFIG.appName} ({CONFIG.appPlatforms})</span>
                        <span>최종 개정일: {CONFIG.lastUpdated}</span>
                    </div>
                </div>

                {/* Method 1: In-App Deletion */}
                <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center font-black">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-black text-[#2E7D32] uppercase tracking-wider">방법 1 (앱 내 탈퇴)</span>
                            <h2 className="text-lg sm:text-xl font-bold text-stone-900">앱 내에서 직접 계정 탈퇴</h2>
                        </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                        앱이 기기에 설치되어 있고 로그인이 가능한 경우, 앱 내에서 몇 번의 터치로 로그인 계정과 기기 내 저장 데이터를 삭제(회원 탈퇴)할 수 있습니다.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <span className="text-xs font-black text-[#2E7D32]">STEP 01</span>
                            <div className="font-bold text-sm text-stone-800">앱 실행 및 로그인</div>
                            <p className="text-xs text-stone-500 leading-relaxed">스마트폰에서 earbom wellness 앱을 실행합니다.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <span className="text-xs font-black text-[#2E7D32]">STEP 02</span>
                            <div className="font-bold text-sm text-stone-800">[마이] 탭 이동</div>
                            <p className="text-xs text-stone-500 leading-relaxed">하단 네비게이션 바 우측의 [마이] 메뉴를 선택합니다.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <span className="text-xs font-black text-[#2E7D32]">STEP 03</span>
                            <div className="font-bold text-sm text-stone-800">[회원 탈퇴] 선택</div>
                            <p className="text-xs text-stone-500 leading-relaxed">화면 하단 [로그아웃] 버튼 아래의 [회원 탈퇴 (계정 삭제)]를 클릭합니다.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <span className="text-xs font-black text-[#2E7D32]">STEP 04</span>
                            <div className="font-bold text-sm text-stone-800">탈퇴 확인 및 완료</div>
                            <p className="text-xs text-stone-500 leading-relaxed">확인 팝업에서 [확인]을 누르면 로그인 계정과 기기 내 저장 데이터가 즉시 삭제됩니다.</p>
                        </div>
                    </div>
                </section>

                {/* Method 2: Web / Email Request */}
                <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                            <Mail size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-black text-amber-600 uppercase tracking-wider">방법 2 (이메일 요청)</span>
                            <h2 className="text-lg sm:text-xl font-bold text-stone-900">서버 데이터 완전 삭제 요청 (이메일 접수)</h2>
                        </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                        서버에 저장된 프로필, 건강 설문 응답, 귀 사진 원본, 상담 예약 기록 등의 완전 삭제를 원하시거나, 앱을 이미 삭제하여 앱 내 탈퇴가 불가능하신 경우 고객지원 이메일로 요청해 주시면 영업일 기준 7일 이내에 안전하게 삭제 처리해 드립니다.
                    </p>

                    <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60 space-y-3">
                        <div className="font-bold text-sm text-stone-800 flex items-center gap-2">
                            <Mail size={16} className="text-amber-600" />
                            접수 이메일: 
                            <a 
                                href={`mailto:${CONFIG.supportEmail}?subject=[earbom wellness] 계정 및 데이터 삭제 요청`}
                                className="text-[#2E7D32] hover:underline font-extrabold"
                            >
                                {CONFIG.supportEmail}
                            </a>
                        </div>
                        <div className="text-xs text-stone-600 space-y-1.5 pl-6">
                            <p><strong>• 메일 제목:</strong> [earbom wellness] 계정 및 데이터 삭제 요청</p>
                            <p><strong>• 필수 기재 사항:</strong> 가입 시 사용한 휴대폰 번호 또는 이메일 계정, 성명(또는 닉네임)</p>
                            <p><strong>• 처리 소요 시간:</strong> 접수 후 {CONFIG.responseTime} 내 파기 완료 및 확인 회신</p>
                        </div>
                    </div>
                </section>

                {/* Data Deletion Details */}
                <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-black text-rose-600 uppercase tracking-wider">DATA MANAGEMENT</span>
                            <h2 className="text-lg sm:text-xl font-bold text-stone-900">삭제되는 데이터 및 보관 정책</h2>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <div className="font-bold text-sm text-stone-800 flex items-center gap-2 text-emerald-700">
                                <CheckCircle2 size={16} /> 1. 앱 내 탈퇴 시 삭제되는 데이터
                            </div>
                            <ul className="text-xs text-stone-600 space-y-1.5 pl-6 list-disc">
                                <li><strong>로그인 계정 식별 정보:</strong> Firebase Authentication 계정(로그인 세션) 삭제</li>
                                <li><strong>기기 내 저장 데이터:</strong> 앱 내 로컬 저장소(LocalStorage, Preferences)에 캐시된 모든 개인 데이터 삭제</li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <div className="font-bold text-sm text-stone-800 flex items-center gap-2 text-rose-600">
                                <CheckCircle2 size={16} /> 2. 이메일 요청 시 삭제되는 서버 저장 데이터 (영업일 기준 7일 이내 처리)
                            </div>
                            <ul className="text-xs text-stone-600 space-y-1.5 pl-6 list-disc">
                                <li><strong>프로필 정보:</strong> 성별, 연령대, 출생연도/생년월일(양력/음력), 이름, 연락처, SNS 계정 정보</li>
                                <li><strong>건강 설문 및 분석 내역:</strong> 7단계 데일리 컨디션 설문 답변, 전문가 진단 리포트, 추천 혈자리 지도 데이터 일체</li>
                                <li><strong>귀 사진 이미지 데이터:</strong> 사용자가 업로드한 좌우 귀 촬영 사진 원본 및 파일(Cloud Storage)</li>
                                <li><strong>예약 및 신청 기록:</strong> 1:1 상담 예약 신청서, 메모, 온/오프라인 수강 신청 기록</li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <div className="font-bold text-sm text-stone-800 flex items-center gap-2 text-stone-600">
                                <Clock size={16} /> 3. 관련 법령에 따른 보관 예외 (해당 시에만 적용)
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed pl-6">
                                원칙적으로 탈퇴 시 모든 데이터는 지체 없이 파기됩니다. 단, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관계 법령에 따라 거래 내역 보존 의무가 발생하는 경우(예: 오프라인 수강료 결제 및 취소/환불 내역)에는 법정 기간(계약/청약철회 5년, 대금결제/재화공급 5년, 소비자 불만/분쟁처리 3년) 동안 다른 데이터와 분리 보관된 후 해당 기간 경과 시 영구 파기됩니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Additional Guidance & Caution */}
                <div className="p-5 rounded-2xl bg-stone-100/80 border border-stone-200/80 text-xs text-stone-600 space-y-2">
                    <div className="font-bold text-stone-800 flex items-center gap-1.5">
                        <AlertCircle size={15} className="text-stone-500" />
                        유의사항 안내
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-stone-500">
                        <li>계정 탈퇴가 완료되면 과거에 받았던 귀 분석 결과 및 리포트는 복구할 수 없습니다.</li>
                        <li>재가입 시에도 이전 데이터는 연동되지 않으며, 새로운 계정으로 시작됩니다.</li>
                        <li>기타 개인정보 처리 및 권리 행사에 관한 자세한 사항은 <Link href="/privacy" className="text-[#2E7D32] underline font-bold">개인정보처리방침</Link>에서 확인하실 수 있습니다.</li>
                    </ul>
                </div>

            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
