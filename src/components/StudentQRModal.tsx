import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { X, RefreshCw, Clock, Shield, Sparkles } from 'lucide-react';

interface StudentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentQRModal: React.FC<StudentQRModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [token, setToken] = useState(() => 'TOK-' + Math.random().toString(36).substring(2, 10).toUpperCase());
  const [secondsRemaining, setSecondsRemaining] = useState(890); // ~14m 50s
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleRotate();
          return 900;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRotate = () => {
    setIsRotating(true);
    setTimeout(() => {
      const newToken = 'TOK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setToken(newToken);
      setSecondsRemaining(900);
      setIsRotating(false);
    }, 300);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !user) return null;

  // JSON payload stored in QR code for scanning
  const qrPayload = JSON.stringify({
    userId: user.id,
    rollNo: user.roll_no,
    fullName: user.full_name,
    token,
    type: 'CAMPUS_CANTEEN_STUDENT_TOKEN',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E8E1D9] flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Purchase Token</span>
        </div>

        <h3 className="text-xl font-bold text-[#3D2B1F] font-serif mb-1">
          {user.full_name}
        </h3>
        <p className="text-xs text-stone-500 font-mono mb-5">
          Roll No: <span className="font-bold text-stone-800">{user.roll_no}</span>
        </p>

        {/* QR Box */}
        <div className="relative p-5 bg-[#FDF9F3] border-2 border-dashed border-[#E8E1D9] rounded-2xl mb-4 shadow-inner">
          <QRCodeSVG
            value={qrPayload}
            size={180}
            level="H"
            fgColor="#3D2B1F"
            bgColor="#FDF9F3"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Center mini logo */}
            <div className="w-9 h-9 bg-[#3D2B1F] rounded-lg border-2 border-white flex items-center justify-center shadow-md">
              <span className="text-amber-400 font-bold text-xs">🪙</span>
            </div>
          </div>
        </div>

        {/* Token and Timer info */}
        <div className="w-full bg-[#FDF9F3] rounded-xl p-3 border border-[#E8E1D9] mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Security Token:</span>
            <span className="font-mono font-bold text-[#3D2B1F]">{token}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#E8E1D9]">
            <span className="flex items-center gap-1 text-stone-500">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Expires in:</span>
            </span>
            <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              {formatTimer(secondsRemaining)}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed mb-5">
          Present this rotating QR code to the canteen counter operator when paying for offline meals to automatically earn loyalty coins.
        </p>

        {/* Refresh Action */}
        <button
          onClick={handleRotate}
          disabled={isRotating}
          className="w-full py-3 bg-white hover:bg-stone-50 text-[#3D2B1F] border border-[#E8E1D9] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 text-amber-600 ${isRotating ? 'animate-spin' : ''}`} />
          <span>Generate Fresh Token</span>
        </button>
      </div>
    </div>
  );
};
