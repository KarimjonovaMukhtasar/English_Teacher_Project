import React from 'react';
import { BlankContent } from '../../../types';
import { Presentation } from 'lucide-react';

interface BlankSlideProps {
  data: BlankContent;
  isFullScreen?: boolean;
  footerText?: string;
}

export const BlankSlide: React.FC<BlankSlideProps> = ({
  data,
  isFullScreen = false,
  footerText,
}) => {
  const hasImage = Boolean(data.imageUrl);

  return (
    <div
      className={`h-full w-full flex flex-col justify-between p-6 md:p-8 lg:p-10 bg-[#eaf5f3] text-slate-900 overflow-y-auto ${
        isFullScreen ? 'text-lg' : 'text-base'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 mb-5 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
            <Presentation className="h-5 w-5" />
          </div>
          <span className="text-xs uppercase tracking-wider text-cyan-100 font-bold">
            Dars yo‘nalishi
          </span>
        </div>
        <div className="text-xs text-slate-950 font-bold bg-cyan-300 px-2.5 py-1 rounded-full">
          Medical English
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 grid gap-8 items-center ${hasImage ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-4xl mx-auto w-full'}`}>
        {/* Left / Text Side */}
        <div className={`space-y-6 ${hasImage ? 'lg:col-span-7' : 'w-full'}`}>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              {data.heading || 'Slide Heading'}
            </h1>
            {data.subheading && (
              <p className="text-base md:text-xl text-brand-700 font-bold">
                {data.subheading}
              </p>
            )}
          </div>

          {/* Paragraphs List */}
          {data.paragraphs && data.paragraphs.length > 0 && (
            <div className="space-y-3.5">
              {data.paragraphs.map((para, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-white border-l-4 border-brand-600 text-slate-800 text-sm md:text-base leading-relaxed shadow-sm"
                >
                  <p>{para}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right / Image Side */}
        {hasImage && (
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 bg-white aspect-video lg:aspect-square flex items-center justify-center">
              <img
                src={data.imageUrl}
                alt={data.imageAlt || data.heading}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 font-medium mt-4">
        {footerText || 'tilchi.uz • Interaktiv Darslik'}
      </div>
    </div>
  );
};
