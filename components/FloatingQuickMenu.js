'use client';

import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

export default function FloatingQuickMenu() {
    const pathname = usePathname();

    // 전문가용 관리 콘솔 경로(/admin 또는 /admin/*)인 경우 노출되지 않도록 차단
    if (pathname && pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3.5 select-none animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* 네이버 블로그 버튼 */}
            <a
                href="https://blog.naver.com/js_ear"
                target="_blank"
                rel="noopener noreferrer"
                className="w-13 h-13 rounded-full bg-[#03C75A] shadow-md hover:shadow-lg flex items-center justify-center text-white hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 group"
                title="네이버 블로그 문의"
            >
                {/* 네이버 N 로고 고밀도 벡터 SVG */}
                <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-5.5 h-5.5"
                >
                    <path d="M16.2 3H21v18h-4.8l-8.4-12v12H3V3h4.8l8.4 12V3z"/>
                </svg>
            </a>

            {/* 카카오톡 오픈채팅 버튼 */}
            <a
                href="https://open.kakao.com/o/sTJMmaCi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-13 h-13 rounded-full bg-[#FEE500] shadow-md hover:shadow-lg flex items-center justify-center text-[#191919] hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300"
                title="카카오톡 오픈채팅 문의"
            >
                {/* 카카오톡 말풍선 고밀도 벡터 SVG */}
                <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-6 h-6"
                >
                    <path d="M12 3c-5.523 0-10 3.879-10 8.665 0 3.09 1.867 5.794 4.672 7.27-.183.676-.662 2.443-.758 2.802-.12.45.153.444.322.331.134-.09 2.128-1.446 2.977-2.022.909.18 1.863.284 2.787.284 5.523 0 10-3.88 10-8.665C22 6.879 17.523 3 12 3z"/>
                </svg>
            </a>

            {/* 메시지 전용 SMS 연동 버튼 */}
            <a
                href="sms:01052660150?body=안녕하세요,%20이어봄%20문의드립니다."
                className="w-13 h-13 rounded-full bg-[#E53935] shadow-md hover:shadow-lg flex items-center justify-center text-white hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300"
                title="메시지 전송 문의"
            >
                <MessageSquare className="w-5.5 h-5.5 fill-white/10" />
            </a>
        </div>
    );
}
