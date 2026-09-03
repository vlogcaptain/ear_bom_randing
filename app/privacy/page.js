'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, CheckCircle2, Lock, Phone, Mail, Building, ExternalLink } from 'lucide-react';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
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
                        <Shield size={16} /> 개인정보처리방침
                    </span>
                </div>
                <Link 
                    href="/terms" 
                    className="text-xs font-bold text-stone-500 hover:text-[#2E7D32] transition-colors"
                >
                    이용약관 보기 &rarr;
                </Link>
            </header>

            {/* Main Document Container */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                
                {/* Header Title Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-black uppercase tracking-wider inline-block">
                        PRIVACY POLICY
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                        이어봄 웰니스 개인정보처리방침
                    </h1>
                    <p className="text-sm text-stone-600 leading-relaxed font-medium">
                        이어봄 웰니스(이하 &lsquo;회사&rsquo;)는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하며, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 본 방침은 회사가 어떤 개인정보를 어떤 목적으로 처리하며 언제 파기하는지를 투명하게 안내합니다.
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
                        <li><a href="#a1" className="hover:text-[#2E7D32] transition-colors">제1조 수집하는 개인정보 항목</a></li>
                        <li><a href="#a2" className="hover:text-[#2E7D32] transition-colors">제2조 개인정보의 처리 목적</a></li>
                        <li><a href="#a3" className="hover:text-[#2E7D32] transition-colors">제3조 처리 및 보유 기간</a></li>
                        <li><a href="#a4" className="hover:text-[#2E7D32] transition-colors">제4조 개인정보의 제3자 제공</a></li>
                        <li><a href="#a5" className="hover:text-[#2E7D32] transition-colors">제5조 개인정보 처리의 위탁</a></li>
                        <li><a href="#a6" className="hover:text-[#2E7D32] transition-colors">제6조 개인정보의 파기 절차 및 방법</a></li>
                        <li><a href="#a7" className="hover:text-[#2E7D32] transition-colors">제7조 정보주체의 권리와 행사 방법</a></li>
                        <li><a href="#a8" className="hover:text-[#2E7D32] transition-colors">제8조 개인정보의 안전성 확보 조치</a></li>
                        <li><a href="#a9" className="hover:text-[#2E7D32] transition-colors">제9조 귀 사진 및 건강정보 보호 특칙</a></li>
                        <li><a href="#a10" className="hover:text-[#2E7D32] transition-colors">제10조 개인정보 보호책임자</a></li>
                        <li><a href="#a11" className="hover:text-[#2E7D32] transition-colors">제11조 권익침해 구제 방법</a></li>
                        <li><a href="#a12" className="hover:text-[#2E7D32] transition-colors">제12조 개인정보처리방침의 변경</a></li>
                    </ol>
                </nav>

                {/* Articles Content */}
                <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/90 shadow-sm space-y-12 leading-relaxed text-sm text-stone-700">
                    
                    {/* Article 1 */}
                    <section id="a1" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제1조</span>
                            <h2 className="text-lg font-black text-stone-900">수집하는 개인정보 항목</h2>
                        </div>
                        <p>
                            회사는 서비스 제공, 회원 식별, 온라인 건강 진단 및 상담 예약을 위해 필요한 최소한의 개인정보를 수집합니다. 이용자가 폼에 직접 입력하거나 업로드하는 방법으로 수집됩니다.
                        </p>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse border border-stone-200 rounded-xl overflow-hidden">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                                    <tr>
                                        <th className="p-3 border-r border-stone-200">구분</th>
                                        <th className="p-3 border-r border-stone-200">수집 항목</th>
                                        <th className="p-3">수집 목적 및 방법</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    <tr>
                                        <td className="p-3 font-bold text-[#2E7D32] border-r border-stone-200">회원 가입 및 관리</td>
                                        <td className="p-3 border-r border-stone-200">휴대폰 번호 (인증용), 성명 (또는 닉네임)</td>
                                        <td className="p-3">회원제 서비스 이용에 따른 본인 식별 및 가입 의사 확인</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-[#2E7D32] border-r border-stone-200">무료 온라인 진단</td>
                                        <td className="p-3 border-r border-stone-200">성별, 생년월일(양/음력), 5대 건강 설문 응답, 양쪽 귀 사진 데이터, 평소 건강 루틴 및 상세 불편사항(선택)</td>
                                        <td className="p-3">이혈 반응점 분석 및 1:1 맞춤 진단 결과 도출 (설문 작성 시 수집)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-[#2E7D32] border-r border-stone-200">강좌 및 상담 신청</td>
                                        <td className="p-3 border-r border-stone-200">신청자명, 연락처, 희망 강좌/상담 유형, 예약 일시</td>
                                        <td className="p-3">수강 등록 및 1:1 방문 상담 일정 조율·확정 안내</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                            <div className="font-bold text-stone-800">🚫 수집하지 않는 정보</div>
                            <p className="text-stone-500">
                                회사는 주민등록번호, 외국인등록번호 등 고유식별정보와 사상, 신념, 범죄경력 등 민감정보를 일절 수집하지 않습니다.
                            </p>
                        </div>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제15조(개인정보의 수집·이용), 제16조(개인정보의 수집 제한)
                        </div>
                    </section>


                    {/* Article 2 */}
                    <section id="a2" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제2조</span>
                            <h2 className="text-lg font-black text-stone-900">개인정보의 처리 목적</h2>
                        </div>
                        <p>회사는 수집한 개인정보를 다음의 목적으로만 처리하며, 목적이 변경될 경우 사전 동의를 받습니다.</p>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 font-medium">
                            <li><strong>귀 건강 분석 및 진단 결과 제공:</strong> 이혈요법 기반 반응점 판독 및 1:1 맞춤 건강 리포트 처방</li>
                            <li><strong>강좌 수강 및 상담 예약 관리:</strong> 수강 신청 접수, 예약 일정 조율 및 확정 SMS 알림 발송</li>
                            <li><strong>회원 서비스 운영 및 고객 지원:</strong> 본인 확인, 서비스 개선 의견 수렴, 문의 응대</li>
                        </ul>
                        <p className="text-xs font-bold text-[#2E7D32]">
                            ※ 회사는 수집한 연락처를 이용자의 사전 동의 없는 무단 영리성 광고/스팸 발송에 이용하지 않습니다.
                        </p>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제15조 제1항, 제18조(개인정보의 목적 외 이용·제공 제한)
                        </div>
                    </section>


                    {/* Article 3 */}
                    <section id="a3" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제3조</span>
                            <h2 className="text-lg font-black text-stone-900">개인정보의 처리 및 보유 기간</h2>
                        </div>
                        <p>
                            회사는 원칙적으로 개인정보의 처리 목적이 달성되면 지체 없이 파기합니다.
                        </p>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse border border-stone-200 rounded-xl overflow-hidden">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                                    <tr>
                                        <th className="p-3 border-r border-stone-200">구분</th>
                                        <th className="p-3 border-r border-stone-200">보유 기간</th>
                                        <th className="p-3">보존 근거</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">회원 정보 및 진단 기록</td>
                                        <td className="p-3 border-r border-stone-200">회원 탈퇴 시까지</td>
                                        <td className="p-3">서비스 이용 계약 유지 및 이력 조회</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">강좌 및 상담 신청 기록</td>
                                        <td className="p-3 border-r border-stone-200">상담 및 교육 종료 후 1년</td>
                                        <td className="p-3">고객 응대 및 분쟁 조율</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">계약 또는 청약철회에 관한 기록</td>
                                        <td className="p-3 border-r border-stone-200">5년</td>
                                        <td className="p-3">전자상거래 등에서의 소비자보호에 관한 법률</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제21조(개인정보의 파기)
                        </div>
                    </section>


                    {/* Article 4 */}
                    <section id="a4" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제4조</span>
                            <h2 className="text-lg font-black text-stone-900">개인정보의 제3자 제공</h2>
                        </div>
                        <p>
                            회사는 이용자의 개인정보를 <strong>제3자에게 제공하지 않습니다.</strong> 단, 이용자의 사전 동의가 있거나 법령의 규정에 의거한 경우에만 예외적으로 제공합니다.
                        </p>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제17조(개인정보의 제공)
                        </div>
                    </section>


                    {/* Article 5 */}
                    <section id="a5" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제5조</span>
                            <h2 className="text-lg font-black text-stone-900">개인정보 처리의 위탁</h2>
                        </div>
                        <p>
                            회사는 원활하고 안정적인 서비스 운영을 위해 아래와 같이 개인정보 처리 업무를 전문 업체에 위탁하고 있습니다.
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse border border-stone-200 rounded-xl overflow-hidden">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                                    <tr>
                                        <th className="p-3 border-r border-stone-200">수탁자</th>
                                        <th className="p-3 border-r border-stone-200">위탁 업무 내용</th>
                                        <th className="p-3">보관 위치</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">Google LLC (Firebase)</td>
                                        <td className="p-3 border-r border-stone-200">클라우드 서버 인프라, 사용자 인증, 데이터베이스(Firestore) 및 귀 사진 저장소(Storage) 호스팅</td>
                                        <td className="p-3">대한민국 (서울 리전)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">(주)알리고 (Aligo)</td>
                                        <td className="p-3 border-r border-stone-200">예약 접수/확정 및 진단 결과 안내 SMS 문자 발송</td>
                                        <td className="p-3">대한민국</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제26조(업무위탁에 따른 개인정보의 처리 제한)
                        </div>
                    </section>


                    {/* Article 6 */}
                    <section id="a6" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제6조</span>
                            <h2 className="text-lg font-black text-stone-900">개인정보의 파기 절차 및 방법</h2>
                        </div>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 font-medium">
                            <li><strong>파기 절차:</strong> 이용 목적이 달성된 개인정보는 내부 방침 및 관련 법령에 따라 지체 없이 파기합니다.</li>
                            <li><strong>파기 방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 영구 삭제합니다. 회사는 개인정보를 별도의 종이 문서로 출력하여 보관하지 않습니다.</li>
                        </ul>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제21조, 시행령 제16조
                        </div>
                    </section>


                    {/* Article 7 */}
                    <section id="a7" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제7조</span>
                            <h2 className="text-lg font-black text-stone-900">정보주체의 권리와 행사 방법</h2>
                        </div>
                        <p>
                            이용자는 언제든지 자신의 개인정보에 대해 <strong>열람, 정정, 삭제, 처리정지</strong>를 요구할 수 있습니다.
                        </p>
                        <p className="text-xs text-stone-600">
                            권리 행사는 개인정보 보호책임자에게 전화(010-5266-0150) 또는 전자우편(js100216@naver.com)으로 요청하실 수 있으며, 회사는 요청을 받은 날부터 <strong>10일 이내</strong>에 조치하고 결과를 통지합니다.
                        </p>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제35조~제37조
                        </div>
                    </section>


                    {/* Article 8 */}
                    <section id="a8" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제8조</span>
                            <h2 className="text-lg font-black text-stone-900">개인정보의 안전성 확보 조치</h2>
                        </div>
                        <p>회사는 개인정보의 분실, 도난, 유출, 위조 또는 훼손을 방지하기 위해 다음 조치를 취하고 있습니다.</p>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 font-medium">
                            <li><strong>접근 권한 제한:</strong> 개인정보 처리 담당자 및 전문가 관리자만 접근할 수 있도록 권한을 통제합니다.</li>
                            <li><strong>전송 구간 암호화:</strong> 전체 웹사이트에 SSL/TLS(HTTPS) 보안 통신 프로토콜을 적용하고 있습니다.</li>
                            <li><strong>저장소 보안:</strong> 클라우드 데이터베이스 및 저장소의 암호화 저장 기능을 활용합니다.</li>
                        </ul>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제29조(안전조치의무)
                        </div>
                    </section>


                    {/* Article 9 */}
                    <section id="a9" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제9조</span>
                            <h2 className="text-lg font-black text-stone-900">귀 사진 및 건강 설문정보 보호 특칙</h2>
                        </div>
                        <p>
                            이용자가 온라인 진단을 위해 등록한 귀 사진 데이터 및 건강 설문 내용은 <strong>오직 1:1 맞춤 건강 분석 및 결과 제공 목적으로만 사용</strong>되며, 이용자의 별도 명시적 동의 없이 대외에 공개되거나 제3자에게 제공되지 않습니다.
                        </p>
                    </section>


                    {/* Article 10 */}
                    <section id="a10" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제10조</span>
                            <h2 className="text-lg font-black text-stone-900">개인정보 보호책임자</h2>
                        </div>
                        <p>
                            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 관련 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                        </p>

                        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><strong className="text-stone-500">상호명:</strong> 이어봄 웰니스</div>
                                <div><strong className="text-stone-500">책임자 / 대표자:</strong> 백정숙</div>
                                <div><strong className="text-stone-500">연락처:</strong> 010-5266-0150</div>
                                <div><strong className="text-stone-500">전자우편:</strong> js100216@naver.com</div>
                                <div className="sm:col-span-2"><strong className="text-stone-500">사업자등록번호:</strong> 821-31-01754</div>
                                <div className="sm:col-span-2"><strong className="text-stone-500">소재지:</strong> 서울특별시 성동구 행당로 82, 105동 1402호 / 광진구 센터: 서울시 광진구 능동로 59길 27, 1층</div>
                            </div>
                        </div>
                        <div className="text-[11px] text-stone-400 font-medium">
                            <strong>근거:</strong> 「개인정보 보호법」 제31조(개인정보 보호책임자의 지정)
                        </div>
                    </section>


                    {/* Article 11 */}
                    <section id="a11" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제11조</span>
                            <h2 className="text-lg font-black text-stone-900">권익침해 구제 방법</h2>
                        </div>
                        <p>
                            정보주체는 개인정보 침해로 인한 구제를 받기 위하여 아래 기관에 분쟁 해결이나 상담을 신청하실 수 있습니다.
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse border border-stone-200 rounded-xl overflow-hidden">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                                    <tr>
                                        <th className="p-3 border-r border-stone-200">기관명</th>
                                        <th className="p-3 border-r border-stone-200">전화번호</th>
                                        <th className="p-3">웹사이트</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200 font-medium">
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">개인정보분쟁조정위원회</td>
                                        <td className="p-3 border-r border-stone-200">1833-6972</td>
                                        <td className="p-3"><a href="https://www.kopico.go.kr" target="_blank" rel="noopener" className="text-[#2E7D32] hover:underline">kopico.go.kr</a></td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">개인정보침해신고센터</td>
                                        <td className="p-3 border-r border-stone-200">118</td>
                                        <td className="p-3"><a href="https://privacy.kisa.or.kr" target="_blank" rel="noopener" className="text-[#2E7D32] hover:underline">privacy.kisa.or.kr</a></td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">대검찰청 사이버수사과</td>
                                        <td className="p-3 border-r border-stone-200">1301</td>
                                        <td className="p-3"><a href="https://www.spo.go.kr" target="_blank" rel="noopener" className="text-[#2E7D32] hover:underline">spo.go.kr</a></td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold border-r border-stone-200">경찰청 사이버수사국</td>
                                        <td className="p-3 border-r border-stone-200">182</td>
                                        <td className="p-3"><a href="https://ecrm.police.go.kr" target="_blank" rel="noopener" className="text-[#2E7D32] hover:underline">ecrm.police.go.kr</a></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>


                    {/* Article 12 */}
                    <section id="a12" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                            <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-[#1B5E20] font-black text-xs">제12조</span>
                            <h2 className="text-lg font-black text-stone-900">개인정보처리방침의 변경</h2>
                        </div>
                        <p>
                            본 개인정보처리방침은 <strong>2026년 9월 3일</strong>부터 적용됩니다. 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 수정이 있을 시에는 변경 사항의 시행 7일 전부터 웹사이트를 통하여 고지합니다.
                        </p>
                    </section>

                </div>

            </main>

            <Footer />
        </div>
    );
}
