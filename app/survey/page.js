'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Camera, Upload, Info, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const questions = [
    {
        id: 1,
        question: "현재 가장 불편한 증상은 무엇인가요?",
        options: ["만성 통증 (어깨/허리 등)", "불면증 / 수면 장애", "스트레스 / 불안감", "소화 불량 / 식욕 문제", "기타 / 예방 차원"]
    },
    {
        id: 2,
        question: "최근 피로도는 어느 정도인가요?",
        options: ["매우 상쾌함", "보통임", "오후에 피곤함", "항상 피곤함", "번아웃 상태"]
    },
    {
        id: 3,
        question: "하루 평균 수면 시간은 어떻게 되나요?",
        options: ["8시간 이상", "6~7시간", "4~5시간", "4시간 미만", "불규칙함"]
    },
    {
        id: 4,
        question: "현재 스트레스 수준을 선택해주세요.",
        options: ["거의 없음", "가끔 받음", "지속적인 스트레스", "매우 심각함"]
    },
    {
        id: 5,
        question: "식욕 상태는 어떤가요?",
        options: ["정상", "식욕 부진", "과식/폭식 경향", "불규칙함"]
    }
];

export default function Survey() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);

    // Personal Info States (Gender & Birthdate)
    const [gender, setGender] = useState(''); // '남성' | '여성'
    const [birthYear, setBirthYear] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [birthType, setBirthType] = useState('양력'); // '양력' | '음력'

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    const [answers, setAnswers] = useState({});
    const [etcDetail, setEtcDetail] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Ear Photos States
    const [leftEarPhoto, setLeftEarPhoto] = useState(null);
    const [rightEarPhoto, setRightEarPhoto] = useState(null);
    const [leftPreview, setLeftPreview] = useState(null);
    const [rightPreview, setRightPreview] = useState(null);
    
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?from=survey');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return null;
    }

    const handleOptionSelect = (option) => {
        setAnswers({ ...answers, [currentStep - 1]: option });
    };

    const handleFileChange = async (e, side) => {
        let file = e.target.files[0];
        if (file) {
            const fileExt = file.name.split('.').pop().toLowerCase();
            if (fileExt === 'heic' || fileExt === 'heif') {
                try {
                    const heic2any = (await import('heic2any')).default;
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.8
                    });
                    
                    const actualBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    file = new File(
                        [actualBlob],
                        file.name.replace(/\.(heic|heif)$/i, '.jpg'),
                        { type: 'image/jpeg' }
                    );
                } catch (err) {
                    console.error("HEIC conversion failed:", err);
                    alert("HEIC 이미지 변환 중 오류가 발생했습니다. 가능하면 일반 사진(JPG/PNG)을 업로드해 주세요.");
                    return;
                }
            }

            if (side === 'left') {
                setLeftEarPhoto(file);
                const reader = new FileReader();
                reader.onloadend = () => setLeftPreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setRightEarPhoto(file);
                const reader = new FileReader();
                reader.onloadend = () => setRightPreview(reader.result);
                reader.readAsDataURL(file);
            }
        }
    };


    const handleNext = async () => {
        const totalSteps = 8;
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            // Finish survey and save to Firestore
            setIsSaving(true);
            try {
                let leftUrl = null;
                let rightUrl = null;

                if (leftEarPhoto) {
                    const leftRef = ref(storage, `ear_photos/${user.uid}/left_${Date.now()}`);
                    await uploadBytes(leftRef, leftEarPhoto);
                    leftUrl = await getDownloadURL(leftRef);
                }

                if (rightEarPhoto) {
                    const rightRef = ref(storage, `ear_photos/${user.uid}/right_${Date.now()}`);
                    await uploadBytes(rightRef, rightEarPhoto);
                    rightUrl = await getDownloadURL(rightRef);
                }

                const finalAnswers = { ...answers };
                if (finalAnswers[0] === '기타 / 예방 차원') {
                    finalAnswers[0] = `기타 / 예방 차원: ${etcDetail || '상세내용 없음'}`;
                }

                await addDoc(collection(db, 'surveys'), {
                    userId: user.uid,
                    userName: user.displayName || user.phoneNumber || '사용자',
                    gender,
                    birthDate: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')} (${birthType})`,
                    answers: finalAnswers,
                    description,
                    earPhotoUrl: leftUrl, // Backward compatibility
                    leftEarUrl: leftUrl,
                    rightEarUrl: rightUrl,
                    createdAt: serverTimestamp()
                });
                router.push('/survey/complete');
            } catch (error) {
                console.error("Error saving survey:", error);
                alert("결과 저장 중 오류가 발생했습니다. 하지만 안내 페이지로 이동합니다.");
                router.push('/survey/complete');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const totalSteps = 8;
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', position: 'relative' }}>
            {/* Floating Logout Button */}
            <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 50 }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        color: '#ef4444',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fca5a5';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                >
                    <LogOut size={14} />
                    <span>로그아웃</span>
                </button>
            </div>
            <div className="container" style={{ maxWidth: '600px' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '40px' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                    </div>

                    {/* Header */}
                    <div style={{ marginBottom: '40px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {currentStep <= 5 ? `질문 ${currentStep} / 5` : currentStep === 6 ? '기본 인적사항 입력' : currentStep === 7 ? '귀 사진 업로드' : '추가 작성 사항'}
                        </span>
                        <h2 style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                            {currentStep <= 5 ? questions[currentStep - 1].question : currentStep === 6 ? '성별 및 생년월일을 입력해 주세요.' : currentStep === 7 ? '양쪽 귀 사진을 업로드해 주세요.' : '평소 건강관리 루틴이나 특별히 불편한 부분을 설명해주세요.'}
                        </h2>
                    </div>

                    {/* Options / Upload Area */}
                    <div style={{ marginBottom: '40px' }}>
                        {currentStep <= 5 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {questions[currentStep - 1].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(option)}
                                        style={{
                                            padding: '16px 20px',
                                            borderRadius: '12px',
                                            border: answers[currentStep - 1] === option ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                            background: answers[currentStep - 1] === option ? 'var(--secondary)' : 'white',
                                            color: answers[currentStep - 1] === option ? 'var(--primary-dark)' : 'var(--text-primary)',
                                            textAlign: 'left',
                                            fontSize: '1rem',
                                            fontWeight: answers[currentStep - 1] === option ? '600' : '400',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {option}
                                        {answers[currentStep - 1] === option && <CheckCircle size={20} />}
                                    </button>
                                ))}
                                {currentStep === 1 && answers[0] === '기타 / 예방 차원' && (
                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="text-xs font-bold text-[#2E7D32]">기타 원하시는 건강 상담 및 예방 목적을 자유롭게 적어주세요</label>
                                        <textarea
                                            value={etcDetail}
                                            onChange={(e) => setEtcDetail(e.target.value)}
                                            placeholder="예: 이명 완화 목적, 최근 수면 보조 등 상세 내용을 입력해주세요."
                                            style={{
                                                width: '100%',
                                                height: '100px',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.9rem',
                                                outline: 'none',
                                                resize: 'none'
                                            }}
                                            className="focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : currentStep === 6 ? (
                            <div className="space-y-6">
                                {/* 성별 선택 */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 block">성별</label>
                                    <div className="flex gap-3">
                                        {['남성', '여성'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setGender(g)}
                                                style={{
                                                    flex: 1,
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: gender === g ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                                    background: gender === g ? 'var(--secondary)' : 'white',
                                                    color: gender === g ? 'var(--primary-dark)' : 'var(--text-primary)',
                                                    fontWeight: '700',
                                                    fontSize: '1rem',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 생년월일 입력 */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 block">생년월일</label>
                                    
                                    {/* 연도, 월, 일 3단 그리드 */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400">년도 (4자리)</span>
                                            <input
                                                type="number"
                                                placeholder="1995"
                                                value={birthYear}
                                                onChange={(e) => {
                                                    const val = e.target.value.slice(0, 4);
                                                    setBirthYear(val);
                                                }}
                                                className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400">월</span>
                                            <select
                                                value={birthMonth}
                                                onChange={(e) => setBirthMonth(e.target.value)}
                                                className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm font-bold bg-white"
                                            >
                                                <option value="">선택</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                    <option key={m} value={m}>{m}월</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400">일</span>
                                            <select
                                                value={birthDay}
                                                disabled={!birthMonth}
                                                onChange={(e) => setBirthDay(e.target.value)}
                                                className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm font-bold bg-white disabled:bg-slate-50 disabled:text-slate-300"
                                            >
                                                <option value="">선택</option>
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                    <option key={d} value={d}>{d}일</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 양력 / 음력 선택 */}
                                    <div className="flex bg-slate-100 p-1 rounded-xl w-32 mt-2">
                                        {['양력', '음력'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setBirthType(type)}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${birthType === type ? 'bg-white text-[#2E7D32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : currentStep === 7 ? (
                            <div className="space-y-6">
                                {/* Sample Image Guidance */}
                                <div className="bg-pale p-6 rounded-[32px] border border-[#2E7D32]/10 overflow-hidden shadow-custom">
                                    <div className="flex items-center gap-2 text-[#2E7D32] mb-4 font-black">
                                        <Info size={20} />
                                        <span>전문가 권장 촬영 가이드</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4">
                                        <div className="rounded-2xl overflow-hidden border-2 border-white shadow-sm h-48">
                                            <img 
                                                src="/images/gallery/목 이물감 치루.png" 
                                                alt="Ear Shooting Guide" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <ul className="text-sm text-slate-600 space-y-2 font-medium">
                                            <li className="flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0" />
                                                그늘지지 않게 밝은 곳에서 촬영
                                            </li>
                                            <li className="flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0" />
                                                귓바퀴부터 귓불까지 전체 포함
                                            </li>
                                            <li className="flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0" />
                                                머리카락이나 액세서리 정리
                                            </li>
                                            <li className="flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0" />
                                                측면에서 선명하게 초점 맞추기
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    <div className="bg-[#2E7D32] text-white p-3 rounded-xl text-center text-xs font-bold">
                                        ⚠️ 정확한 분석을 위해 반드시 "양쪽 귀" 모두 촬영해 주세요.
                                    </div>
                                </div>

                                {/* Dual Upload Slots */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Left Ear Slot */}
                                    <div className="space-y-3">
                                        <p className="text-center font-bold text-slate-700 text-sm">왼쪽 귀</p>
                                        <label className={`
                                            relative flex flex-col items-center justify-center gap-3 p-6 h-48 
                                            border-2 border-dashed rounded-[24px] cursor-pointer transition-all overflow-hidden
                                            ${leftPreview ? 'border-solid border-[#2E7D32] bg-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
                                        `}>
                                            {leftPreview ? (
                                                <img src={leftPreview} alt="Left Ear" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Camera size={32} className="text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-500">사진 등록</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'left')} className="hidden" />
                                        </label>
                                    </div>

                                    {/* Right Ear Slot */}
                                    <div className="space-y-3">
                                        <p className="text-center font-bold text-slate-700 text-sm">오른쪽 귀</p>
                                        <label className={`
                                            relative flex flex-col items-center justify-center gap-3 p-6 h-48 
                                            border-2 border-dashed rounded-[24px] cursor-pointer transition-all overflow-hidden
                                            ${rightPreview ? 'border-solid border-[#2E7D32] bg-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
                                        `}>
                                            {rightPreview ? (
                                                <img src={rightPreview} alt="Right Ear" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Camera size={32} className="text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-500">사진 등록</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'right')} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                                    현재 복용 중인 약물이 있거나, 평소 불편했던 증상, 생활 습관(식습관, 수면 등)을 편하게 적어주시면 더 정밀하게 분석해 드립니다. (선택사항)
                                </p>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="예: 매일 비타민과 유산균을 복용 중이나 최근 수면의 질이 크게 떨어졌으며, 왼쪽 귀 주변이 찌릿거리는 통증이 종종 발생합니다."
                                    className="w-full h-48 p-5 border border-slate-200 rounded-[24px] outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent text-sm font-semibold transition-all resize-none bg-slate-50/50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={handlePrev}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--text-secondary)',
                                opacity: currentStep === 0 ? 0 : 1,
                                pointerEvents: currentStep === 0 ? 'none' : 'auto',
                                background: 'none'
                            }}
                        >
                            <ArrowLeft size={20} /> 이전
                        </button>

                        {/* Next Button Logic */}
                        {(() => {
                            const isNextDisabled = isSaving || (
                                currentStep <= 5
                                    ? !answers[currentStep - 1]
                                    : currentStep === 6
                                        ? (!gender || !birthYear || birthYear.length < 4 || !birthMonth || !birthDay)
                                        : currentStep === 7
                                            ? (!leftEarPhoto || !rightEarPhoto)
                                            : false // 8단계는 선택이므로 disabled되지 않음
                            );
                            return (
                                <button
                                    onClick={handleNext}
                                    disabled={isNextDisabled}
                                    className="btn btn-primary"
                                    style={{
                                        opacity: isNextDisabled ? 0.5 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> 저장 중...
                                        </>
                                    ) : (
                                        <>
                                            {currentStep === 8 ? '분석 요청하기' : '다음'}
                                            {currentStep !== 8 && <ArrowRight size={20} />}
                                        </>
                                    )}
                                </button>
                            );
                        })()}
                    </div>

                </div>
            </div>
        </div>
    );
}
