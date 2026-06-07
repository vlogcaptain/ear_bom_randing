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
    },
    {
        id: 6,
        question: "마지막으로, 귀 사진을 업로드해 주세요.",
        options: [] // Special step for file upload
    }
];

export default function Survey() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    const [answers, setAnswers] = useState({});
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
        setAnswers({ ...answers, [currentStep]: option });
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
        if (currentStep < questions.length - 1) {
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

                await addDoc(collection(db, 'surveys'), {
                    userId: user.uid,
                    userName: user.displayName || user.phoneNumber || '사용자',
                    answers: answers,
                    earPhotoUrl: leftUrl, // Backward compatibility
                    leftEarUrl: leftUrl,
                    rightEarUrl: rightUrl,
                    createdAt: serverTimestamp()
                });
                router.push('/dashboard');
            } catch (error) {
                console.error("Error saving survey:", error);
                alert("결과 저장 중 오류가 발생했습니다. 하지만 대시보드로 이동합니다.");
                router.push('/dashboard');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const progress = ((currentStep + 1) / questions.length) * 100;

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
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>QUESTION {currentStep + 1} / {questions.length}</span>
                        <h2 style={{ fontSize: '1.8rem', marginTop: '10px' }}>{questions[currentStep].question}</h2>
                    </div>

                    {/* Options / Upload Area */}
                    <div style={{ marginBottom: '40px' }}>
                        {currentStep === 5 ? (
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {questions[currentStep].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(option)}
                                        style={{
                                            padding: '16px 20px',
                                            borderRadius: '12px',
                                            border: answers[currentStep] === option ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                            background: answers[currentStep] === option ? 'var(--secondary)' : 'white',
                                            color: answers[currentStep] === option ? 'var(--primary-dark)' : 'var(--text-primary)',
                                            textAlign: 'left',
                                            fontSize: '1rem',
                                            fontWeight: answers[currentStep] === option ? '600' : '400',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {option}
                                        {answers[currentStep] === option && <CheckCircle size={20} />}
                                    </button>
                                ))}
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

                        <button
                            onClick={handleNext}
                            disabled={(currentStep === questions.length - 1 ? (!leftEarPhoto || !rightEarPhoto) : !answers[currentStep]) || isSaving}
                            className="btn btn-primary"
                            style={{
                                opacity: (currentStep === questions.length - 1 ? (!leftEarPhoto || !rightEarPhoto) : !answers[currentStep]) || isSaving ? 0.5 : 1,
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
                                    {currentStep === questions.length - 1 ? '결과 분석하기' : '다음'}
                                    {currentStep !== questions.length - 1 && <ArrowRight size={20} />}
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
