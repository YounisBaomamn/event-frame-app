'use client';

import React from 'react';
import { Check, Square, Smartphone } from 'lucide-react';

export interface EventFrame {
  id: 'square' | 'story';
  name: string;
  badge: string;
  aspectRatio: number;
  url: string;
  description: string;
}

export const OFFICIAL_FRAMES: EventFrame[] = [
  {
    id: 'square',
    name: 'الإطار المربع (1:1)',
    badge: 'بوست / بروفايل',
    aspectRatio: 1,
    url: '/frames/nebras-square.png?v=2',
    description: 'مناسب لبوستات إنستغرام وصور الملف الشخصي',
  },
  {
    id: 'story',
    name: 'الإطار الطولي (9:16)',
    badge: 'ستوري / حالة واتساب',
    aspectRatio: 9 / 16,
    url: '/frames/nebras-story.png?v=2',
    description: 'مناسب لستوري إنستغرام وحالة واتساب وسناب',
  },
];

interface FrameSelectorProps {
  selectedFrameId: 'square' | 'story';
  onSelectFrame: (frame: EventFrame) => void;
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedFrameId,
  onSelectFrame,
}) => {
  return (
    <div className="w-full max-w-[420px] mx-auto space-y-2">
      <div className="flex items-center justify-between text-xs text-blue-200/90 font-bold px-1">
        <span>اختر إطار المناسبة المطلوب:</span>
        <span className="text-[11px] text-amber-400 font-normal">إطاران رسميان معتمدان</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OFFICIAL_FRAMES.map((frame) => {
          const isSelected = selectedFrameId === frame.id;
          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => onSelectFrame(frame)}
              className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 text-right ${
                isSelected
                  ? 'border-blue-400 bg-blue-600/30 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}

              {/* Real Thumbnail of the actual event frame */}
              <div
                className={`relative rounded-xl overflow-hidden mb-2 bg-blue-950/60 p-1 border border-white/15 flex items-center justify-center ${
                  frame.id === 'square' ? 'w-24 h-24 aspect-square' : 'w-16 h-28 aspect-[9/16]'
                }`}
              >
                <img
                  src={frame.url}
                  alt={frame.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-center w-full space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  {frame.id === 'square' ? (
                    <Square className="w-3 h-3 text-blue-300" />
                  ) : (
                    <Smartphone className="w-3 h-3 text-blue-300" />
                  )}
                  {frame.name}
                </span>
                <span className="block text-[10px] text-blue-200/70 font-medium">
                  {frame.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
