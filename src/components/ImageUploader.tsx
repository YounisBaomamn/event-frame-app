'use client';

import React, { useRef, useState } from 'react';
import { Camera, UploadCloud, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (imageSrc: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPEG, PNG, WEBP, إلخ)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('حدث خطأ أثناء قراءة ملف الصورة');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-3">
      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleChange}
      />

      {/* Main Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        className={`group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 shadow-md'
        }`}
      >
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform duration-300">
            <UploadCloud className="w-10 h-10 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-6 w-6">
            <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          اضغط لاختيار صورتك الشخصية
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
          اختر صورة واضحة من معرض الصور على هاتفك
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>يدعم جميع أنواع وأبعاد الصور</span>
        </div>
      </div>

      {/* Direct Camera Button (Optimized for Mobile Event attendees) */}
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
      >
        <Camera className="w-4 h-4 text-blue-400" />
        <span>التقاط صورة سيلفي مباشرة بالكاميرا</span>
      </button>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs text-center">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
