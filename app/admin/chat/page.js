'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { db, auth } from '@/lib/firebase';
import {
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
    ChevronLeft, 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    MessageSquare, 
    Send, 
    Camera, 
    ClipboardList, 
    Activity, 
    User,
    LogOut,
    CheckCircle2,
    MapPin,
    Monitor
} from 'lucide-react';
import MarkingModal from '@/components/MarkingModal';

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

function AdminChatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');

    const [userProfile, setUserProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [latestEarPhoto, setLatestEarPhoto] = useState(null);
    const [latestAcupoints, setLatestAcupoints] = useState([]);
    const [analysisData, setAnalysisData] = useState({ score: 0, stress: '-' });
    const [latestSurveyId, setLatestSurveyId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // WebRTC States
    const [pc, setPc] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, calling, connected
    const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!userId) {
            router.push('/admin');
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (admin) => {
            if (!admin) {
                router.push('/admin/login');
                return;
            }
            if (admin.email !== 'js100216@naver.com') {
                router.push('/admin/login');
                return;
            }
            
            initExpertSession();
        });

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const initExpertSession = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // 1. 회원 정보 가져오기
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
            }

            // 2. 최신 분석 리포트 가져오기 (사진이 있는 최신본 찾기)
            let surveysSnapshot;
            const fetchSurveys = async (idToUse) => {
                const q = query(
                    collection(db, 'surveys'),
                    where('userId', '==', idToUse),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );
                return await getDocs(q);
            };

            surveysSnapshot = await fetchSurveys(userId);
            
            // 만약 검색 결과가 없고, 유저 프로필에 다른 uid가 있다면 해당 uid로 재검색
            if (surveysSnapshot.empty && userProfile?.uid && userProfile.uid !== userId) {
                console.log('[DEBUG] Retrying survey fetch with actual UID:', userProfile.uid);
                surveysSnapshot = await fetchSurveys(userProfile.uid);
            }
            
            if (!surveysSnapshot.empty) {
                // 사진이 있는 가장 최근 설문을 찾음
                const surveyWithPhoto = surveysSnapshot.docs.find(doc => {
                    const data = doc.data();
                    return data.earPhotoUrl || data.photoUrl;
                });

                if (surveyWithPhoto) {
                    const data = surveyWithPhoto.data();
                    const photoUrl = data.earPhotoUrl || data.photoUrl;
                    setLatestEarPhoto(photoUrl);
                    console.log('[DEBUG] latestEarPhoto loaded from survey:', surveyWithPhoto.id, photoUrl);
                } else {
                    // 사진은 없지만 설문은 있는 경우 첫 번째 설문의 데이터를 분석 데이터로 사용
                    setLatestEarPhoto(null);
                    console.warn('[DEBUG] No survey with photo found for userId:', userId);
                }

                // 분석 데이터는 항상 검색된 설문 중 가장 최근 것을 사용
                const latestData = surveysSnapshot.docs[0].data();
                setLatestSurveyId(surveysSnapshot.docs[0].id);
                setAnalysisData({
                    score: latestData.score || 0,
                    stress: latestData.stressLevel || latestData.stress || '-'
                });
                setLatestAcupoints(latestData.markedAcupoints || []);
            } else {
                console.warn('[DEBUG] No survey found for userId/uid:', userId);
                setLatestEarPhoto(null);
            }

            // 3. 채팅 리스너 시작
            const chatQ = query(
                collection(db, 'chats'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            onSnapshot(chatQ, (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(msgs.reverse());
            });

            // 4. 카메라 초기화
            await setupWebRTC();

        } catch (error) {
            console.error("Error initializing expert session:", error);
        } finally {
            setLoading(false);
        }
    };

    const setupWebRTC = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const remote = new MediaStream();
            
            setLocalStream(stream);
            setRemoteStream(remote);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remote;
            }
        } catch (err) {
            console.error("Media access error:", err);
        }
    };

    const startCall = async () => {
        const peerConnection = new RTCPeerConnection(servers);
        setPc(peerConnection);
        setConnectionStatus('calling');

        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };

        // Signaling docs
        const callDoc = doc(db, 'calls', userId);
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                addDoc(offerCandidates, event.candidate.toJSON());
            }
        };

        const offerDescription = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
            expertEmail: auth.currentUser.email,
            status: 'active',
            createdAt: serverTimestamp()
        };

        await setDoc(callDoc, { offer });

        // Listen for remote answer
        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                peerConnection.setRemoteDescription(answerDescription);
                setConnectionStatus('connected');
            }
        });

        // Listen for remote ICE candidates
        onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    peerConnection.addIceCandidate(candidate);
                }
            });
        });
    };

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputMessage.trim()) return;

        try {
            await addDoc(collection(db, 'chats'), {
                userId: userId,
                text: inputMessage,
                sender: 'expert',
                createdAt: serverTimestamp()
            });
            setInputMessage('');
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const sendPrescription = async () => {
        const text = prompt('회원님께 보낼 처방 내용을 입력하세요:');
        if (!text) return;

        try {
            await addDoc(collection(db, 'chats'), {
                userId: userId,
                text: text,
                sender: 'expert',
                type: 'prescription',
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error sending prescription:", err);
        }
    };

    const handleSaveGuide = async (markers) => {
        setIsMarkingModalOpen(false);
        try {
            // 1. 채팅창에 가이드 전송
            await addDoc(collection(db, 'chats'), {
                userId: userId,
                sender: 'expert',
                type: 'guide',
                earPhotoUrl: latestEarPhoto || '',
                markers: markers,
                createdAt: serverTimestamp()
            });

            // 2. 최신 설문 데이터에도 마킹 정보 업데이트 (사이드바 리포트 연동)
            if (latestSurveyId) {
                const surveyRef = doc(db, 'surveys', latestSurveyId);
                await setDoc(surveyRef, {
                    markedAcupoints: markers
                }, { merge: true });
            }

            // 3. 로컬 상태 업데이트
            setLatestAcupoints(markers);
            alert('가이드가 환자에게 전송되었습니다.');
        } catch (error) {
            console.error("Error sending guide:", error);
            alert('가이드 전송 중 오류가 발생했습니다.');
        }
    };

    const endCall = async () => {
        if (pc) {
            pc.close();
            setPc(null);
        }
        setConnectionStatus('disconnected');
        await deleteDoc(doc(db, 'calls', userId));
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-black text-lg">상담방 설정 중...</p>
        </div>
    );

    return (
        <div className="h-screen bg-[#17171A] flex flex-col overflow-hidden text-slate-200">
            {/* Expert Chat Header */}
            <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#1A1A1E] shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/admin')}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/20">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white">{userProfile?.displayName || '이름 없음'}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{connectionStatus === 'connected' ? 'Connected' : 'Consulting Room'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/5">
                        <div className={`size-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {connectionStatus === 'connected' ? 'LIVE' : connectionStatus === 'calling' ? 'CALLING...' : 'STANDBY'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden p-2 md:p-4 gap-2 md:gap-4">
                {/* Left Side: Video Console */}
                <div className="w-full md:flex-1 flex flex-col gap-4 min-w-0 h-[400px] md:h-full shrink-0">
                    <div className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
                        {/* Remote Video (User) */}
                        <video 
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Placeholder if no remote stream */}
                        {connectionStatus !== 'connected' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                                <User size={80} className="text-slate-800 mb-4" />
                                <p className="text-slate-500 font-bold text-sm">대기 중입니다...</p>
                                {connectionStatus === 'disconnected' && (
                                    <button 
                                        onClick={startCall}
                                        className="mt-6 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black shadow-xl transition-all hover:scale-105 active:scale-95"
                                    >
                                        상담 화상 연결하기
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                        {/* User Identity Overlay */}
                        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                            <div className="size-10 rounded-full bg-slate-800 overflow-hidden border-2 border-slate-700">
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-black">
                                    {userProfile?.displayName?.substring(0, 1) || 'U'}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{userProfile?.displayName}</p>
                                <p className="text-[10px] text-green-400 font-black uppercase tracking-wider">Patient</p>
                            </div>
                        </div>

                        {/* Self Video (Expert PIP) */}
                        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-32 md:w-48 aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300">
                            <video 
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded-md text-[10px] text-white backdrop-blur-sm font-bold border border-white/10">
                                EXPERT (ME)
                            </div>
                        </div>

                        {/* In-Call Controls */}
                        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 px-4 md:px-8 py-3 md:py-5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl">
                            <button 
                                onClick={() => setIsMicOn(!isMicOn)}
                                className={`size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                            >
                                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                            </button>
                            <button 
                                onClick={() => setIsVideoOn(!isVideoOn)}
                                className={`size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isVideoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                            >
                                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                            </button>
                            <button className="hidden sm:flex size-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all">
                                <Monitor size={20} />
                            </button>
                            <div className="w-[1px] h-6 md:h-8 bg-white/10 mx-1 md:mx-2"></div>
                            <button 
                                onClick={endCall}
                                className="px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs md:text-sm flex items-center gap-2 md:gap-3 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                            >
                                <LogOut size={18} />
                                <span className="whitespace-nowrap">상담 종료</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Information Console */}
                <aside className="w-full md:w-[450px] flex flex-col gap-4 shrink-0 overflow-hidden min-h-[500px] md:min-h-0">
                    {/* User Profile & Analysis */}
                    <div className="bg-[#1A1A1E] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Activity size={16} className="text-green-500" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ear Analysis Report</h3>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-black rounded-2xl border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => setIsMarkingModalOpen(true)}>
                                {latestEarPhoto ? (
                                    <div className="relative w-full h-full">
                                        <img 
                                            src={latestEarPhoto} 
                                            alt="Latest Ear" 
                                            className="w-full h-full object-cover" 
                                        />
                                        {latestAcupoints?.map((point, idx) => (
                                            <div 
                                                key={idx}
                                                className="absolute w-2 h-2 bg-red-500 border border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm animate-pulse"
                                                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                            >
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded-md whitespace-nowrap font-black">
                                                    {point.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-white/5 gap-2">
                                        <Camera size={24} />
                                        <span className="text-[10px] font-black uppercase opacity-50">No Photo</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-md shadow-lg z-10">Latest Scan</div>
                                <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-colors flex items-center justify-center">
                                    <Activity size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="space-y-3 flex flex-col justify-center">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">상태 점수</p>
                                    <p className="text-3xl font-black text-green-500">{analysisData.score}점</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">스트레스 지수</p>
                                    <p className="text-2xl font-black text-white">{analysisData.stress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat & Notes Center */}
                    <div className="bg-[#1A1A1E] rounded-3xl border border-white/5 flex-1 flex flex-col overflow-hidden">
                        <div className="flex bg-white/5 border-b border-white/5">
                            <button className="flex-1 py-4 text-xs font-black text-green-500 border-b-2 border-green-500 tracking-widest uppercase">
                                Real-time Consultation
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'expert' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                                        msg.type === 'prescription' 
                                        ? 'bg-blue-600 text-white font-bold border-2 border-white/20 shadow-xl' 
                                        : msg.sender === 'expert'
                                        ? 'bg-white/10 text-white rounded-tr-none border border-white/10'
                                        : 'bg-green-600 text-white rounded-tl-none border border-green-500 shadow-lg shadow-green-500/10'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {msg.type === 'prescription' && <CheckCircle2 size={14} />}
                                            {msg.type === 'guide' && <MapPin size={14} className="text-white" />}
                                            <span className="text-[10px] opacity-60 uppercase font-black">
                                                {msg.sender === 'expert' ? 'Expert Physician' : 'User'}
                                            </span>
                                        </div>
                                        {msg.type === 'guide' ? (
                                            <div className="space-y-2">
                                                <p className="font-bold text-[11px] mb-2">혈자리 가이드 이미지를 전송했습니다.</p>
                                                <div className="relative aspect-square w-full bg-black rounded-lg overflow-hidden border border-white/10">
                                                    {msg.earPhotoUrl ? (
                                                        <div className="relative w-full h-full">
                                                            <img src={msg.earPhotoUrl} alt="Guide" className="w-full h-full object-cover" />
                                                            {msg.markers?.map((point, idx) => (
                                                                <div 
                                                                    key={idx}
                                                                    className="absolute w-2 h-2 bg-red-500 border border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"
                                                                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                                                >
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 bg-black/80 text-white text-[6px] px-1 rounded whitespace-nowrap">
                                                                        {point.label}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">이미지 없음</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="leading-relaxed">{msg.text}</p>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-slate-600 mt-1 font-bold">
                                        {msg.createdAt?.toDate?.() ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                                    </span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Action Bar */}
                        <div className="p-4 bg-white/5 border-t border-white/5 space-y-3">
                            <div className="flex gap-2">
                                <button 
                                    onClick={sendPrescription}
                                    className="px-4 py-3 bg-white/5 text-slate-400 border border-white/10 rounded-xl text-xs font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <ClipboardList size={16} />
                                    처방전
                                </button>
                                <button 
                                    onClick={() => setIsMarkingModalOpen(true)}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase hover:bg-green-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 active:scale-95 border border-green-400/20"
                                >
                                    <Activity size={16} />
                                    혈자리 가이드 전송
                                </button>
                            </div>
                            <form 
                                onSubmit={sendMessage}
                                className="relative flex items-center"
                            >
                                <input 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                    placeholder="환자에게 전달할 메시지 입력..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-2 size-10 bg-green-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-green-500 transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>
            </main>

            <MarkingModal 
                isOpen={isMarkingModalOpen}
                onClose={() => setIsMarkingModalOpen(false)}
                onSave={handleSaveGuide}
                imageUrl={latestEarPhoto || ''}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}

export default function AdminChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#17171A] flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-black text-lg">상담방 불러오는 중...</p>
            </div>
        }>
            <AdminChatContent />
        </Suspense>
    );
}
