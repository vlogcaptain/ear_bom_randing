'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function TermsPage() {
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
                <h1 className="text-3xl font-bold mb-10 pb-6 border-b border-gray-100">서비스 이용약관</h1>
                
                <div className="prose prose-green max-w-none text-gray-600 leading-relaxed space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
                        <p>
                            본 약관은 '이노홈 홀딩스'(이하 "회사")가 운영하는 웹사이트 및 모바일 애플리케이션 '이어봄'(이하 "서비스")에서 제공하는 모든 서비스의 이용 조건 및 절차, 이용자와 회사의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제2조 (용어의 정의)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>"서비스"란 회사가 제공하는 이침 분석, 건강 정보 제공, 전문가 상담 예약 등의 서비스를 의미합니다.</li>
                            <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
                        <p>
                            회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 화면에 게시합니다. 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 변경된 약관은 공지사항 또는 이메일을 통해 공지합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (결제 및 환불)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>이용자는 회사가 정한 결제 수단을 통해 유료 서비스(전문가 상담 등)를 이용할 수 있습니다.</li>
                            <li>환불 규정은 전자상거래법 등 관련 법령 및 회사의 내부 운영 정책에 따릅니다. 상담 시작 전 취소 시 전액 환불이 가능하나, 상담이 시작된 이후에는 환불이 제한될 수 있습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">제5조 (책임의 제한)</h2>
                        <p>
                            회사가 제공하는 건강 분석 정보는 참고용이며 의료적 진단을 대체할 수 없습니다. 이용자는 전문적인 의료적 치료나 진단이 필요한 경우 반드시 의료기관을 방문해야 합니다.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
