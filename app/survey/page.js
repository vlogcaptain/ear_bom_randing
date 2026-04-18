'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Camera, Upload, Info } from 'lucide-react';
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
    const { user, loading } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [earPhoto, setEarPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEarPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = async () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Finish survey and save to Firestore
            setIsSaving(true);
            try {
                let photoUrl = null;
                if (earPhoto) {
                    const storageRef = ref(storage, `ear_photos/${user.uid}/${Date.now()}`);
                    await uploadBytes(storageRef, earPhoto);
                    photoUrl = await getDownloadURL(storageRef);
                }

                await addDoc(collection(db, 'surveys'), {
                    userId: user.uid,
                    userName: user.displayName || user.phoneNumber || '사용자',
                    answers: answers,
                    earPhotoUrl: photoUrl,
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
        <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Tips Section */}
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '12px', fontWeight: 'bold' }}>
                                        <Info size={18} />
                                        <span>귀 사진 촬영 팁 (상담 전 확인!)</span>
                                    </div>
                                    <ul style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', paddingLeft: '20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                                        <li>밝은 조명 아래에서 그림자가 지지 않게 촬영해 주세요.</li>
                                        <li>귀 전체(귓바퀴부터 귓불까지)가 한 화면에 나오도록 해주세요.</li>
                                        <li>머리카락이나 안경, 귀걸이 등은 가급적 치워주시는 것이 좋습니다.</li>
                                        <li>정면에서 선명하게 초점을 맞춰 촬영해 주세요.</li>
                                    </ul>
                                </div>

                                {/* Upload Buttons */}
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gap: '12px' }}>
                                    {isMobile && (
                                        <label style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px',
                                            border: '2px dashed var(--primary)', borderRadius: '16px', cursor: 'pointer', background: 'white'
                                        }}>
                                            <Camera size={32} color="var(--primary)" />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>사진 찍기</span>
                                            <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
                                        </label>
                                    )}
                                    <label style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px',
                                        border: '2px dashed #cbd5e1', borderRadius: '16px', cursor: 'pointer', background: 'white'
                                    }}>
                                        <Upload size={32} color="#64748b" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>갤러리에서 선택</span>
                                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                    </label>
                                </div>

                                {/* Preview */}
                                {photoPreview && (
                                    <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <img src={photoPreview} alt="Ear preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem' }}>선택됨</div>
                                    </div>
                                )}
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
                            disabled={(currentStep === questions.length - 1 ? !earPhoto : !answers[currentStep]) || isSaving}
                            className="btn btn-primary"
                            style={{
                                opacity: (currentStep === questions.length - 1 ? !earPhoto : !answers[currentStep]) || isSaving ? 0.5 : 1,
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
