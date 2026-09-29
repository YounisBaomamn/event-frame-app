'use client';

import React, { useState } from 'react';
import { Download, Loader2, RefreshCw, CheckCircle2, Share2, Sparkles } from 'lucide-react';
import { mergeImagesWithFrame, downloadBlob, type Area } from '@/utils/canvasMerger';

interface DownloadSectionProps {
  imageSrc: string;
  frameSrc: string;
  cropPixels: Area | null;
  rotation: number;
  flipHorizontal: boolean;
  onResetImage: () => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  imageSrc,
  frameSrc,
  cropPixels,
  rotation,
  flipHorizontal,
  onResetImage,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateMergedBlob = async () => {
    if (!imageSrc || !frameSrc || !cropPixels) {
      throw new Error('يرجى اختيار صورتك وضبط موضعها داخل الإطار أولاً');
    }

    let resolvedFrameSrc = frameSrc;
    if (frameSrc.startsWith('http://') || frameSrc.startsWith('https://')) {
      resolvedFrameSrc = `/api/proxy-image?url=${encodeURIComponent(frameSrc)}`;
    }

    return await mergeImagesWithFrame({
      imageSrc,
      frameSrc: resolvedFrameSrc,
      cropPixels,
      rotation,
      flipHorizontal,
      outputFormat: 'image/png',
      quality: 0.95,
    });
  };

  const handleDownload = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const blob = await generateMergedBlob();
      const filename = `nebras-25-celebration.png`;
      downloadBlob(blob, filename);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: unknown) {
      console.error('Error during download:', err);
      setErrorMessage(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const blob = await generateMergedBlob();
      const file = new File([blob], 'nebras-25-celebration.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'نبراس للتنمية - ربع قرن من الضياء',
          text: 'احتفالية ربع قرن من الضياء (25 عاماً) - نبراس للتنمية ✨ #نبراس_للتنمية',
        });
      } else {
        // Fallback: download directly and notify
        downloadBlob(blob, 'nebras-25-celebration.png');
        alert('تم تنزيل الصورة إلى جهازك! يمكنك الآن فتح واتساب أو إنستغرام ومشاركتها في الحالة (Status / Story).');
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
        setErrorMessage('تعذرت المشاركة المباشرة، تم حفظ الصورة في جهازك لتتمكن من مشاركتها يدوياً.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
      <div className="text-center space-y-1">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>صورتك جاهزة بأعلى دقة</span>
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          يمكنك تنزيل الصورة فوراً أو مشاركتها في حالة واتساب وستوري إنستغرام
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {/* Main Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isProcessing || !cropPixels}
          className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base shadow-md transition-all duration-200 ${
            isProcessing || !cropPixels
              ? 'bg-slate-400 cursor-not-allowed opacity-80'
              : isSuccess
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 shadow-blue-700/25 active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري تجهيز الصورة...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>تم التنزيل بنجاح! 🎉</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>تنزيل الصورة في جهازي</span>
            </>
          )}
        </button>

        {/* Share Button (WhatsApp / Instagram / Native Share) */}
        <button
          type="button"
          onClick={handleShare}
          disabled={isProcessing || !cropPixels}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-sm transition-all active:scale-[0.98]"
        >
          <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>مشاركة في حالة واتساب / ستوري</span>
        </button>
      </div>

      {/* Change Image Button */}
      <div className="flex justify-center pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onResetImage}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium py-1 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>اختيار صورة شخصية أخرى</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
