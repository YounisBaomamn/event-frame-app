'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, QrCode, CheckCircle, HelpCircle } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { FrameSelector, OFFICIAL_FRAMES, type EventFrame } from '@/components/FrameSelector';
import { PhotoFrameCropper } from '@/components/PhotoFrameCropper';
import { DownloadSection } from '@/components/DownloadSection';
import type { Area } from '@/utils/canvasMerger';

export default function Home() {
  const [selectedFrame, setSelectedFrame] = useState<EventFrame>(OFFICIAL_FRAMES[0]);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCropComplete = (areaPixels: Area, rot: number, flip: boolean) => {
    setCropPixels(areaPixels);
    setRotation(rot);
    setFlipHorizontal(flip);
  };

  const handleResetImage = () => {
    setUserImage(null);
    setCropPixels(null);
    setRotation(0);
    setFlipHorizontal(false);
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-950 to-slate-950 text-slate-100 py-6 px-3.5 sm:px-6 flex flex-col items-center justify-between selection:bg-blue-500 selection:text-white"
      dir="rtl"
    >
      {/* Event Header */}
      <header className="w-full max-w-md mx-auto text-center space-y-2 mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-200 text-xs font-bold tracking-wide backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>احتفالية 25 عاماً • ربع قرن من الضياء</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          نبراس للتنمية
        </h1>
        <p className="text-xs sm:text-sm text-blue-200/80 max-w-xs mx-auto leading-relaxed">
          اختر الإطار الرسمي المفضل، ارفع صورتك لتتوسط الإطار، ثم شاركها في حالتك.
        </p>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-4">
        {/* Frame Selector is ALWAYS visible and accessible */}
        <FrameSelector
          selectedFrameId={selectedFrame.id}
          onSelectFrame={(frame) => setSelectedFrame(frame)}
        />

        {!userImage ? (
          /* Step 1: Upload Photo / Take Selfie */
          <div className="w-full space-y-4 animate-in fade-in duration-300">
            <ImageUploader onImageSelected={(img) => setUserImage(img)} />

            {/* Quick Benefits Guide */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-blue-200/90 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>إطار مربع للمنشورات والبروفايل، وإطار طولي لستوري إنستغرام وحالة واتساب</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>حرّك الصورة وكبّرها لتتناسب وجهك داخل الفتحة المخصصة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تنزيل مباشر عالي الدقة (4K HD) ومشاركة سريعة</span>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Interactive Cropper & Download */
          <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <PhotoFrameCropper
              imageSrc={userImage}
              frame={selectedFrame}
              onCropComplete={handleCropComplete}
            />

            <DownloadSection
              imageSrc={userImage}
              frameSrc={selectedFrame.url}
              cropPixels={cropPixels}
              rotation={rotation}
              flipHorizontal={flipHorizontal}
              onResetImage={handleResetImage}
            />
          </div>
        )}
      </div>

      {/* Footer & QR Code utility */}
      <footer className="mt-8 text-center text-[11px] text-blue-300/60 space-y-2">
        <button
          type="button"
          onClick={() => setShowQrModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-blue-200 text-xs transition-colors"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>عرض الباركود (QR Code) للمنظمين والطباعة</span>
        </button>

        <p className="flex items-center justify-center gap-1">
          <HelpCircle className="w-3 h-3" />
          <span>تتم معالجة الصورة بأمان وخصوصية تامة على جهازك</span>
        </p>
        <p>© نبراس للتنمية • ربع قرن من الضياء 25</p>
      </footer>

      {/* QR Code Modal for Event Organizers */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center text-blue-700">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">باركود الفعالية (QR Code)</h3>
              <p className="text-xs text-slate-500 mt-1">
                اطبع هذا الباركود في بطاقات الدعوة أو استاندات الحفل ليقوم الحاضرون بمسحه بهواتفهم مباشرة.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  currentUrl
                )}`}
                alt="QR Code"
                className="w-44 h-44 rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
