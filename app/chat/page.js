'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    updateDoc,
    serverTimestamp,
    getDocs
} from 'firebase/firestore';
import { 
    LogOut, 
    User, 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    MessageSquare, 
    Send, 
    Camera, 
    ClipboardList, 
    Activity, 
    Info,
    Monitor,
    X,
    PhoneCall
} from 'lucide-react';

const servers = {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
            ],
        },
    ],
    iceCandidatePoolSize: 10,
};

export default function ChatPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    // UI States
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'note'
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [counselingNote, setCounselingNote] = useState('');
    const [latestEarPhoto, setLatestEarPhoto] = useState(null);
    const [latestAcupoints, setLatestAcupoints] = useState([]);
    const [analysisData, setAnalysisData] = useState({ score: 0, stress: '-' });
    const [noteSavedId, setNoteSavedId] = useState(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [reportError, setReportError] = useState(false);

    // Video & WebRTC States
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [pc, setPc] = useState(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('offline'); // offline, ready, calling, connected

    const videoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            // 1. 최신 귀 사진 로드 (실시간 연동)
            const unsubscribeSurvey = fetchLatestSurvey();

            // 2. 실시간 채팅 리스너 설정 (인덱스 미준비 시 폴백 로직 포함)
            const startChatListener = (useOrderBy = true) => {
                const baseQ = collection(db, 'chats');
                const constraints = [where('userId', '==', user.uid)];
                if (useOrderBy) constraints.push(orderBy('createdAt', 'desc'));

                const q = query(baseQ, ...constraints);

                return onSnapshot(q, (snapshot) => {
                    const msgs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    // desc 쿼리일 경우 UI 정렬을 위해 reverse, 아닐 경우(폴백) 시간순 정렬 시도
                    const sortedMsgs = useOrderBy ? msgs.reverse() : msgs.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
                    setMessages(sortedMsgs);
                }, (error) => {
                    console.warn(`Chat listener error (useOrderBy=${useOrderBy}):`, error.message);
                    if (useOrderBy && (error.code === 'failed-precondition' || error.message.includes('index'))) {
                        console.info("Attempting fallback chat query without orderBy...");
                        unsubscribe();
                        unsubscribe = startChatListener(false);
                    }
                });
            };

            let unsubscribe = startChatListener(true);

            // 3. 카메라 및 WebRTC 초기화
            initUserWebRTC();

            return () => {
                if (unsubscribeSurvey) unsubscribeSurvey();
                unsubscribe();
                if (localStream) {
                    localStream.getTracks().forEach(track => track.stop());
                }
            };
        }
    }, [user, loading, router]);

    const initUserWebRTC = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const remote = new MediaStream();
            
            setLocalStream(stream);
            setRemoteStream(remote);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Signaling listener
            const callDoc = doc(db, 'calls', user.uid);
            const offerCandidates = collection(callDoc, 'offerCandidates');
            const answerCandidates = collection(callDoc, 'answerCandidates');

            onSnapshot(callDoc, async (snapshot) => {
                const data = snapshot.data();
                if (!pc && data?.offer) {
                    const peerConnection = new RTCPeerConnection(servers);
                    setPc(peerConnection);
                    setConnectionStatus('calling');

                    stream.getTracks().forEach((track) => {
                        peerConnection.addTrack(track, stream);
                    });

                    peerConnection.ontrack = (event) => {
                        event.streams[0].getTracks().forEach((track) => {
                            remote.addTrack(track);
                        });
                        setConnectionStatus('connected');
                    };

                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remote;
                    }

                    peerConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            addDoc(answerCandidates, event.candidate.toJSON());
                        }
                    };

                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answerDescription = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answerDescription);

                    const answer = {
                        type: answerDescription.type,
                        sdp: answerDescription.sdp,
                    };

                    await updateDoc(callDoc, { answer });

                    // Listen for remote ICE candidates
                    onSnapshot(offerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                let data = change.doc.data();
                                peerConnection.addIceCandidate(new RTCIceCandidate(data));
                            }
                        });
                    });
                }
                
                if (pc && !data?.offer) {
                    // Call ended by expert
                    setConnectionStatus('offline');
                    pc.close();
                    setPc(null);
                }
            });

        } catch (err) {
            console.error("WebRTC Init error:", err);
        }
    };

    const fetchLatestSurvey = () => {
        setReportLoading(true);
        setReportError(false);
        try {
            const q = query(
                collection(db, 'surveys'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            
            // 실시간 리스너로 변경 (전문가가 마킹 저장 시 즉시 반영)
            return onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    setLatestEarPhoto(data.earPhotoUrl);
                    setLatestAcupoints(data.markedAcupoints || []);

                    if (data.answers) {
                        calculateAnalysis(data.answers);
                    }
                }
                setReportLoading(false);
            }, (err) => {
                console.warn("Survey data load error:", err.message);
                setReportError(true);
                setReportLoading(false);
            });
        } catch (err) {
            console.error("fetchLatestSurvey setup error:", err);
            setReportLoading(false);
        }
    };

    const calculateAnalysis = (answers) => {
        let score = 95; // 기본 점수
        let stressPoints = 0;

        // 설문 답변 분석 (샘플 로직)
        Object.values(answers).forEach(val => {
            const answer = val.toLowerCase();
            if (answer.includes('매우') || answer.includes('자주')) {
                score -= 5;
                stressPoints += 2;
            } else if (answer.includes('가끔') || answer.includes('있다')) {
                score -= 2;
                stressPoints += 1;
            }
        });

        const stressLevel = stressPoints > 10 ? 'High' : stressPoints > 5 ? 'Medium' : 'Low';
        setAnalysisData({
            score: Math.max(score, 60), // 최소 60점 보장
            stress: stressLevel
        });
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const saveNote = async () => {
        if (!counselingNote.trim()) return;
        try {
            await addDoc(collection(db, 'notes'), {
                userId: user.uid,
                text: counselingNote,
                createdAt: serverTimestamp()
            });
            setNoteSavedId(Date.now());
            setTimeout(() => setNoteSavedId(null), 3000);
        } catch (err) {
            console.error("Error saving note:", err);
        }
    };

    const handleGlobalInput = async (e) => {
        if (e) e.preventDefault();
        if (!inputMessage.trim()) return;

        if (activeTab === 'chat') {
            try {
                await addDoc(collection(db, 'chats'), {
                    userId: user.uid,
                    text: inputMessage,
                    sender: 'user',
                    createdAt: serverTimestamp()
                });
                setInputMessage('');
            } catch (err) {
                console.error("Error sending message:", err);
            }
        } else {
            // 상담 노트 탭일 경우: 텍스트 박스에 추가
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newNote = counselingNote
                ? `${counselingNote}\n[${timestamp}] ${inputMessage}`
                : `[${timestamp}] ${inputMessage}`;

            setCounselingNote(newNote);
            setInputMessage('');
            // 시각적 피드백: 저장 버튼 강조 등은 생략하고 즉시 반영
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6]">
                <div className="w-12 h-12 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f8f7f6] font-sans text-slate-900 overflow-x-hidden h-screen">
            <div className="layout-container flex h-full grow flex-col overflow-hidden">
                {/* Navigation - Synced with Dashboard & Appointment */}
                <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-green-100">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center relative overflow-hidden p-1.5 shadow-sm">
                                    <Image
                                        src="/logo.png"
                                        alt="ear bom healthy logo"
                                        width={40}
                                        height={40}
                                        className="object-contain invert brightness-0"
                                    />
                                </div>
                                <span className="text-2xl font-extrabold tracking-tight text-[#1B5E20]">ear bom healthy</span>
                            </Link>
                        </div>
                        <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-500 mr-8">
                            <Link className="hover:text-[#2E7D32] transition-colors" href="/#concept">이침 원리</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors" href="/#how-it-works">사용방법</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors" href="/#features">주요기능</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors" href="/gallery">갤러리</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors" href="/dashboard" target="_blank" rel="noopener noreferrer">대시보드</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors" href="/appointment" target="_blank" rel="noopener noreferrer">상담예약</Link>
                            <Link className="text-[#2E7D32] font-semibold" href="/chat" target="_blank" rel="noopener noreferrer">실시간 상담</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-[#2E7D32]/10 rounded-full border border-[#2E7D32]/20 mr-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
                                </span>
                                <span className="text-sm font-bold text-[#2E7D32] tabular-nums">12:45</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#2E7D32] text-white text-sm font-bold hover:bg-[#286a2b] transition-all"
                            >
                                <span className="truncate">로그아웃</span>
                            </button>
                            <div className="w-10 h-10 bg-[#E8F5E9] rounded-full flex items-center justify-center text-[#2E7D32] border border-[#C8E6C9]">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex flex-1 overflow-hidden p-4 gap-4 pt-24">
                    {/* Left Side: Video Feed */}
                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                        <div className="relative flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl group border border-slate-800">
                            {/* Expert Video Stream */}
                            <video 
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />

                            {/* Expert Video Placeholder (Overlayed when disconnected) */}
                            {connectionStatus !== 'connected' && (
                                <div className="absolute inset-0 bg-[#1e293b] flex flex-col items-center justify-center p-8 text-center transition-opacity duration-500">
                                    <div className="size-24 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-white/5">
                                        <PhoneCall size={40} className="text-[#2E7D32] animate-bounce" />
                                    </div>
                                    <h3 className="text-white font-black text-xl mb-2">전문가가 상담방에 접근하고 있습니다</h3>
                                    <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                                        상담이 시작되면 전문가의 영상이 이곳에 자동으로 표시됩니다. 잠시만 대기해 주세요.
                                    </p>
                                    
                                    <div className="absolute bottom-10 left-10 flex gap-4">
                                        <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white/50 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                            {connectionStatus === 'calling' ? 'Signal Incoming...' : 'Waiting for Expert...'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

                            {/* Overlay Info */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white text-xs font-medium flex items-center gap-2 border border-white/10">
                                    <span className="material-symbols-outlined text-sm">hd</span> 1080p
                                </span>
                                <span className="px-3 py-1 bg-[#2E7D32]/80 backdrop-blur-md rounded-lg text-white text-xs font-medium flex items-center gap-2 border border-white/10">
                                    <span className="material-symbols-outlined text-sm">wifi</span> 연결됨
                                </span>
                            </div>

                            {/* Expert Identity */}
                            <div className="absolute top-4 right-4 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">김이침 한의사</p>
                                    <p className="text-[10px] text-[#FFD54F] font-bold uppercase tracking-wider">Expert Physician</p>
                                </div>
                                <div className="size-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-[#2E7D32]/50">
                                    <img
                                        className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-Ji_JxRlpKIfnabmyC3E1yU85m2aWDSO6vZ0pQWKk6KDOABmyINQiRWdsfUafm7vfYRIV-V7AdI1kbIMNbJ-Ns0uzql9lGIoAhzQRtDAeL41yJXursQJej8kgLalO9XOhRZe7DX9sQ9TdIlvCupUyqR5645LipJW5jRD2fkErFWEAIZryXYsgymB2JhsA0__3PibiD3VpmBNgm-hPTrdup5qwPY3mqXIrGsdOf0l90HekXpoLhqeJsgz09QvZ0RQMdbMU7vqYsjUr"
                                        alt="Doctor Portrait"
                                    />
                                </div>
                            </div>

                            {/* Self Video (PIP) */}
                            <div className="absolute bottom-6 right-6 w-48 md:w-64 aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl ring-4 ring-black/20 hover:scale-105 transition-transform duration-300">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded-md text-[10px] text-white backdrop-blur-sm font-bold">
                                    {user.displayName || '나'} (Live)
                                </div>
                            </div>

                            {/* Call Controls */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                                <button 
                                    onClick={() => setIsMicOn(!isMicOn)}
                                    className={`size-12 rounded-full flex items-center justify-center transition-all group ${isMicOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                                >
                                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                                <button 
                                    onClick={() => setIsVideoOn(!isVideoOn)}
                                    className={`size-12 rounded-full flex items-center justify-center transition-all group ${isVideoOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                                >
                                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                                </button>
                                <button className="size-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all group">
                                    <Monitor size={20} />
                                </button>
                                <button className="size-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all group">
                                    <span className="material-symbols-outlined group-active:scale-90 transition-transform">more_horiz</span>
                                </button>
                                <div className="w-px h-8 bg-white/20 mx-2"></div>
                                <button className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black flex items-center gap-2 transition-all shadow-lg active:scale-95">
                                    <span className="material-symbols-outlined">call_end</span>
                                    상담 종료
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Sidebar */}
                    <aside className="w-[400px] flex flex-col gap-4 shrink-0 overflow-y-auto no-scrollbar pb-4">
                        {/* AI Ear Analysis Report */}
                        <div className="bg-white rounded-2xl border border-[#2E7D32]/10 shadow-sm flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-[#E8F5E9]/30">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#2E7D32] font-bold">analytics</span>
                                    <h3 className="font-black text-slate-800">Ear bom Analysis Report</h3>
                                </div>
                                <button className="text-[#2E7D32] text-xs font-bold hover:underline">상세보기</button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="relative aspect-square bg-[#f8fcf8] rounded-xl overflow-hidden border border-slate-100 group cursor-crosshair">
                                    {latestEarPhoto ? (
                                        <img
                                            className="w-full h-full object-cover"
                                            src={latestEarPhoto}
                                            alt="Ear Analysis Scan"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                            <Camera size={48} className="mb-2 opacity-20" />
                                            <p className="text-xs font-bold">분석된 귀 사진이 없습니다</p>
                                        </div>
                                    )}
                                    {/* Real-time Markers */}
                                    {latestAcupoints?.map((point, idx) => (
                                        <div 
                                            key={idx}
                                            className="absolute -translate-x-1/2 -translate-y-1/2"
                                            style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                        >
                                            <div className="relative group/pin">
                                                <div className="absolute -inset-2 bg-[#2E7D32]/20 rounded-full animate-pulse"></div>
                                                <div className="size-3 bg-[#2E7D32] border-2 border-white rounded-full shadow-lg transition-transform hover:scale-150"></div>
                                                <div className="absolute left-5 top-0 bg-white shadow-xl border border-[#E8F5E9] px-2 py-1 rounded-lg text-[10px] whitespace-nowrap font-black text-[#2E7D32] opacity-100 group-hover/pin:scale-110 transition-transform">
                                                    {point.label}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="absolute top-3 right-3">
                                        <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md text-[10px] font-black text-[#2E7D32] border border-[#E8F5E9]">매우 건강</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-[#E8F5E9]/20 rounded-2xl border border-[#2E7D32]/5">
                                        <p className="text-[10px] font-bold text-[#2E7D32]/60 uppercase tracking-widest mb-1">신체 컨디션</p>
                                        <p className="text-2xl font-black text-[#2E7D32]">{analysisData.score}%</p>
                                    </div>
                                    <div className="p-4 bg-[#E8F5E9]/20 rounded-2xl border border-[#2E7D32]/5">
                                        <p className="text-[10px] font-bold text-[#2E7D32]/60 uppercase tracking-widest mb-1">스트레스 지수</p>
                                        <p className="text-2xl font-black text-[#2E7D32]">{analysisData.stress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat & Notes Section */}
                        <div className="bg-white rounded-2xl border border-[#2E7D32]/10 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
                            <div className="flex border-b border-slate-50 bg-[#fcfdfc]">
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'chat' ? 'border-b-2 border-[#2E7D32] text-[#2E7D32]' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    채팅 & 처방
                                </button>
                                <button
                                    onClick={() => setActiveTab('note')}
                                    className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'note' ? 'border-b-2 border-[#2E7D32] text-[#2E7D32]' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    상담 노트
                                </button>
                            </div>

                            <div className="flex-1 p-5 space-y-6 overflow-y-auto scrollbar-hide">
                                {activeTab === 'chat' ? (
                                    <>
                                        {messages.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                                                <MessageSquare size={32} />
                                                <p className="text-xs font-bold">대화 내용이 없습니다</p>
                                            </div>
                                        )}
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                                {msg.sender === 'expert' && (
                                                    <div className="size-8 rounded-xl bg-[#E8F5E9] flex items-center justify-center shrink-0 border border-[#2E7D32]/10 shadow-sm">
                                                        <span className="material-symbols-outlined text-[#2E7D32] text-lg">support_agent</span>
                                                    </div>
                                                )}
                                                <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'max-w-[85%]'}`}>
                                                    {msg.type === 'prescription' ? (
                                                        /* Digital Prescription Card */
                                                        <div className={`bg-[#2E7D32] rounded-2xl p-5 shadow-lg shadow-[#2E7D32]/10 relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95 cursor-pointer`}>
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                                                <div className="size-8 bg-white/20 rounded-lg flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-white text-lg">medical_services</span>
                                                                </div>
                                                                <p className="text-sm font-black text-white tracking-tight">디지털 이침 처방</p>
                                                            </div>
                                                            <p className="text-xs text-white/90 leading-relaxed mb-4 relative z-10 font-medium">
                                                                {msg.text}
                                                            </p>
                                                            <button
                                                                onClick={() => {
                                                                    alert('처방전이 내 지갑에 저장되었습니다!');
                                                                }}
                                                                className="w-full py-2.5 bg-[#FFD54F] hover:bg-[#ffca28] rounded-xl text-[#1B5E20] text-xs font-black transition-all shadow-md active:scale-95 relative z-10"
                                                            >
                                                                처방전 저장하기
                                                            </button>
                                                        </div>
                                                    ) : msg.type === 'guide' ? (
                                                        /* Visual Guide Card */
                                                        <div className="bg-white rounded-2xl border border-[#2E7D32]/20 shadow-xl overflow-hidden group/guide">
                                                            <div className="p-3 bg-[#E8F5E9]/50 border-b border-[#2E7D32]/10 flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="size-6 bg-[#2E7D32] rounded flex items-center justify-center">
                                                                        <span className="material-symbols-outlined text-white text-[14px]">map</span>
                                                                    </div>
                                                                    <p className="text-[11px] font-black text-[#1B5E20]">전문가 맞춤 혈자리 가이드</p>
                                                                </div>
                                                            </div>
                                                            <div className="relative aspect-square sm:aspect-auto sm:h-[300px] w-full bg-slate-100 flex items-center justify-center">
                                                                <img 
                                                                    src={msg.earPhotoUrl} 
                                                                    alt="Ear Guide" 
                                                                    className="max-w-full max-h-full object-contain"
                                                                />
                                                                {/* Markers Overlay */}
                                                                {msg.markers?.map((marker, idx) => (
                                                                    <div 
                                                                        key={idx}
                                                                        className="absolute -translate-x-1/2 -translate-y-1/2 group/pin"
                                                                        style={{ top: `${marker.y}%`, left: `${marker.x}%` }}
                                                                    >
                                                                        <div className="relative">
                                                                            <div className="size-4 bg-[#2E7D32] border-2 border-white rounded-full shadow-lg group-hover/pin:scale-125 transition-transform"></div>
                                                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm shadow-xl border border-[#E8F5E9] px-2 py-1 rounded-lg text-[10px] whitespace-nowrap font-black text-[#2E7D32] opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                                                                                {marker.label}
                                                                            </div>
                                                                            {/* Always show label on mobile/small cards */}
                                                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-white whitespace-nowrap font-bold">
                                                                                {marker.label}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="p-3 bg-slate-50">
                                                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">상담 중 전문가가 직접 표시한 혈자리 정보입니다. 지압판을 해당 위치에 정확히 부탁하여 자극해 주세요.</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${msg.sender === 'user'
                                                            ? 'bg-[#2E7D32] text-white rounded-tr-none shadow-lg shadow-[#2E7D32]/5 border-[#2E7D32]'
                                                            : 'bg-[#f8fcf8] text-slate-700 rounded-tl-none border-[#E8F5E9]'
                                                            }`}>
                                                            {msg.text}
                                                        </div>
                                                    )}
                                                    <span className="text-[10px] text-slate-300 font-bold">
                                                        {msg.createdAt?.toDate?.() ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col gap-4">
                                        <div className="flex items-center gap-2 text-[#2E7D32] mb-2">
                                            <ClipboardList size={18} />
                                            <span className="text-sm font-black uppercase tracking-wider">상담 기록 메모</span>
                                        </div>
                                        <textarea
                                            value={counselingNote}
                                            onChange={(e) => setCounselingNote(e.target.value)}
                                            placeholder="상담 중 중요한 내용을 기록하세요..."
                                            className="flex-1 w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#2E7D32]/10 transition-all font-medium text-sm text-slate-700 resize-none"
                                        />
                                        <button
                                            onClick={saveNote}
                                            className={`w-full py-3 rounded-xl font-black text-sm transition-all ${noteSavedId ? 'bg-[#2E7D32] text-white' : 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]'}`}
                                        >
                                            {noteSavedId ? '저장 완료!' : '노트 저장하기'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-slate-50 bg-[#fcfdfc]">
                                <form onSubmit={handleGlobalInput} className="relative flex items-center">
                                    <input
                                        className="w-full pl-5 pr-14 py-3.5 bg-white border border-[#2E7D32]/10 rounded-2xl text-sm focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] outline-none transition-all placeholder:text-slate-300 font-medium shadow-inner"
                                        placeholder={activeTab === 'chat' ? "메시지를 입력하세요..." : "노트에 기록하세요..."}
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 size-10 bg-[#2E7D32] text-white rounded-xl shadow-md flex items-center justify-center hover:bg-[#286a2b] transition-all group active:scale-90"
                                    >
                                        <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </aside>
                </main>

                {/* Footer - Shared (Minimal for Chat App) */}
                <footer className="shrink-0 text-center text-slate-400 text-[10px] py-4 bg-white border-t border-slate-100 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                        <p className="font-bold">© 2026 ear bom healthy. All rights reserved.</p>
                        <p className="max-w-2xl leading-relaxed hidden md:block opacity-60">
                            본 리포트는 이침 전문가가 회원에게 제공받은 귀 사진을 기반으로 한 분석 데이터의 결과이며, 의학적 진단을 대신할 수 없습니다.
                        </p>
                        <div className="flex gap-4 font-black">
                            <span className="hover:text-[#2E7D32] cursor-pointer">이용약관</span>
                            <span className="hover:text-[#2E7D32] cursor-pointer">개인정보처리방침</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
