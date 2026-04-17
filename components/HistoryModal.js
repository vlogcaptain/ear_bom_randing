'use client';

import { X, Calendar, BookOpen, Activity, BarChart3, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export default function HistoryModal({ isOpen, onClose }) {
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-[#2E7D32]">
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">상세 정보</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12">
                    <div className="max-w-3xl mx-auto space-y-12">

                        {/* 1. 제목 및 정의 */}
                        <div className="text-center space-y-6">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                                이침 요법의 역사적 기원과<br />현대적 진화의 궤적
                            </h1>
                            <div className="h-1.5 w-20 bg-[#2E7D32] mx-auto rounded-full"></div>
                        </div>

                        {/* 2. 서론 */}
                        <section className="space-y-6">
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                이침 요법(Auriculotherapy)은 외이(Outer ear)의 특정 부위를 자극하여 전신적인 생리적 반응을 유도하고 질병을 치료하는 독창적인 마이크로시스템(Microsystem) 요법으로 분류된다. 이 요법의 기원은 고대 문명권 전반에 걸쳐 광범위하게 발견되는데, 역사적 기록에 따르면 고대 이집트, 그리스, 로마에서 이미 귀의 특정 부위 자극을 통한 치료 행위가 존재했음이 확인된다. 특히 고대 페르시아의 의학 기록에서는 좌골신경통과 요통 치료를 위해 귀를 자극했다는 상세한 설명이 남아 있으며, 이러한 지식의 흐름은 중세 유럽을 거쳐 현대 프랑스 의학으로 이어지는 가교 역할을 수행했다.
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                동양의학의 관점에서도 귀는 신체의 핵심적인 통로로 인식되어 왔다. 기원전 500년경에 편찬된 것으로 추정되는 동양 최고의 의학서인 '황제내경(Yellow Emperor's Classic of Internal Medicine)'에는 귀의 특정 지점이 질병 완화에 기여한다는 기록이 포함되어 있다. 그러나 고대 중국의 이침 요법은 체계적인 지도로 정리되기보다는 몇몇 특정 질환에 활용되는 단편적인 혈자리들의 집합에 가까웠다. 현대적인 의미의 체계적인 이침 이론은 1950년대 프랑스의 신경과 의사 폴 노지에(Paul Nogier) 박사의 발견에 의해 비로소 확립되었다.
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                노지에 박사는 1950년경 자신의 환자들 중 일부가 프랑스의 민간 치료사로부터 귀의 특정 부위를 소작(Cauterization)받은 후 좌골신경통 증상이 획기적으로 개선된 사례를 목격하고 이에 대한 깊은 연구를 시작했다. 그는 귀의 해부학적 구조가 모체 내부에서 거꾸로 서 있는 태아의 형상(Inverted Fetus)과 완벽하게 상응한다는 사실을 발견하고, 이를 '태아 도상 이론'으로 정립하여 1956년 마르세유에서 열린 학회에서 최초로 발표하였다. 이 발표는 현대 이침 요법의 탄생을 알리는 결정적인 계기가 되었으며, 이후 독일과 중국으로 번역되어 전 세계적인 연구 열풍을 일으켰다. 특히 중국의 남경 부대 이침 연구팀은 1958년부터 2,000명 이상의 환자를 대상으로 한 대규모 임상 연구를 통해 노지에 박사의 이론적 정확성을 검증하였고, 이를 바탕으로 현대적인 동양의학식 이침 요법을 재구축하였다.
                            </p>
                        </section>

                        {/* 3. 역사적 발전 표 */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="text-[#2E7D32]" size={20} />
                                <h3 className="text-xl font-bold text-slate-800">시대 및 지역별 발전사</h3>
                            </div>
                            <div className="overflow-hidden border border-slate-100 rounded-3xl shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#E8F5E9]/50 text-[#2E7D32] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">시대 및 지역</th>
                                            <th className="px-6 py-4">이침 요법의 특징 및 발전 내용</th>
                                            <th className="px-6 py-4">관련 문헌 및 인물</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">고대 이집트/그리스/로마</td>
                                            <td className="px-6 py-4">귀 자극을 통한 초기 형태의 증상 완화 시도</td>
                                            <td className="px-6 py-4 text-xs font-medium">고대 의료 기록</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">고대 페르시아</td>
                                            <td className="px-6 py-4">좌골신경통 및 요통 치료를 위한 구체적인 귀 자극법 기록</td>
                                            <td className="px-6 py-4 text-xs font-medium">페르시아 의학서</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">고대 중국(기원전 500년)</td>
                                            <td className="px-6 py-4">귀가 경락과 연결되어 있다는 기초적 인식 형성</td>
                                            <td className="px-6 py-4 text-xs font-medium">황제내경</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">현대 프랑스(1950년대)</td>
                                            <td className="px-6 py-4">태아 도상 이론 확립 및 현대 이침 요법의 체계화</td>
                                            <td className="px-6 py-4 text-xs font-medium">폴 노지에 박사</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">현대 중국(1958년 이후)</td>
                                            <td className="px-6 py-4">노지에 이론의 대규모 임상 검증 및 경락 이론과의 융합</td>
                                            <td className="px-6 py-4 text-xs font-medium">남경 부대 연구팀</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 4. 생물학적 메커니즘 */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="text-[#2E7D32]" size={20} />
                                <h3 className="text-xl font-bold text-slate-800">생물학적 메커니즘과 신경학적 상응 체계</h3>
                            </div>
                            <div className="space-y-6 text-slate-600 leading-relaxed">
                                <p className="font-medium">
                                    이침 요법의 효과를 설명하는 핵심적인 원리는 귀의 복잡한 신경 분포와 중추신경계 간의 상호작용에 있다. 노지에 박사는 외이의 피부 영역이 뇌 및 척수의 특정 부위와 직접적인 신경 정보를 주고받는다고 주장하였으며, 이는 현대 신경생리학에서 널리 받아들여지는 체성 감각 지도(Somatotopic Organization) 개념과 궤를 같이한다. 구체적으로 귀의 각 부위는 배아의 세 가지 층인 외배엽, 중배엽, 내배엽과 연결된 해부학적 상응 구조를 가진다.
                                </p>
                                <p className="font-medium">
                                    귀의 신경학적 구조를 심층적으로 분석하면, 이침 자극이 단순한 국소적 반응을 넘어 전신적인 자율신경계 조절에 관여하는 이유를 파악할 수 있다. 분석 결과에 따르면, 외이의 자극은 미주신경(Vagus nerve)과 자율신경계(ANS)를 통해 내부 장기 및 호르몬 분비에 영향을 미친다. 특히 노지에 박사가 발견한 혈관 자율신경 신호(Vascular Autonomic Signal, VAS)는 귀의 특정 지점을 자극했을 때 요골 동맥의 맥박 상태가 변화하는 비자발적 동맥 반사 현상으로, 이는 이침이 신체의 항상성을 조절하는 강력한 기전임을 시사한다.
                                </p>
                                <p className="font-medium">
                                    전통 동양의학적 관점에서의 이침 기전은 경락 이론(Meridian Theory)에 기반한다. 이 이론에 따르면 귀는 12경락이 직간접적으로 모두 모이는 곳으로, 귀를 자극함으로써 기(Qi)와 혈의 흐름을 조절하고 장부의 불균형을 해소할 수 있다. 현대의 이침 요법은 이러한 전통적인 경락 접근법과 서구의 신경생리학적 접근법이 융합된 형태를 취하고 있으며, 이는 실제 임상 현장에서 질병의 진단과 치료를 동시에 수행하는 독특한 마이크로시스템으로서의 가치를 증명하고 있다.
                                </p>
                            </div>

                            {/* 기전 표 */}
                            <div className="overflow-hidden border border-slate-100 rounded-3xl shadow-sm mt-8">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#E8F5E9]/50 text-[#2E7D32] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">이론적 모델</th>
                                            <th className="px-6 py-4">주요 기전 및 설명</th>
                                            <th className="px-6 py-4">근거 데이터</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">태아 도상 이론</td>
                                            <td className="px-6 py-4">귀의 형태를 거꾸로 선 태아로 보고 신체 부위를 매핑함</td>
                                            <td className="px-6 py-4 text-xs font-medium">노지에 박사</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">신경반사 모델</td>
                                            <td className="px-6 py-4">귀의 신경 말단 자극이 뇌와 척수를 통해 신체 반응 유도</td>
                                            <td className="px-6 py-4 text-xs font-medium">신경생리학</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">미주신경 조절</td>
                                            <td className="px-6 py-4">귀의 내측 부위 자극이 자율신경계 및 내장 기능을 조절함</td>
                                            <td className="px-6 py-4 text-xs font-medium">미주신경-ANS 연결</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">경락 수렴 모델</td>
                                            <td className="px-6 py-4">신체의 12경락이 귀에 모여 전신 기혈 순환을 조절함</td>
                                            <td className="px-6 py-4 text-xs font-medium">황제내경</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">VAS(혈관 자율신경 신호)</td>
                                            <td className="px-6 py-4">이침 자극 시 요골 동맥 맥박의 비자발적 반사 변화 관찰</td>
                                            <td className="px-6 py-4 text-xs font-medium">노지에 박사의 발견</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 5. 임상적 효능 */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="text-[#2E7D32]" size={20} />
                                <h3 className="text-xl font-bold text-slate-800">주요 질환별 임상적 효능 및 연구 데이터 분석</h3>
                            </div>
                            <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
                                <p>
                                    이침 요법은 다양한 현대 질환에 대해 유의미한 치료 효과를 보이는 것으로 보고되고 있으며, 특히 비만, 통증, 정신 건강 영역에서의 연구가 활발히 진행되고 있다. 비만 환자를 대상으로 한 국내외 연구 논문 19편을 최종 분석한 결과에 따르면, 이침 요법은 신체 계측 수치의 유의미한 감소뿐만 아니라 혈당 및 혈중 지질 농도의 개선, 혈중 호르몬 수치 변화를 유도하여 체중 감량에 효과적인 중재 방안임이 입증되었다. 비만 치료 시 주로 사용되는 경혈점은 신문(Shenmen), 기점(Hunger), 위(Stomach), 내분비(Endocrine) 등이며, 주 1~3회 빈도로 4~18주간 지속했을 때 효과가 극대화되는 경향을 보였다.
                                </p>
                                <p>
                                    정신 건강 및 수면 장애 영역에서도 이침은 강력한 비침습적 대안으로 부각되고 있다. 임상 연구 결과, 이침 요법은 불안 증상을 최대 40%까지 감소시켰으며, 수면의 질을 30~50% 개선하는 효과를 보였다. 특히 만성적인 스트레스 상황에서 신문점과 뇌간 부위를 자극할 경우 부교감 신경이 활성화되어 정서적 안정감을 제공하고 야간 각성 횟수를 줄이는 등의 긍정적인 변화가 관찰되었다.
                                </p>
                                <p>
                                    통증 관리 분야에서는 미국의 군 진료 체계에서 활용되는 'Battlefield Acupuncture(BFA)' 프로토콜이 대표적인 성공 사례로 꼽힌다. 이 프로토콜은 신문, 시상, 오메가 2, 포인트 제로, 대상회라는 5개의 특정 혈자리를 자극하여 급성 및 만성 통증을 신속하게 완화하는 것을 목적으로 하며, 약물 의존도를 낮추는 효과가 있어 군 병원과 전장에서 광범위하게 사용되고 있다. 또한 만성 두통과 편두통 환자들을 대상으로 한 지속적인 이침 적용은 통증의 강도와 발생 빈도를 최대 50%까지 낮추는 결과를 가져왔다.
                                </p>
                            </div>

                            {/* 데이터 표 */}
                            <div className="overflow-hidden border border-slate-100 rounded-3xl shadow-sm mt-8">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#E8F5E9]/50 text-[#2E7D32] font-black uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">대상 질환</th>
                                            <th className="px-6 py-4">주요 연구 결과 및 수치적 성과</th>
                                            <th className="px-6 py-4">빈번하게 활용되는 혈자리 조합</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">비만 및 대사 증후군</td>
                                            <td className="px-6 py-4">BMI 감소, 혈중 지질 개선, 식욕 억제</td>
                                            <td className="px-6 py-4 text-xs font-medium">신문, 기점, 위, 내분비, 삼초</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">불안 및 스트레스</td>
                                            <td className="px-6 py-4">불안 지수 최대 40% 감소, 정서적 이완 유도</td>
                                            <td className="px-6 py-4 text-xs font-medium">신문, 뇌간, 심, 자율신경점</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">수면 장애</td>
                                            <td className="px-6 py-4">수면의 질 30~50% 개선, 야간 각성 감소</td>
                                            <td className="px-6 py-4 text-xs font-medium">신문, 심, 수면점, 피질하</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">급성/만성 통증</td>
                                            <td className="px-6 py-4">통증 강도 30~40% 완화, 빠른 회복 지원</td>
                                            <td className="px-6 py-4 text-xs font-medium">신문, 시상, 오메가 2, 대상회, 포인트 제로</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-800">두통 및 편두통</td>
                                            <td className="px-6 py-4">두통 빈도 및 강도 50% 감소</td>
                                            <td className="px-6 py-4 text-xs font-medium">신문, 뇌간, 전두, 측두</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 font-medium">자료 출처: 이침 요법의 역사적 기원과 현대적 진화의 궤적</p>
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-8 py-3 bg-[#2E7D32] text-white rounded-2xl font-bold hover:bg-[#1B5E20] transition-all"
                    >
                        확인 완료
                    </button>
                </div>
            </div>
        </div>
    );
}
