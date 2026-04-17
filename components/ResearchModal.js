'use client';

import { X, BookOpen, Microscope, ExternalLink, Activity, Brain, Moon, Heart, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';

export default function ResearchModal({ isOpen, onClose }) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const researchList = [
        {
            category: "통증 치료 (Battlefield Acupuncture)",
            title: "Electroacupuncture vs Auricular Acupuncture for Chronic Pain in Cancer Survivors",
            authors: "Mao JJ et al. (2021)",
            journal: "JAMA Oncology",
            result: "귀침(BFA 포함)이 암 환자 만성 통증 감소에 효과적임을 입증, 비약물 치료 옵션으로 제시",
            linkText: "jamanetwork.com",
            icon: <Activity className="text-orange-500" size={20} />
        },
        {
            category: "미주신경 조절",
            title: "Auricular Acupuncture and Vagal Regulation",
            authors: "He W et al. (2012)",
            journal: "Evidence-Based Complementary and Alternative Medicine",
            result: "귀 자극이 심혈관·호흡·소화 기능의 미주신경 활동에 직접적인 영향을 미침",
            linkText: "PMC",
            icon: <Brain className="text-blue-500" size={20} />
        },
        {
            category: "통증 메타분석",
            title: "Clinical Efficacy of Auricular Vagus Nerve Stimulation for Pain",
            authors: "Duff IT et al. (2024)",
            journal: "Systematic Review & Meta-analysis",
            result: "이개 미주신경 자극(aVNS)이 만성 통증 치료에 대한 유효성과 높은 임상적 가치를 확인",
            linkText: "PMC",
            icon: <TrendingUp className="text-green-500" size={20} />
        },
        {
            category: "불면증 개선",
            title: "Transcutaneous Auricular Vagus Nerve Stimulation for Chronic Insomnia",
            authors: "Zhang S et al. (2024)",
            journal: "JAMA Network Open",
            result: "경피적 이개 미주신경 자극(taVNS)이 수면의 질 개선 및 입면 시간 단축에 효과적",
            linkText: "jamanetwork.com",
            icon: <Moon className="text-indigo-500" size={20} />
        },
        {
            category: "수술 후 관리",
            title: "Randomized Trial of Battlefield Acupuncture for Postoperative Pain",
            authors: "Plunkett A et al. (2018)",
            journal: "PubMed (편도선 수술 환자 대상)",
            result: "수술 후 통증 완화 및 전문 진통제(Opioids) 사용 빈도를 유의미하게 감소시킴",
            linkText: "PubMed",
            icon: <Activity className="text-red-500" size={20} />
        },
        {
            category: "미군 및 보건국 적용",
            title: "Battlefield Acupuncture for Chronic Pain Management",
            authors: "Montgomery AD et al. (2020)",
            journal: "PMC",
            result: "미군 및 VA 병원에서 실제 도입 중인 5-point 귀침 프로토콜의 임상적 표준 설명",
            linkText: "PMC",
            icon: <Activity className="text-slate-500" size={20} />
        },
        {
            category: "신경조절 고찰",
            title: "Auricular Vagus Neuromodulation – Systematic Review",
            authors: "Verma N et al. (2021)",
            journal: "Frontiers",
            result: "귀의 미주신경 이개지(ABVN)가 비침습적 신경조절의 가장 중요한 해부학적 타겟임을 입증",
            linkText: "Frontiers",
            icon: <Microscope className="text-cyan-500" size={20} />
        },
        {
            category: "심혈관계 영향",
            title: "Acupuncture at the Auricular Branch of the Vagus Nerve",
            authors: "Boehmer AA et al. (2020)",
            journal: "사이언스다이렉트",
            result: "귀 미주신경 자극 시 즉각적인 자율신경계 반응으로 심박수 약 4~6% 감소 확인",
            linkText: "ScienceDirect",
            icon: <Heart className="text-rose-500" size={20} />
        },
        {
            category: "우울증 보조 치료",
            title: "Meta-analysis of Auricular Acupressure for Depression",
            authors: "Yang X et al. (2025)",
            journal: "PMC",
            result: "Hamilton Depression Scale의 유의미한 감소를 통해 우울증의 보조적 치료 가능성 제시",
            linkText: "PMC",
            icon: <Brain className="text-purple-500" size={20} />
        },
        {
            category: "자율신경계 반응",
            title: "Heart Rate Variability During Auricular Acupressure",
            authors: "Trinh DTT et al. (2023)",
            journal: "Frontiers",
            result: "귀 지압 중 심박변이도(HRV)의 긍정적 변화를 통해 실시간 자율신경 조절 효과 입증",
            linkText: "Frontiers",
            icon: <Activity className="text-emerald-500" size={20} />
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Microscope size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">RESEARCH</h2>
                            <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">미국 이침 연구 핵심 논문 TOP 10</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/30">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Intro Box */}
                        <div className="bg-indigo-600 rounded-[32px] p-8 md:p-10 text-white shadow-xl shadow-indigo-200">
                            <div className="flex items-start gap-4">
                                <span className="text-4xl md:text-5xl opacity-50">☛</span>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4 leading-snug">
                                        이침은 단순한 대체의학이 아닙니다.<br />
                                        <span className="text-indigo-200">Auricular Neuromodulation (이개 신경조절)</span> 치료입니다.
                                    </h3>
                                    <p className="text-indigo-100 text-lg leading-relaxed">
                                        귀 → 미주신경 + 삼차신경 → 뇌간 → 자율신경 조절로 이어지는
                                        과학적이고 신경학적인 메커니즘을 통해 현대 의학의 새로운 타겟으로 부상하고 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Research Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {researchList.map((item, idx) => (
                                <div key={idx} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                            {item.icon}
                                        </div>
                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-tighter">{item.category}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                                        {item.title}
                                    </h4>
                                    <div className="flex flex-col gap-1 mb-4">
                                        <p className="text-sm text-slate-500 font-medium italic">{item.authors}</p>
                                        <p className="text-xs font-bold text-slate-400">{item.journal}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {item.result}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                                        <ExternalLink size={10} />
                                        <span>출처: {item.linkText}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 font-medium">데이터 제공: JAMA Oncology, PubMed, Frontiers, PMC 외 미국 주요 연구 데이터베이스</p>
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        연구 데이터 확인 완료
                    </button>
                </div>
            </div>
        </div>
    );
}
