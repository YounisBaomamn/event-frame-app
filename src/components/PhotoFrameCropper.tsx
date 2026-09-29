'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  RotateCcw as ResetIcon,
  Move,
} from 'lucide-react';
import type { EventFrame } from './FrameSelector';

interface PhotoFrameCropperProps {
  imageSrc: string;
  frame: EventFrame;
  onCropComplete: (cropAreaPixels: Area, rotation: number, flipHorizontal: boolean) => void;
}

export const PhotoFrameCropper: React.FC<PhotoFrameCropperProps> = ({
  imageSrc,
  frame,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(croppedAreaPixels, rotation, flipHorizontal);
    },
    [onCropComplete, rotation, flipHorizontal]
  );

  const resetAll = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipHorizontal(false);
  };

  const rotate90 = (direction: 'cw' | 'ccw') => {
    setRotation((prev) => {
      const delta = direction === 'cw' ? 90 : -90;
      let next = (prev + delta) % 360;
      if (next > 180) next -= 360;
      if (next < -180) next += 360;
      return next;
    });
  };

  const isStory = frame.id === 'story';

  return (
    <div className="flex flex-col items-center w-full space-y-3.5">
      {/* Interactive Frame Stage (Cropper behind + Official Frame in front) */}
      <div
        className={`relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-slate-900 select-none touch-none mx-auto transition-all duration-300 ${
          isStory
            ? 'h-[460px] sm:h-[500px] aspect-[9/16]'
            : 'w-full max-w-[380px] aspect-square'
        }`}
      >
        {/* Layer 1: Background User Image with Cropper */}
        <div className="absolute inset-0 w-full h-full">
          <Cropper
            key={`${frame.id}-${imageSrc}`}
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={frame.aspectRatio}
            transform={[
              `translate(${crop.x}px, ${crop.y}px)`,
              `rotate(${rotation}deg)`,
              `scale(${flipHorizontal ? -zoom : zoom}, ${zoom})`,
            ].join(' ')}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
            showGrid={false}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                backgroundColor: '#0a1931',
              },
              cropAreaStyle: {
                border: 'none',
                boxShadow: 'none',
              },
            }}
          />
        </div>

        {/* Layer 2: Official Nebras Frame Overlay */}
        <img
          key={frame.url}
          src={frame.url}
          alt={frame.name}
          className="pointer-events-none absolute inset-0 z-20 w-full h-full object-contain select-none"
        />

        {/* Floating helper hint */}
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-blue-950/80 backdrop-blur-md text-white/95 text-[11px] font-medium flex items-center gap-1.5 shadow-md border border-white/10 whitespace-nowrap">
          <Move className="w-3 h-3 text-blue-300" />
          <span>اسحب وكبّر لتناسب صورتك داخل الإطار</span>
        </div>
      </div>

      {/* Control Panel (Zoom & Rotation) */}
      <div className="w-full max-w-[390px] bg-slate-900/90 border border-white/15 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        {/* Zoom Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-blue-200">
            <span className="flex items-center gap-1.5">
              <ZoomIn className="w-4 h-4 text-blue-400" />
              التقريب والتكبير (Zoom)
            </span>
            <span className="font-mono text-blue-400 font-bold">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}
              className="p-1.5 rounded-lg border border-white/15 hover:bg-white/10 text-white"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.15).toFixed(2)))}
              className="p-1.5 rounded-lg border border-white/15 hover:bg-white/10 text-white"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rotate and Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => rotate90('ccw')}
              className="p-2 rounded-xl border border-white/15 hover:bg-white/10 text-white"
              title="تدوير 90° لليسار"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => rotate90('cw')}
              className="p-2 rounded-xl border border-white/15 hover:bg-white/10 text-white"
              title="تدوير 90° لليمين"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFlipHorizontal((prev) => !prev)}
              className={`p-2 rounded-xl border transition-colors ${
                flipHorizontal
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'border-white/15 hover:bg-white/10 text-white'
              }`}
              title="عكس أفقي (مرآة)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
          >
            <ResetIcon className="w-3.5 h-3.5" />
            <span>إعادة ضبط</span>
          </button>
        </div>
      </div>
    </div>
  );
};
