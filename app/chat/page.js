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
    PhoneCall,
    MapPin,
    CheckCircle2
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
    const [currentTime, setCurrentTime] = useState('');
    const [duration, setDuration] = useState('00:00');

    const videoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    // 실시간 시계 및 상담 경과 시간 타이머
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            setCurrentTime(timeStr);

            // 상담 진행 시간 계산
            const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const mins = Math.floor(diff / 60).toString().padStart(2, '0');
            const secs = (diff % 60).toString().padStart(2, '0');
            setDuration(`${mins}:${secs}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            // 1. 최신 귀 사진 로드 (실시간 연동)
            const fetchLatestSurvey = () => {
                const q = query(collection(db, 'surveys'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(1));
                return onSnapshot(q, (snapshot) => {
                    if (!snapshot.empty) {
                        const data = snapshot.docs[0].data();
                        setLatestEarPhoto(data.earPhotoUrl);
                        setLatestAcupoints(data.markedAcupoints || []);
                        if (data.analysisResult) {
                            setAnalysisData({
                                score: data.analysisResult.score || 0,
                                stress: data.analysisResult.stressLevel || '-'
                            });
                        }
                    }
                    setReportLoading(false);
                }, (err) => {
                    console.error("Survey Error:", err);
                    setReportError(true);
                    setReportLoading(false);
                });
            };

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
                // 카메라 트랙 종료 로직을 제거하여 재렌더링 시 깜빡임 방지
            };
        }
    }, [user, loading, router]);

    // Ensure local stream is bound to video element
    useEffect(() => {
        if (localStream && videoRef.current) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Ensure remote stream is bound to video element
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

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
                    };

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

                    onSnapshot(offerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                let data = change.doc.data();
                                peerConnection.addIceCandidate(new RTCIceCandidate(data));
                            }
                        });
                    });

                    setConnectionStatus('connected');
                }
            });

        } catch (err) {
            console.error("WebRTC Init Error:", err);
            // alert("카메라 및 마이크 권한이 필요합니다. 브라우저 설정을 확인해 주세요.");
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !user) return;

        const msg = inputMessage;
        setInputMessage('');

        try {
            await addDoc(collection(db, 'chats'), {
                userId: user.uid,
                text: msg,
                sender: 'user',
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Send Error:', error);
        }
    };

    const saveCounselingNote = async () => {
        if (!user) return;
        try {
            const docRef = await addDoc(collection(db, 'counseling_notes'), {
                userId: user.uid,
                content: counselingNote,
                createdAt: serverTimestamp(),
            });
            setNoteSavedId(docRef.id);
            alert('상담 노트가 저장되었습니다.');
        } catch (error) {
            console.error('Save Note Error:', error);
        }
    };

    if (loading) {
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
                            <Link className="hover:text-[#2E7D32] transition-colors w-max whitespace-nowrap" href="/#concept">이침 원리</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors w-max whitespace-nowrap" href="/#how-it-works">사용방법</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors w-max whitespace-nowrap" href="/#features">주요기능</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors w-max whitespace-nowrap" href="/gallery">갤러리</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors w-max whitespace-nowrap" href="/dashboard" target="_blank" rel="noopener noreferrer">대시보드</Link>
                            <Link className="hover:text-[#2E7D32] transition-colors w-max whitespace-nowrap" href="/appointment" target="_blank" rel="noopener noreferrer">상담예약</Link>
                            <Link className="text-[#2E7D32] font-semibold w-max whitespace-nowrap" href="/chat" target="_blank" rel="noopener noreferrer">실시간 상담</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-[#2E7D32]/10 rounded-full border border-[#2E7D32]/20 mr-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
                                </span>
                                <span className="text-sm font-bold text-[#2E7D32] tabular-nums">{currentTime || '12:45'}</span>
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
                                            Status: <span className="text-[#2E7D32] ml-1">{connectionStatus.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Floating Expert Profile Image (Always visible as reference) */}
                            <div className="absolute top-6 right-6 z-10 animate-in fade-in slide-in-from-right-4 duration-1000">
                                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-2.5 pr-6 rounded-2xl border border-white/10 shadow-2xl">
                                    <div className="size-12 rounded-xl overflow-hidden ring-2 ring-[#2E7D32]/30 shadow-lg relative">
                                        <Image
                                            src="/expert_baek.png"
                                            alt="Expert Baek"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-black text-sm tracking-tight">백정숙 수석지도사</span>
                                        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Representative Physician</span>
                                    </div>
                                </div>
                            </div>

                            {/* Local Video Preview (Picture in Picture) */}
                            <div className="absolute bottom-6 right-6 size-48 md:size-56 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 ring-4 ring-black/20 group/local">
                                <video 
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover mirror-mode"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/local:opacity-100 transition-opacity flex items-end p-3">
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="size-1.5 bg-[#2E7D32] rounded-full animate-pulse"></span>
                                        {user?.displayName || '백종우'} (Live)
                                    </p>
                                </div>
                            </div>

                            {/* WebRTC Controls Bar */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
                                <button 
                                    onClick={() => setIsMicOn(!isMicOn)}
                                    className={`size-12 rounded-xl flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/80 text-white animate-pulse'}`}
                                >
                                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                                <button 
                                    onClick={() => setIsVideoOn(!isVideoOn)}
                                    className={`size-12 rounded-xl flex items-center justify-center transition-all ${isVideoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/80 text-white animate-pulse'}`}
                                >
                                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                                </button>
                                <div className="w-px h-6 bg-white/10 mx-1"></div>
                                <button className="size-12 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                                    <Monitor size={20} />
                                </button>
                                <button className="size-12 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                                    <MoreHorizontal size={20} />
                                </button>
                                <div className="w-px h-6 bg-white/10 mx-1"></div>
                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className="px-6 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-2 font-black text-sm transition-all active:scale-95 shadow-lg shadow-red-500/20"
                                >
                                    <PhoneOff size={18} />
                                    <span>상담 종료</span>
                                </button>
                            </div>

                            {/* Top Left Indicators */}
                            <div className="absolute top-6 left-6 flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg flex items-center gap-2 border border-white/5">
                                    <Activity size={14} className="text-[#2E7D32]" />
                                    <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">1080p</span>
                                </div>
                                <div className="px-3 py-1.5 bg-[#2E7D32]/80 backdrop-blur-md rounded-lg flex items-center gap-2 border border-white/10 shadow-lg shadow-[#2E7D32]/20">
                                    <div className="size-1.5 bg-white rounded-full animate-pulse"></div>
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">연결됨</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Tab Interface (Chat & Notes & Analysis) */}
                    <aside className="w-[420px] flex flex-col gap-4">
                        {/* Summary Data Card (Static for Context) */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Activity size={20} className="text-[#2E7D32]" />
                                    <h4 className="font-black text-slate-800 tracking-tight">Ear bom Analysis Report</h4>
                                </div>
                                <button onClick={() => router.push('/dashboard')} className="text-[#2E7D32] text-[10px] font-bold uppercase tracking-widest hover:underline">상세보기</button>
                            </div>

                            <div className="flex gap-4 items-start mb-6">
                                <div className="relative size-36 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden group/img shrink-0">
                                    {latestEarPhoto ? (
                                        <Image
                                            src={latestEarPhoto}
                                            alt="Analyzed Ear"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                            <Camera size={32} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">분석된 귀 사진이 없습니다</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 rounded-md text-[8px] font-black text-[#2E7D32] uppercase border border-green-100">매우 건강</div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="p-3 bg-[#F1F8E9] rounded-2xl border border-[#C8E6C9]">
                                        <p className="text-[10px] text-[#2E7D32]/60 font-black uppercase tracking-widest mb-1">Health Score</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-[#1B5E20]">{analysisData.score}</span>
                                            <span className="text-xs font-bold text-[#1B5E20]/40">/100</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Stress Level</p>
                                        <span className="text-lg font-black text-slate-700">{analysisData.stress}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Tabs */}
                        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="flex border-b border-slate-50">
                                <button 
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'text-[#2E7D32] border-b-2 border-[#2E7D32] bg-[#F1F8E9]/30' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    채팅 & 처방
                                </button>
                                <button 
                                    onClick={() => setActiveTab('note')}
                                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'note' ? 'text-[#2E7D32] border-b-2 border-[#2E7D32] bg-[#F1F8E9]/30' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    상담 노트
                                </button>
                            </div>

                            <div className="flex-1 relative overflow-hidden flex flex-col">
                                {activeTab === 'chat' ? (
                                    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                                        <div className="flex-1 space-y-6">
                                            {messages.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                                    <MessageSquare size={48} className="mb-4" />
                                                    <p className="font-bold text-sm">대화 내용이 없습니다</p>
                                                </div>
                                            ) : (
                                                messages.map((msg, idx) => (
                                                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-[#2E7D32] text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200'}`}>
                                                            {msg.text}
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-300 mt-1.5 uppercase tracking-tighter">
                                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <ClipboardList size={14} className="text-[#2E7D32]" />
                                                Counseling Notes
                                            </h5>
                                            <button 
                                                onClick={saveCounselingNote}
                                                className="text-[10px] font-black text-white bg-[#2E7D32] px-3 py-1 rounded-lg hover:bg-[#286a2b] transition-all"
                                            >
                                                저장하기
                                            </button>
                                        </div>
                                        <textarea
                                            value={counselingNote}
                                            onChange={(e) => setCounselingNote(e.target.value)}
                                            placeholder="상담 내용을 자유롭게 기록하세요..."
                                            className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-[#2E7D32]/10 focus:border-[#2E7D32] transition-all resize-none font-medium leading-relaxed"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Message Input (Only for Chat Tab) */}
                            <div className={`p-6 border-t border-slate-50 bg-slate-50/50 transition-all ${activeTab !== 'chat' ? 'opacity-50 pointer-events-none' : ''}`}>
                                <form onSubmit={sendMessage} className="relative flex items-center">
                                    <input 
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="메시지를 입력하세요..."
                                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-5 pr-14 text-sm font-medium focus:ring-4 focus:ring-[#2E7D32]/5 focus:border-[#2E7D32] transition-all placeholder-slate-300 shadow-sm"
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
