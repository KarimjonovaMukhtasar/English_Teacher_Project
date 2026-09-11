import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Check, Copy } from 'lucide-react';

interface RemotePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  isConnected: boolean;
}

export const RemotePairingModal: React.FC<RemotePairingModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  isConnected,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const remoteUrl = `${window.location.origin}${window.location.pathname}?remote=${sessionId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(remoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900">Telefonni Pult Qilish</h3>
              <p className="text-[11px] text-slate-500">Smart Mobile Remote</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-lg border-2 border-blue-100">
            <QRCodeSVG
              value={remoteUrl}
              size={190}
              level="M"
              includeMargin={false}
            />
          </div>

          <p className="mt-4 text-xs font-semibold text-slate-700">
            Kamerangiz orqali ushbu QR kodni skaner qiling
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400 max-w-[260px]">
            Sinf bo'ylab bemalol aylanib yurib, slaydlarni telefoningizdan o'tkazing
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 py-2 px-3 mb-4">
          <div className={`h-2.5 w-2.5 rounded-full ${
            isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-ping'
          }`} />
          <span className="text-xs font-medium text-slate-700">
            {isConnected ? 'Telefon muvaffaqiyatli ulandi!' : 'Telefon ulanishi kutilmoqda...'}
          </span>
        </div>

        {/* Copy Link button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Havola nusxalandi!' : 'Havolani nusxalash'}
          </button>
        </div>
      </div>
    </div>
  );
};
