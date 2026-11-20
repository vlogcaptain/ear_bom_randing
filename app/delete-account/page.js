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
// 추후 공식 고객센터 이메일 확정 시 아래 상수만 손쉽게 변경할 수 있습니다.
// ==========================================
const CONFIG = {
    appName: "earbom wellness (이어봄 웰니스)",
    companyName: "이어봄 웰니스",
    supportEmail: "js100216@naver.com", // 문의 및 삭제 요청 이메일 (확정 전 상수 분리)
    responseTime: "영업일 기준 24시간 이내",
    lastUpdated: "2026년 11월 20일",
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
                        이어봄 웰니스는 사용자의 개인정보 자기결정권을 존중하며, 구글 플레이(Google Play) 및 애플(Apple)의 개발자 계정 삭제 정책을 준수합니다. 본 페이지에서는 앱 내에서 계정을 직접 탈퇴하는 방법과 앱에 접속할 수 없는 경우 웹/이메일을 통해 계정 및 관련 데이터의 영구 파기를 요청하는 절차를 안내합니다.
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
                            <span className="text-xs font-black text-[#2E7D32] uppercase tracking-wider">방법 1 (가장 빠름)</span>
                            <h2 className="text-lg sm:text-xl font-bold text-stone-900">앱 내에서 직접 계정 삭제 (회원 탈퇴)</h2>
                        </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                        앱이 기기에 설치되어 있고 로그인이 가능한 경우, 앱 내에서 몇 번의 터치만으로 즉시 계정을 탈퇴하고 모든 데이터를 영구 삭제할 수 있습니다.
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
                            <p className="text-xs text-stone-500 leading-relaxed">확인 팝업에서 [확인]을 누르면 계정 및 모든 데이터가 즉시 영구 파기됩니다.</p>
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
                            <span className="text-xs font-black text-amber-600 uppercase tracking-wider">방법 2 (앱 접근이 불가능한 경우)</span>
                            <h2 className="text-lg sm:text-xl font-bold text-stone-900">이메일을 통한 계정 및 데이터 삭제 요청</h2>
                        </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                        앱을 이미 삭제하셨거나, 기기 분실·로그인 불가 등의 사유로 앱 내에서 직접 탈퇴가 어려우신 경우 고객지원 이메일로 삭제를 요청해 주시면 관리자가 본인 확인 후 즉시 안전하게 파기해 드립니다.
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
                            <div className="font-bold text-sm text-stone-800 flex items-center gap-2 text-rose-600">
                                <CheckCircle2 size={16} /> 1. 즉시 영구 삭제되는 데이터 (회수 불가)
                            </div>
                            <ul className="text-xs text-stone-600 space-y-1.5 pl-6 list-disc">
                                <li><strong>계정 식별 정보:</strong> Firebase Authentication 계정 UID, 로그인 이메일, 인증 휴대폰 번호</li>
                                <li><strong>프로필 정보:</strong> 성별, 연령대, 출생연도/생년월일(양력/음력)</li>
                                <li><strong>귀 사진 이미지 데이터:</strong> 사용자가 업로드한 좌우 귀 촬영 사진 원본 및 썸네일 (Cloud Storage에서 영구 삭제)</li>
                                <li><strong>웰니스 문진 및 분석 내역:</strong> 7단계 데일리 컨디션 설문 답변, 전문가 진단 리포트, 추천 혈자리 지도 데이터 일체</li>
                                <li><strong>예약 및 신청 이력:</strong> 1:1 상담 예약 신청서, 메모, 온/오프라인 수강 신청 기록</li>
                                <li><strong>기기 로컬 캐시:</strong> 앱 내 로컬 저장소(LocalStorage, Preferences)에 캐시된 모든 개인 데이터 즉시 파기</li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                            <div className="font-bold text-sm text-stone-800 flex items-center gap-2 text-stone-600">
                                <Clock size={16} /> 2. 관련 법령에 따른 보관 예외 (해당 시에만 적용)
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed pl-6">
                                원칙적으로 탈퇴 시 모든 데이터는 즉시 지체 없이 파기됩니다. 단, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관계 법령에 따라 거래 내역 보존 의무가 발생하는 경우(예: 오프라인 수강료 결제 및 취소/환불 내역)에는 법정 기간(계약/청약철회 5년, 대금결제/재화공급 5년, 소비자 불만/분쟁처리 3년) 동안 다른 데이터와 분리 보관된 후 해당 기간 경과 시 영구 파기됩니다.
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
