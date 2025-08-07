// components/planAconfirmModal.tsx
import { useEffect } from "react";

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