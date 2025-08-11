// components/planAconfirmModal.tsx
import { useEffect } from "react";
import { MEMBERSHIP_FEE_THB } from "../app/referrer/confirm/page";


interface PlanAConfirmModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export const PlanAConfirmModal = ({ children, onClose }: PlanAConfirmModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative">
        {/* <p className="mt-3 text-sm">
            การกระจายเงิน:
          </p>
          <ul className="text-sm mt-1 mb-4">
            <li>70% ({(MEMBERSHIP_FEE_THB * 0.7).toFixed(2)} THB) → กระเป๋าโครงการ</li>
            <li>30% ({(MEMBERSHIP_FEE_THB * 0.3).toFixed(2)} THB) → ผู้แนะนำ</li>
          </ul> */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};