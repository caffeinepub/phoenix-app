import { Camera, User } from "lucide-react";
import { useRef } from "react";

// Simple inline SVG avatars
function FemaleAvatar() {
  return (
    <svg
      role="img"
      aria-label="Female avatar"
      viewBox="0 0 80 80"
      width="64"
      height="64"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="40" cy="40" r="40" fill="#fce7f3" />
      {/* Hair - long */}
      <ellipse cx="40" cy="28" rx="18" ry="20" fill="#7c3aed" />
      <rect x="22" y="30" width="7" height="28" rx="3" fill="#7c3aed" />
      <rect x="51" y="30" width="7" height="28" rx="3" fill="#7c3aed" />
      {/* Face */}
      <ellipse cx="40" cy="36" rx="14" ry="15" fill="#fcd5b5" />
      {/* Eyes */}
      <ellipse cx="34" cy="33" rx="2.5" ry="2.8" fill="#1e293b" />
      <ellipse cx="46" cy="33" rx="2.5" ry="2.8" fill="#1e293b" />
      <ellipse cx="34.7" cy="32.2" rx="0.8" ry="0.8" fill="white" />
      <ellipse cx="46.7" cy="32.2" rx="0.8" ry="0.8" fill="white" />
      {/* Lashes */}
      <line
        x1="31.5"
        y1="30.5"
        x2="30"
        y2="29"
        stroke="#1e293b"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="34"
        y1="30"
        x2="34"
        y2="28.5"
        stroke="#1e293b"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="36.5"
        y1="30.5"
        x2="38"
        y2="29"
        stroke="#1e293b"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="43.5"
        y1="30.5"
        x2="42"
        y2="29"
        stroke="#1e293b"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="30"
        x2="46"
        y2="28.5"
        stroke="#1e293b"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="48.5"
        y1="30.5"
        x2="50"
        y2="29"
        stroke="#1e293b"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Nose */}
      <path
        d="M39 38 Q40 40 41 38"
        stroke="#c08060"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Smile */}
      <path
        d="M35 42 Q40 46 45 42"
        stroke="#ec4899"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cheeks */}
      <ellipse cx="30" cy="39" rx="4" ry="2.5" fill="#ec4899" opacity="0.3" />
      <ellipse cx="50" cy="39" rx="4" ry="2.5" fill="#ec4899" opacity="0.3" />
      {/* Body / neck */}
      <rect x="33" y="49" width="14" height="8" rx="2" fill="#fcd5b5" />
      <rect x="22" y="55" width="36" height="16" rx="8" fill="#ec4899" />
    </svg>
  );
}

function MaleAvatar() {
  return (
    <svg
      role="img"
      aria-label="Male avatar"
      viewBox="0 0 80 80"
      width="64"
      height="64"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="40" cy="40" r="40" fill="#dbeafe" />
      {/* Hair - short */}
      <ellipse cx="40" cy="24" rx="17" ry="10" fill="#1e293b" />
      <rect x="23" y="22" width="34" height="10" rx="2" fill="#1e293b" />
      {/* Face */}
      <ellipse cx="40" cy="36" rx="14" ry="15" fill="#fcd5b5" />
      {/* Eyes */}
      <ellipse cx="34" cy="33" rx="2.5" ry="2.5" fill="#1e293b" />
      <ellipse cx="46" cy="33" rx="2.5" ry="2.5" fill="#1e293b" />
      <ellipse cx="34.7" cy="32.2" rx="0.8" ry="0.8" fill="white" />
      <ellipse cx="46.7" cy="32.2" rx="0.8" ry="0.8" fill="white" />
      {/* Eyebrows */}
      <path
        d="M31 30 Q34 28.5 37 30"
        stroke="#1e293b"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M43 30 Q46 28.5 49 30"
        stroke="#1e293b"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Nose */}
      <path
        d="M38.5 37 Q40 40 41.5 37"
        stroke="#c08060"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Mouth */}
      <path
        d="M35.5 42.5 Q40 45.5 44.5 42.5"
        stroke="#c08060"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Ears */}
      <ellipse cx="26" cy="36" rx="3" ry="4" fill="#fcd5b5" />
      <ellipse cx="54" cy="36" rx="3" ry="4" fill="#fcd5b5" />
      {/* Body / neck */}
      <rect x="33" y="49" width="14" height="8" rx="2" fill="#fcd5b5" />
      <rect x="20" y="55" width="40" height="16" rx="8" fill="#3b82f6" />
      {/* Shirt collar */}
      <path
        d="M35 55 L40 62 L45 55"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface AvatarPickerProps {
  value: string | null;
  onChange: (url: string) => void;
}

export default function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert SVG to data URL
  function svgToDataUrl(svgString: string): string {
    const encoded = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encoded}`;
  }

  const femalesvg = `<svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#fce7f3"/><ellipse cx="40" cy="28" rx="18" ry="20" fill="#7c3aed"/><rect x="22" y="30" width="7" height="28" rx="3" fill="#7c3aed"/><rect x="51" y="30" width="7" height="28" rx="3" fill="#7c3aed"/><ellipse cx="40" cy="36" rx="14" ry="15" fill="#fcd5b5"/><ellipse cx="34" cy="33" rx="2.5" ry="2.8" fill="#1e293b"/><ellipse cx="46" cy="33" rx="2.5" ry="2.8" fill="#1e293b"/><ellipse cx="34.7" cy="32.2" rx="0.8" ry="0.8" fill="white"/><ellipse cx="46.7" cy="32.2" rx="0.8" ry="0.8" fill="white"/><path d="M39 38 Q40 40 41 38" stroke="#c08060" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M35 42 Q40 46 45 42" stroke="#ec4899" stroke-width="1.5" fill="none" stroke-linecap="round"/><ellipse cx="30" cy="39" rx="4" ry="2.5" fill="#ec4899" opacity="0.3"/><ellipse cx="50" cy="39" rx="4" ry="2.5" fill="#ec4899" opacity="0.3"/><rect x="33" y="49" width="14" height="8" rx="2" fill="#fcd5b5"/><rect x="22" y="55" width="36" height="16" rx="8" fill="#ec4899"/></svg>`;

  const malesvg = `<svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#dbeafe"/><ellipse cx="40" cy="24" rx="17" ry="10" fill="#1e293b"/><rect x="23" y="22" width="34" height="10" rx="2" fill="#1e293b"/><ellipse cx="40" cy="36" rx="14" ry="15" fill="#fcd5b5"/><ellipse cx="34" cy="33" rx="2.5" ry="2.5" fill="#1e293b"/><ellipse cx="46" cy="33" rx="2.5" ry="2.5" fill="#1e293b"/><ellipse cx="34.7" cy="32.2" rx="0.8" ry="0.8" fill="white"/><ellipse cx="46.7" cy="32.2" rx="0.8" ry="0.8" fill="white"/><path d="M31 30 Q34 28.5 37 30" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M43 30 Q46 28.5 49 30" stroke="#1e293b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M38.5 37 Q40 40 41.5 37" stroke="#c08060" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M35.5 42.5 Q40 45.5 44.5 42.5" stroke="#c08060" stroke-width="1.5" fill="none" stroke-linecap="round"/><ellipse cx="26" cy="36" rx="3" ry="4" fill="#fcd5b5"/><ellipse cx="54" cy="36" rx="3" ry="4" fill="#fcd5b5"/><rect x="33" y="49" width="14" height="8" rx="2" fill="#fcd5b5"/><rect x="20" y="55" width="40" height="16" rx="8" fill="#3b82f6"/><path d="M35 55 L40 62 L45 55" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const femaleUrl = svgToDataUrl(femalesvg);
  const maleUrl = svgToDataUrl(malesvg);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Current avatar preview */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/30 bg-muted flex items-center justify-center">
          {value ? (
            <img
              src={value}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Avatar options */}
      <div className="flex items-center gap-4">
        {/* Female avatar */}
        <button
          type="button"
          data-ocid="avatar.female.button"
          onClick={() => onChange(femaleUrl)}
          className={`rounded-full overflow-hidden border-4 transition-all ${
            value === femaleUrl
              ? "border-pink-400 ring-2 ring-pink-300"
              : "border-transparent hover:border-pink-200"
          }`}
          aria-label="Select female avatar"
        >
          <FemaleAvatar />
        </button>

        {/* Upload button */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            data-ocid="avatar.upload_button"
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-full bg-primary/10 hover:bg-primary/20 border-2 border-dashed border-primary/40 flex items-center justify-center transition-colors"
            aria-label="Upload photo"
          >
            <Camera className="w-5 h-5 text-primary" />
          </button>
          <span className="text-[10px] text-muted-foreground">Upload</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Male avatar */}
        <button
          type="button"
          data-ocid="avatar.male.button"
          onClick={() => onChange(maleUrl)}
          className={`rounded-full overflow-hidden border-4 transition-all ${
            value === maleUrl
              ? "border-blue-400 ring-2 ring-blue-300"
              : "border-transparent hover:border-blue-200"
          }`}
          aria-label="Select male avatar"
        >
          <MaleAvatar />
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Choose an avatar or upload your photo
      </p>
    </div>
  );
}
