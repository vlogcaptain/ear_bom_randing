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
    Monitor,
    PhoneCall,
    PhoneOff,
    MoreHorizontal,
    MoreVertical
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
    const [analysisData, setAnalysisData] = useState({ score: 0, stress: '-' });
    const [reportLoading, setReportLoading] = useState(true);

    // Video & WebRTC States
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pcRef = useRef(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('offline'); // offline, ready, calling, connected
    const [currentTime, setCurrentTime] = useState('');

    const videoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const streamInitializedRef = useRef(false);

    // 실시간 시계
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 1. 유저 인증 및 데이터 로드
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            // 귀 분석 리포트 데이터
            const qSurvey = query(collection(db, 'surveys'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(1));
            const unsubSurvey = onSnapshot(qSurvey, (snapshot) => {
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    setLatestEarPhoto(data.earPhotoUrl);
                    if (data.analysisResult) {
                        setAnalysisData({
                            score: data.analysisResult.score || 0,
                            stress: data.analysisResult.stressLevel || '-'
                        });
                    }
                }
                setReportLoading(false);
            });

            // 실시간 채팅
            const qChat = query(collection(db, 'chats'), where('userId', '==', user.uid), orderBy('createdAt', 'asc'));
            const unsubChat = onSnapshot(qChat, (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(msgs);
            });

            // 카메라 초기화 (한 번만 실행)
            if (!streamInitializedRef.current) {
                initCamera();
                streamInitializedRef.current = true;
            }

            return () => {
                unsubSurvey();
                unsubChat();
            };
        }
    }, [user, loading]);

    // 2. 비디오 스트림 연결 보정 (srcObject 할당)
    useEffect(() => {
        if (localStream && videoRef.current) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const initCamera = async () => {
        try {
            console.log("Initializing camera...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setupWebRTC(stream);
        } catch (err) {
            console.error("Camera access error:", err);
            alert("카메라 권한이 필요합니다. 브라우저 설정을 확인해 주세요.");
        }
    };

    const setupWebRTC = async (stream) => {
        try {
            const pc = new RTCPeerConnection(servers);
            pcRef.current = pc;
            const remote = new MediaStream();
            setRemoteStream(remote);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach(track => remote.addTrack(track));
            };

            const callDoc = doc(db, 'calls', user.uid);
            const offerCandidates = collection(callDoc, 'offerCandidates');
            const answerCandidates = collection(callDoc, 'answerCandidates');

            pc.onicecandidate = (event) => {
                if (event.candidate) addDoc(answerCandidates, event.candidate.toJSON());
            };

            onSnapshot(callDoc, async (snapshot) => {
                const data = snapshot.data();
                if (!pc.currentRemoteDescription && data?.offer) {
                    setConnectionStatus('calling');
                    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answerDescription = await pc.createAnswer();
                    await pc.setLocalDescription(answerDescription);

                    await updateDoc(callDoc, { 
                        answer: { type: answerDescription.type, sdp: answerDescription.sdp } 
                    });

                    onSnapshot(offerCandidates, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                            }
                        });
                    });
                    setConnectionStatus('connected');
                }
            });

        } catch (err) {
            console.error("WebRTC Setup Error:", err);
        }
    };

    const handleLogout = async () => {
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        await logout();
        router.push('/login');
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;
        const text = inputMessage;
        setInputMessage('');
        await addDoc(collection(db, 'chats'), {
            userId: user.uid,
            text,
            sender: 'user',
            createdAt: serverTimestamp(),
        });
    };

    if (loading) return null;

    return (
        <div className="flex h-screen w-full flex-col bg-[#f8f7f6] overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-green-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center relative shadow-sm">
                            <Image src="/logo.png" alt="logo" width={52} height={52} className="invert brightness-0" />
                        </div>
                        <span className="text-2xl font-extrabold text-[#1B5E20]">earbom wellness</span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-500">
                        <Link className="hover:text-[#2E7D32] w-max whitespace-nowrap" href="/#concept">이침 원리</Link>
                        <Link className="hover:text-[#2E7D32] w-max whitespace-nowrap" href="/#how-it-works">사용방법</Link>
                        <Link className="hover:text-[#2E7D32] w-max whitespace-nowrap" href="/#features">주요기능</Link>
                        <Link className="hover:text-[#2E7D32] w-max whitespace-nowrap" href="/gallery">갤러리</Link>
                        <Link className="hover:text-[#2E7D32] w-max whitespace-nowrap" href="/dashboard">대시보드</Link>
                        <Link className="hover:text-[#2E7D32] w-max whitespace-nowrap" href="/appointment">상담예약</Link>
                        <Link className="text-[#2E7D32] font-semibold w-max whitespace-nowrap" href="/chat">실시간 상담</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-[#2E7D32]/10 rounded-full border border-[#2E7D32]/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
                            </span>
                            <span className="text-sm font-bold text-[#2E7D32]">{currentTime || '12:45'}</span>
                        </div>
                        <button onClick={handleLogout} className="bg-[#2E7D32] text-white px-4 h-10 rounded-lg text-sm font-bold hover:bg-[#286a2b]">로그아웃</button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 pt-24 p-4 gap-4 overflow-hidden">
                {/* Left: Video Area */}
                <div className="flex-1 flex flex-col gap-4 relative">
                    <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800">
                        {/* Remote Video */}
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        
                        {/* Connection Overlay */}
                        {connectionStatus !== 'connected' && (
                            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-8">
                                <div className="size-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                                    <PhoneCall size={32} className="text-[#2E7D32] animate-bounce" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">전문가가 상담방에 접근하고 있습니다</h3>
                                <p className="text-slate-400 text-sm">잠시만 대기해 주세요.</p>
                            </div>
                        )}

                        {/* Local PIP Video */}
                        <div className="absolute bottom-6 right-6 size-48 bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <div className="size-2 bg-[#2E7D32] rounded-full animate-pulse" />
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">{user?.displayName || '나'} (Live)</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10">
                            <button onClick={() => setIsMicOn(!isMicOn)} className={`size-12 rounded-xl flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button onClick={() => setIsVideoOn(!isVideoOn)} className={`size-12 rounded-xl flex items-center justify-center transition-all ${isVideoOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1" />
                            <button className="size-12 bg-white/10 text-white rounded-xl flex items-center justify-center"><Monitor size={20} /></button>
                            <button className="size-12 bg-white/10 text-white rounded-xl flex items-center justify-center"><MoreVertical size={20} /></button>
                            <div className="w-px h-6 bg-white/10 mx-1" />
                            <button onClick={() => router.push('/dashboard')} className="px-6 h-12 bg-red-500 text-white rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-red-500/20">
                                <PhoneOff size={18} />
                                <span>상담 종료</span>
                            </button>
                        </div>

                        {/* Expert Info Overlay */}
                        <div className="absolute top-6 right-6">
                            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 pr-6">
                                <div className="size-12 rounded-xl overflow-hidden relative border border-white/20">
                                    <Image src="/expert_baek.png" alt="Baek" fill className="object-cover" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">백정숙 수석지도사</p>
                                    <p className="text-white/50 text-[10px] uppercase font-black tracking-widest">Representative Physician</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar */}
                <aside className="w-96 flex flex-col gap-4">
                    {/* Report Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Activity size={20} className="text-[#2E7D32]" />
                                <h4 className="font-bold text-slate-800">Analysis Report</h4>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="size-28 bg-slate-50 rounded-2xl relative overflow-hidden border border-slate-100 shrink-0">
                                {latestEarPhoto ? <Image src={latestEarPhoto} alt="ear" fill className="object-cover" /> : <Camera size={24} className="opacity-10 absolute inset-0 m-auto" />}
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="p-3 bg-[#F1F8E9] rounded-xl border border-[#C8E6C9]">
                                    <p className="text-[10px] text-[#2E7D32] font-black uppercase mb-1">Score</p>
                                    <p className="text-2xl font-black text-[#1B5E20]">{analysisData.score}<span className="text-xs font-normal opacity-40 ml-1">/100</span></p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Stress</p>
                                    <p className="text-lg font-black text-slate-700">{analysisData.stress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat & Notes */}
                    <div className="flex-1 bg-white rounded-3xl flex flex-col border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex border-b border-slate-50">
                            <button onClick={() => setActiveTab('chat')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'chat' ? 'text-[#2E7D32] border-b-2 border-[#2E7D32]' : 'text-slate-300'}`}>채팅 & 처방</button>
                            <button onClick={() => setActiveTab('note')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab === 'note' ? 'text-[#2E7D32] border-b-2 border-[#2E7D32]' : 'text-slate-300'}`}>상담 노트</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {activeTab === 'chat' ? (
                                messages.map((m, i) => (
                                    <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-[#2E7D32] text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <textarea value={counselingNote} onChange={(e) => setCounselingNote(e.target.value)} placeholder="기록하세요..." className="w-full h-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed" />
                            )}
                        </div>

                        {activeTab === 'chat' && (
                            <form onSubmit={sendMessage} className="p-6 border-t border-slate-50 bg-slate-50/50">
                                <div className="relative">
                                    <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-4 pr-12 text-sm" placeholder="메시지 입력..." />
                                    <button type="submit" className="absolute right-1 top-1 size-10 bg-[#2E7D32] text-white rounded-lg flex items-center justify-center"><Send size={18} /></button>
                                </div>
                            </form>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}
