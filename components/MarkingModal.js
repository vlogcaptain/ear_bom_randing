'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MapPin, Save, Trash2, Check, Plus, CheckCircle } from 'lucide-react';

const DEFAULT_MARKERS = [];

export default function MarkingModal({ isOpen, onClose, onSave, imageUrl, initialMarkers = DEFAULT_MARKERS }) {
    const [markers, setMarkers] = useState(initialMarkers);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [tempLabel, setTempLabel] = useState('');
    const [displayUrl, setDisplayUrl] = useState(imageUrl || '/demo_ear_photo.png');
    const imageContainerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setMarkers(initialMarkers);
            setSelectedMarker(null);
            setDisplayUrl(imageUrl || '/demo_ear_photo.png');
        }
    }, [isOpen, initialMarkers, imageUrl]);

    if (!isOpen) return null;

    const handleImageClick = (e) => {
        if (selectedMarker !== null && markers[selectedMarker]?.label === '') {
            // If previous marker not named, don't add new one
            return;
        }

        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newMarker = { x, y, label: '' };
        setMarkers([...markers, newMarker]);
        setSelectedMarker(markers.length);
        setTempLabel('');
    };

    const handleSaveMarker = () => {
        if (selectedMarker === null) return;
        const updatedMarkers = [...markers];
        updatedMarkers[selectedMarker].label = tempLabel || '혈자리';
        setMarkers(updatedMarkers);
        setSelectedMarker(null);
        setTempLabel('');
    };

    const deleteMarker = (index, e) => {
        e.stopPropagation();
        const updatedMarkers = markers.filter((_, i) => i !== index);
        setMarkers(updatedMarkers);
        setSelectedMarker(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-[#1A1A1E] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[850px]">
                
                {/* Image Area */}
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden p-4 group">
                    <div 
                        ref={imageContainerRef}
                        className="relative cursor-crosshair transition-transform duration-500 ease-out"
                        onClick={handleImageClick}
                    >
                        <img 
                            src={displayUrl} 
                            alt="Ear to mark" 
                            className="max-w-full max-h-[700px] block rounded-2xl shadow-2xl select-none"
                            draggable={false}
                            onError={(e) => {
                                console.log('[DEBUG] Image load error in MarkingModal, falling back to demo.');
                                setDisplayUrl('/demo_ear_photo.png');
                            }}
                        />

                        {/* Rendering Markers */}
                        {markers.map((marker, index) => (
                            <div 
                                key={index}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/pin ${selectedMarker === index ? 'z-20' : 'z-10'}`}
                                style={{ top: `${marker.y}%`, left: `${marker.x}%` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMarker(index);
                                    setTempLabel(marker.label);
                                }}
                            >
                                <div className={`size-8 rounded-full flex items-center justify-center transition-all shadow-lg ${selectedMarker === index ? 'bg-green-500 scale-125 ring-4 ring-green-500/20' : 'bg-white/90 text-slate-800 hover:scale-110'}`}>
                                    <MapPin size={18} fill={selectedMarker === index ? 'white' : 'currentColor'} color={selectedMarker === index ? 'green' : 'white'} />
                                </div>
                                {marker.label && (
                                    <div className="mt-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-black text-white whitespace-nowrap shadow-xl">
                                        {marker.label}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Instruction Overlay */}
                    <div className="absolute top-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-white/80">
                            사진 위를 클릭하여 혈자리를 표시하세요.
                        </div>
                    </div>
                </div>

                {/* Sidebar / Control Panel */}
                <div className="w-full md:w-80 bg-[#1A1A1E] border-l border-white/5 flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-white tracking-tight">혈자리 가이드 편집</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Acupoint Marking Tool</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="size-8 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all flex items-center justify-center"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Selected Marker Edit Area */}
                        {selectedMarker !== null && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                                    <label className="text-[10px] font-black text-green-500 uppercase tracking-widest block mb-2">혈자리 명칭 입력</label>
                                    <div className="flex gap-2">
                                        <input 
                                            autoFocus
                                            type="text"
                                            className="flex-1 bg-black/40 border border-green-500/30 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-green-500/20"
                                            placeholder="예: 신문, 위, 비장..."
                                            value={tempLabel}
                                            onChange={(e) => setTempLabel(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSaveMarker()}
                                        />
                                        <button 
                                            onClick={handleSaveMarker}
                                            className="size-10 bg-green-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-green-500 transition-all shrink-0"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                    
                                    {/* Presets */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {['신문', '자궁', '위', '심장', '비장', '간'].map(preset => (
                                            <button 
                                                key={preset}
                                                onClick={() => setTempLabel(preset)}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-slate-400 font-bold transition-all border border-white/5"
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Markers List */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">마킹된 혈자리 리스트 ({markers.length})</h4>
                            {markers.length === 0 ? (
                                <div className="py-10 text-center flex flex-col items-center gap-3">
                                    <div className="size-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-700">
                                        <MapPin size={24} />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">마킹된 정보가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {markers.map((marker, index) => (
                                        <div 
                                            key={index}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group/item ${selectedMarker === index ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'}`}
                                            onClick={() => {
                                                setSelectedMarker(index);
                                                setTempLabel(marker.label);
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`size-8 rounded-lg flex items-center justify-center text-[10px] font-black ${marker.label ? 'bg-green-500/20 text-green-500' : 'bg-slate-700 text-slate-400'}`}>
                                                    {index + 1}
                                                </div>
                                                <span className={`text-xs font-bold ${marker.label ? 'text-white' : 'text-slate-500 italic'}`}>
                                                    {marker.label || '명칭 미입력'}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => deleteMarker(index, e)}
                                                className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 space-y-3 bg-white/[0.02]">
                        <button 
                            disabled={false}
                            onClick={() => onSave(markers)}
                            className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-green-600/10 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} />
                            마킹 적용하기
                        </button>
                        <p className="text-[10px] text-slate-500 text-center font-bold">
                            * 메인 화면의 [진단 결과 전송] 버튼을 눌러야 최종 저장됩니다.
                        </p>
                    </div>
                </div>
            </div>

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
            `}</style>
        </div>
    );
}
