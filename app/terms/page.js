'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Phone, Mail, Building, Scale, RefreshCw } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsPage() {
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
                        <Scale size={16} /> 서비스 이용약관 & 운영정책
                    </span>
                </div>
                <Link 
                    href="/privacy" 
                    className="text-xs font-bold text-stone-500 hover:text-[#2E7D32] transition-colors"
                >
                    개인정보처리방침 &rarr;
                </Link>
            </header>

            {/* Main Document Container */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                
                {/* Header Title Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-black uppercase tracking-wider inline-block">
                        TERMS OF SERVICE & POLICY
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                        이어봄 웰니스 서비스 이용약관
                    </h1>
                    <p className="text-sm text-stone-600 leading-relaxed font-medium">
                        본 약관은 이어봄 웰니스(이하 &lsquo;회사&rsquo;)가 제공하는 온라인 귀 건강 분석, 웰니스 교육 강좌, 1:1 맞춤 상담 예약 및 귀 건강 갤러리 등 모든 서비스의 이용 조건과 절차, 권리·의무 및 환불 규정을 안내합니다.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2 text-xs text-stone-400 font-bold border-t border-stone-100">
                        <span>시행일: 2026년 9월 3일</span>
                        <span>버전: v1.2</span>
                    </div>
                </div>

                {/* Table of Contents (TOC) */}
                <nav className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                    <div className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                        목차 (Table of Contents)
                    </div>
                    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-stone-700">
                        <li><a href="#a1" className="hover:text-[#2E7D32] transition-colors">제1조 목적</a></li>
                        <li><a href="#a2" className="hover:text-[#2E7D32] transition-colors">제2조 용어의 정의</a></li>
                        <li><a href="#a3" className="hover:text-[#2E7D32] transition-colors">제3조 약관의 효력 및 변경</a></li>
                        <li><a href="#a4" className="hover:text-[#2E7D32] transition-colors">제4조 회원가입 및 계정 관리</a></li>
                        <li><a href="#a5" className="hover:text-[#2E7D32] transition-colors">제5조 강좌 수강 및 상담 예약·결제</a></li>
                        <li><a href="#refund" className="hover:text-[#2E7D32] text-[#2E7D32] font-black transition-colors flex items-center gap-1">제6조 취소, 변경 및 환불 규정 <RefreshCw size={12} /></a></li>
                        <li><a href="#a7" className="hover:text-[#2E7D32] transition-colors">제7조 게시판 및 갤러리 운영정책</a></li>
                        <li><a href="#a8" className="hover:text-[#2E7D32] transition-colors">제8조 권리침해 신고 및 임시조치</a></li>
                        <li><a href="#a9" className="hover:text-[#2E7D32] transition-colors">제9조 의료행위와의 구별 및 책임 제한</a></li>
                        <li><a href="#a10" className="hover:text-[#2E7D32] transition-colors">제10조 운영 및 분쟁조정 담당자</a></li>
                    </ol>
                </nav>

                {/* Articles Content */}
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/90 shadow-sm space-y-12 leading-relaxed text-sm text-stone-700">
                    
                    {/* Article 1 */}
                    <section id="a1" className="space-y-3 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제1조</span>
                            <h2 className="text-lg font-black text-stone-900">목적</h2>
                        </div>
                        <p>
                            본 약관은 이어봄 웰니스(이하 &lsquo;회사&rsquo;)가 운영하는 웹사이트(earbom.com) 및 제반 서비스(이하 &lsquo;서비스&rsquo;)에서 제공하는 온라인 귀 건강 분석, 웰니스 교육 강좌, 상담 예약, 갤러리 게시판의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
                        </p>
                    </section>

                    {/* Article 2 */}
                    <section id="a2" className="space-y-3 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제2조</span>
                            <h2 className="text-lg font-black text-stone-900">용어의 정의</h2>
                        </div>
                        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-stone-600 font-medium">
                            <li><strong>&lsquo;서비스&rsquo;:</strong> 회사가 제공하는 무료 비대면 귀 건강 진단, 웰니스 교육 아카데미(원데이/5주/8주), 1:1 방문 맞춤 상담 및 귀 건강 정보 갤러리 일체를 의미합니다.</li>
                            <li><strong>&lsquo;이용자&rsquo;:</strong> 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                            <li><strong>&lsquo;회원&rsquo;:</strong> 회사에 휴대폰 번호 인증을 통해 가입하여 서비스 계정을 보유한 자를 의미합니다.</li>
                        </ol>
                    </section>

                    {/* Article 3 */}
                    <section id="a3" className="space-y-3 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제3조</span>
                            <h2 className="text-lg font-black text-stone-900">약관의 효력 및 변경</h2>
                        </div>
                        <p>
                            회사는 본 약관을 사이트 하단 및 메뉴에 게시하여 이용자가 언제든 확인할 수 있도록 합니다. 관계 법령을 위배하지 않는 범위 내에서 약관을 개정할 수 있으며, 개정 약관은 적용일자 7일 전부터 사전 공지합니다.
                        </p>
                    </section>

                    {/* Article 4 */}
                    <section id="a4" className="space-y-3 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제4조</span>
                            <h2 className="text-lg font-black text-stone-900">회원가입 및 계정 관리</h2>
                        </div>
                        <p>
                            이용자는 회사가 정한 절차에 따라 휴대폰 번호 SMS 인증을 통해 가입할 수 있습니다. 회원은 계정 정보를 본인이 관리해야 하며, 타인에게 양도하거나 대여할 수 없습니다.
                        </p>
                    </section>

                    {/* Article 5 */}
                    <section id="a5" className="space-y-3 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제5조</span>
                            <h2 className="text-lg font-black text-stone-900">강좌 수강 및 상담 예약·결제</h2>
                        </div>
                        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-stone-600 font-medium">
                            <li>이용자는 웹사이트의 신청 폼을 통해 강좌(원데이/5주/8주) 또는 1:1 방문 상담을 예약할 수 있습니다.</li>
                            <li>수강료 및 상담 비용은 회사가 안내하는 무통장 입금 계좌 또는 온라인 결제 수단을 통해 납부하며, 입금 확인 후 예약 및 수강이 최종 확정됩니다.</li>
                        </ol>
                    </section>


                    {/* Article 6: Refund Policy (Key Highlight with id="refund") */}
                    <section id="refund" className="space-y-4 scroll-mt-24 p-6 rounded-2xl bg-emerald-50/40 border-2 border-[#2E7D32]/30">
                        <div className="flex items-center justify-between pb-2 border-b border-[#2E7D32]/20">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-[#2E7D32] text-white font-black text-xs">제6조</span>
                                <h2 className="text-lg font-black text-[#1B5E20]">취소, 변경 및 환불 규정</h2>
                            </div>
                            <span className="text-[11px] font-bold text-[#2E7D32] bg-white px-2.5 py-1 rounded-full border border-[#2E7D32]/30 shadow-2xs">
                                공정거래위원회 기준 준용
                            </span>
                        </div>

                        <p className="text-xs text-stone-600 font-medium">
                            회사는 「전자상거래 등에서의 소비자보호에 관한 법률」 및 공정거래위원회 「소비자분쟁해결기준」에 따라 투명하고 공정한 취소 및 환불 기준을 운영합니다.
                        </p>

                        {/* Refund Table 1: Academy Courses */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                                🎓 1. 이어봄 웰니스 강좌 수강료 환불 기준 (원데이 클래스 / 5주 / 8주)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse border border-stone-200 rounded-xl overflow-hidden bg-white">
                                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                                        <tr>
                                            <th className="p-3 border-r border-stone-200">취소 및 반환 신청 시점</th>
                                            <th className="p-3">환불 금액 및 기준</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-200 font-medium">
                                        <tr>
                                            <td className="p-3 border-r border-stone-200 font-bold">해당 강좌 개강일 전 취소</td>
                                            <td className="p-3 text-[#2E7D32] font-bold">기납부 수강료 전액 (100%) 환불</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 border-r border-stone-200">총 수업시간의 1/3 경과 전</td>
                                            <td className="p-3">수강료의 2/3 해당액 환불</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 border-r border-stone-200">총 수업시간의 1/2 경과 전</td>
                                            <td className="p-3">수강료의 1/2 해당액 환불</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 border-r border-stone-200">총 수업시간의 1/2 경과 후</td>
                                            <td className="p-3 text-stone-400">환불 불가</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Refund Table 2: 1:1 Appointments */}
                        <div className="space-y-2 pt-2">
                            <h3 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                                🗓️ 2. 1:1 맞춤 방문 상담 예약 취소 및 환불 기준
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse border border-stone-200 rounded-xl overflow-hidden bg-white">
                                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                                        <tr>
                                            <th className="p-3 border-r border-stone-200">취소 접수 시점</th>
                                            <th className="p-3">환불 금액 및 처리 기준</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-200 font-medium">
                                        <tr>
                                            <td className="p-3 border-r border-stone-200 font-bold">상담 예약 시간 24시간 전</td>
                                            <td className="p-3 text-[#2E7D32] font-bold">결제 금액의 100% 전액 환불</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 border-r border-stone-200">상담 예약 시간 12시간 전 ~ 24시간 전</td>
                                            <td className="p-3">결제 금액의 50% 환불</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 border-r border-stone-200">상담 예약 12시간 미만 또는 당일 미참석(노쇼)</td>
                                            <td className="p-3 text-stone-400">환불 불가 (전문가 일정 선점 및 준비 비용)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Refund Process Info */}
                        <div className="p-4 rounded-xl bg-white border border-stone-200/90 text-xs space-y-1.5">
                            <div className="font-bold text-stone-800">📌 환불 신청 및 입금 절차</div>
                            <ul className="list-disc pl-5 space-y-1 text-stone-600">
                                <li><strong>신청 방법:</strong> 고객센터(010-5266-0150) 문자 또는 카카오톡 1:1 채팅으로 접수</li>
                                <li><strong>환불 처리:</strong> 취소 승인일로부터 영업일 기준 3일 이내 신청자 본인 계좌로 환불 입금됩니다.</li>
                            </ul>
                        </div>
                    </section>


                    {/* Article 7 */}
                    <section id="a7" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제7조</span>
                            <h2 className="text-lg font-black text-stone-900">게시판 및 갤러리 운영정책</h2>
                        </div>
                        <p>회사가 운영하는 귀 건강 갤러리 및 후기 게시판은 건강 정보 공유를 위한 공간입니다.</p>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 font-medium">
                            <li><strong>저작권 및 초상권 보호:</strong> 갤러리에 게시된 사진과 콘텐츠의 권리는 회사 또는 원권리자에게 있으며 무단 복제 및 도용을 금합니다.</li>
                            <li><strong>금지되는 게시물:</strong> 타인의 명예를 훼손하는 글, 영리 목적의 무단 광고, 욕설·비방, 음란물 등은 사전 통보 없이 임시조치 또는 삭제될 수 있습니다.</li>
                        </ul>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제44조
                        </div>
                    </section>


                    {/* Article 8 */}
                    <section id="a8" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제8조</span>
                            <h2 className="text-lg font-black text-stone-900">권리침해 신고 및 임시조치 절차</h2>
                        </div>
                        <p>
                            게시물로 인해 사생활 침해나 명예훼손 등 권리를 침해받은 자는 회사에 해당 게시물의 삭제 또는 반박 내용의 게재를 요청할 수 있습니다.
                        </p>
                        <p className="text-xs text-stone-600">
                            회사는 신고 접수 시 「정보통신망법」 제44조의2에 따라 지체 없이 삭제 또는 최대 30일간의 임시조치를 취하고 결과를 안내합니다.
                        </p>
                    </section>


                    {/* Article 9 */}
                    <section id="a9" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제9조</span>
                            <h2 className="text-lg font-black text-stone-900">의료행위와의 구별 및 책임의 제한</h2>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs">
                            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                                <AlertCircle size={15} className="text-amber-700" /> 중요 안내 (책임의 한계)
                            </div>
                            <p className="text-amber-800 leading-relaxed font-medium">
                                이어봄 서비스에서 제공하는 귀 건강 분석, 이혈 상담 및 교육은 <strong>자연치유 및 보완대체의학에 기초한 생활 웰니스 건강관리 프로그램</strong>입니다. 이는 의료기관의 전문적인 의학적 진단 및 치료를 대신할 수 없으며, 질병의 진단 및 치료는 반드시 전문 의료기관(의사/한의사)을 방문하시기 바랍니다.
                            </p>
                        </div>
                    </section>


                    {/* Article 10 */}
                    <section id="a10" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제10조</span>
                            <h2 className="text-lg font-black text-stone-900">운영 및 권리침해 신고 담당자 안내</h2>
                        </div>
                        <p>
                            약관, 환불, 게시판 운영 및 권리침해 신고에 관한 문의는 아래 공식 창구로 연락 주시면 신속하게 처리해 드립니다.
                        </p>

                        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><strong className="text-stone-500">상호명:</strong> 이어봄 웰니스</div>
                                <div><strong className="text-stone-500">대표자 및 운영 담당자:</strong> 백정숙</div>
                                <div><strong className="text-stone-500">고객센터 연락처:</strong> 010-5266-0150</div>
                                <div><strong className="text-stone-500">전자우편 문의:</strong> js100216@naver.com</div>
                                <div className="sm:col-span-2"><strong className="text-stone-500">광진구 교육·상담 센터:</strong> 서울특별시 광진구 능동로 59길 27, 1층</div>
                            </div>
                        </div>
                    </section>

                </div>

            </main>

            <Footer />
        </div>
    );
}
