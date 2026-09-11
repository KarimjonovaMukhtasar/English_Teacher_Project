import React from 'react';
import { TwoColumnContent } from '../../../types';
import { SplitSquareVertical } from 'lucide-react';

interface TwoColumnSlideProps {
  data: TwoColumnContent;
  isFullScreen?: boolean;
  footerText?: string;
}

export const TwoColumnSlide: React.FC<TwoColumnSlideProps> = ({
  data,
  isFullScreen = false,
  footerText,
}) => {
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
            <SplitSquareVertical className="h-5 w-5" />
          </div>
          <span className="text-xs uppercase tracking-wider text-cyan-100 font-bold">
            Juftlikda tahlil va muloqot
          </span>
        </div>
        <div className="text-xs text-slate-950 font-bold bg-cyan-300 px-2.5 py-1 rounded-full">
          Ikki nuqtai nazar
        </div>
      </div>

      {/* Columns Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Column (e.g. Doctor / Sign / Case A) */}
        <div className="flex flex-col rounded-3xl bg-white border-t-8 border-brand-700 p-6 md:p-8 shadow-sm">
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-slate-100">
            {data.leftBadge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-brand-50 text-brand-800 border border-brand-200">
                {data.leftBadge}
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight">
              {data.leftTitle || 'Left Column'}
            </h2>
          </div>

          {/* Bullet Points */}
          <ul className="flex-1 py-4 space-y-3">
            {(data.leftPoints || []).map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-800 text-sm md:text-base font-medium">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column (e.g. Nurse / Symptom / Case B) */}
        <div className="flex flex-col rounded-3xl bg-slate-950 border-t-8 border-cyan-300 p-6 md:p-8 shadow-sm">
          {/* Header */}
          <div className="space-y-2 pb-4 border-b border-slate-700">
            {data.rightBadge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-cyan-300 text-slate-950">
                {data.rightBadge}
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {data.rightTitle || 'Right Column'}
            </h2>
          </div>

          {/* Bullet Points */}
          <ul className="flex-1 py-4 space-y-3">
            {(data.rightPoints || []).map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-100 text-sm md:text-base font-medium">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-[11px] font-bold text-slate-950 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 font-medium mt-4">
        {footerText || 'tilchi.uz • Interaktiv Darslik'}
      </div>
    </div>
  );
};
