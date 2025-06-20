// src/components/ui/file-preview-card.tsx
import { X } from "lucide-react";

interface FilePreviewCardProps {
  fileName: string;
  fileType: string;
  onRemove?: () => void;
  onClick?:()=>void;
}

export function FilePreviewCard({ fileName, fileType, onRemove, onClick }: FilePreviewCardProps) {
  return (
    <div className="flex items-center bg-[#2c2c2c] rounded-xl border border-gray-700 px-2 py-2 shadow relative min-w-0 w-36 sm:w-48 max-w-xs sm:max-w-xs md:max-w-sm">
      <div
        onClick={onClick}
        className="flex items-center w-full min-w-0"
      >
        <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-pink-400 mr-2 sm:mr-3 flex-shrink-0">
          <svg width="22" height="22" className="sm:w-6 sm:h-6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="3" width="12" height="18" rx="2" />
            <path d="M9 7h6M9 11h6M9 15h2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate text-sm sm:text-base">{fileName}</div>
          <div className="text-xs text-gray-300">{fileType}</div>
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="absolute top-0 right-0 z-50 text-gray-300 rounded-full hover:text-white p-1 hover:!bg-red-700"
          aria-label="Remove file"
        >
          <X size={16} className="sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}