'use client';

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ExternalLink, BookOpen } from "lucide-react";

export default function SurveyComplete() {
    return (
        <div className="min-h-screen bg-[#f8f7f6] py-20 px-6 flex items-center justify-center font-sans text-slate-900">
            <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-custom border border-green-50 overflow-hidden p-8 md:p-12 space-y-10">
                
                {/* 1. Success Message */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-[#FFF0F2] rounded-full flex items-center justify-center border border-pink-100 animate-bounce">
                            <CheckCircle2 size={48} className="text-[#F697AB]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">분석 요청이 완료되었습니다</h1>
                    <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                        귀 사진과 답변이 정상적으로 접수되었습니다.<br />
                        <span className="text-[#F697AB] font-bold">1일 이내</span>에 대표 전문가의 분석이 완료되는 즉시 입력하신 번호로 알림 문자를 발송해 드립니다.
                    </p>
                </div>

                <hr className="border-slate-100" />

                {/* 2. Expert Profile Card */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-700 text-center md:text-left">분석을 진행할 전문가를 소개합니다</h3>
                    <div className="bg-[#fcfbf9] rounded-3xl border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-28 h-28 relative rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                            <Image
                                src="/expert_baek.png"
                                alt="백정숙 수석지도사"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div>
                                <span className="inline-block text-xs font-bold text-[#F697AB] bg-[#FFF0F2] px-2.5 py-1 rounded-full border border-pink-100 mb-1.5">
                                    earbom wellness 대표 전문가
                                </span>
                                <h4 className="text-xl font-extrabold text-slate-800">백정숙 수석지도사</h4>
                            </div>
                            <p className="text-slate-400 text-sm font-semibold flex flex-wrap justify-center md:justify-start gap-1.5">
                                <span>#통증관리</span>
                                <span>#스트레스케어</span>
                                <span>#이침전문가</span>
                            </p>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                건강은 아플 때만 지키는 것이 아니라, 평생 함께 관리하는 것입니다. 귀를 통해 몸이 보내는 신호를 읽고 건강관리의 방향을 제시하는 귀 분석 전문가입니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Action Buttons & Links */}
                <div className="grid gap-4">
                    <Link
                        href="/appointment"
                        className="w-full bg-[#F697AB] hover:bg-[#C6566D] text-white py-5 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-pink-900/10 transition-all group"
                    >
                        <span>대면 상담 및 무료 특강 신청하기</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="https://blog.naver.com/js100216"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 py-4 px-6 rounded-2xl transition-all font-bold text-slate-700 group"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-slate-400 group-hover:text-slate-600 transition-colors" size={20} />
                            <span>이침 요법 더 알아보기 (공식 블로그)</span>
                        </div>
                        <ExternalLink size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </Link>

                    <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-4 px-6 rounded-2xl transition-all font-bold text-slate-700 group"
                    >
                        <span>내가 작성했던 진단 리포트 다시보기</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
