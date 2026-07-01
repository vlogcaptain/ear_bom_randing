'use client';

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-pale pt-16 pb-12 border-t border-green-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-[#2E7D32] rounded-lg flex items-center justify-center relative shadow-sm">
                                <Image
                                    src="/logo.png"
                                    alt="earbom wellness logo"
                                    width={42}
                                    height={42}
                                    className="object-contain invert brightness-0"
                                />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-[#1B5E20]">earbom wellness</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed max-w-lg mb-6 text-sm">
                            earbom wellness는 이침(耳鍼) 요법의 지혜를 전문가의 기술과 결합하여<br />
                            모든 사람이 일상에서 쉽게 건강을 관리할 수 있도록 돕습니다.
                        </p>
                        
                        {/* 사업자 정보 섹션 */}
                        <div className="text-xs text-gray-400 space-y-1">
                            <p>상호명: 이노홈 홀딩스 | 대표자: 김도형</p>
                            <p>사업자등록번호: 794-09-01034 | 통신판매업신고번호: 제2026-서울 송파-1203호</p>
                            <p>주소: 서울특별시 송파구 충민로 66, 패션관 9056호 (문정동, 가든파이브라이프)</p>
                            <p>고객센터: 010-5266-0150 | 이메일: js100216@naver.com</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">서비스</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li><Link className="hover:text-[#2E7D32]" href="/#concept">이침 원리 소개</Link></li>
                            <li><Link className="hover:text-[#2E7D32]" href="/gallery">갤러리</Link></li>
                            <li><Link className="hover:text-[#2E7D32]" href="/appointment">상담예약</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">고객지원</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li><Link className="hover:text-[#2E7D32]" href="/terms">이용약관</Link></li>
                            <li><Link className="hover:text-[#2E7D32]" href="/privacy">개인정보처리방침</Link></li>
                            <li><Link className="hover:text-[#2E7D32]" href="/terms">취소 및 환불규정</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-green-200 text-xs text-gray-400 gap-4">
                    <p>© 2026 earbom wellness (이노홈 홀딩스). All rights reserved.</p>
                    <div className="flex gap-6 items-center">
                        <a className="hover:text-[#2E7D32]" href="#">Instagram</a>
                        <a className="hover:text-[#2E7D32]" href="#">Facebook</a>
                        <a className="hover:text-[#2E7D32]" href="#">YouTube</a>
                        <span className="w-px h-3 bg-gray-200 ml-2"></span>
                        <Link className="hover:text-[#2E7D32] text-gray-300 font-medium ml-2" href="/admin/login">전문가 전용</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
