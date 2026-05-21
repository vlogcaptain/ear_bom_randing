'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-green-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center shadow-sm">
                            <Image
                                src="/logo.png"
                                alt="ear bom healthy logo"
                                width={52}
                                height={52}
                                className="object-contain invert brightness-0"
                            />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-[#1B5E20]">ear bom healthy</span>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <h1 className="text-3xl font-bold mb-10 pb-6 border-b border-gray-100">개인정보 처리방침</h1>
                
                <div className="prose prose-green max-w-none text-gray-600 leading-relaxed space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제1조 (수집하는 개인정보 항목)</h2>
                        <p>회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>필수항목</strong>: 이름, 이메일, 성별, 나이대, 분석을 위한 귀 사진 데이터</li>
                            <li><strong>유료 서비스 이용 시</strong>: 결제 승인 번호 및 결제 관련 기록 (카드번호 본체는 저장하지 않음)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제2조 (개인정보의 이용 목적)</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>서비스 제공 및 건강 분석 결과 도출</li>
                            <li>이용자 회원관리 및 본인 확인</li>
                            <li>유료 서비스 결제 및 정산 처리</li>
                            <li>서비스 개선 및 고객 상담 응대</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제3조 (개인정보의 처리 및 보유 기간)</h2>
                        <p>
                            회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 상법 등 관계 법령의 규정에 의하여 일정 기간 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (이용자의 권리와 의무)</h2>
                        <p>
                            이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 수집 및 이용에 대한 동의 철회(회원탈퇴)를 요청할 수 있습니다. 회사는 이용자의 요청에 대해 지체 없이 조치하겠습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제5조 (개인정보 보호책임자)</h2>
                        <p>
                            개인정보와 관련한 문의사항은 아래의 보호책임자에게 연락주시기 바랍니다.<br />
                            책임자: 김도형 | 이메일: js100216@naver.com
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
