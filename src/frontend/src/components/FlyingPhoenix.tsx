import { useEffect, useRef, useState } from "react";

type PhoenixState = "entering" | "hovering" | "leaving" | "gone";

interface FlyingPhoenixProps {
  shouldLeave: boolean;
  onGone?: () => void;
}

export default function FlyingPhoenix({
  shouldLeave,
  onGone,
}: FlyingPhoenixProps) {
  const [state, setState] = useState<PhoenixState>("entering");
  const onGoneRef = useRef(onGone);
  onGoneRef.current = onGone;

  useEffect(() => {
    // After entering animation completes, switch to hovering
    const t = setTimeout(() => setState("hovering"), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (shouldLeave && state === "hovering") {
      setState("leaving");
      const t = setTimeout(() => {
        setState("gone");
        onGoneRef.current?.();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [shouldLeave, state]);

  if (state === "gone") return null;

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    bottom:
      state === "entering" ? "-120px" : state === "leaving" ? "-120px" : "32px",
    right:
      state === "entering" ? "-120px" : state === "leaving" ? "-120px" : "24px",
    width: "88px",
    height: "88px",
    zIndex: 9999,
    pointerEvents: "none",
    transition:
      state === "entering"
        ? "bottom 1.1s cubic-bezier(0.34,1.56,0.64,1), right 1.1s cubic-bezier(0.34,1.56,0.64,1)"
        : state === "leaving"
          ? "bottom 1.0s cubic-bezier(0.55,0,1,0.45), right 1.0s cubic-bezier(0.55,0,1,0.45)"
          : "none",
    filter: "drop-shadow(0 0 18px #ff6b0088)",
  };

  return (
    <div style={baseStyle}>
      <PhoenixSVG hovering={state === "hovering"} />
    </div>
  );
}

function PhoenixSVG({ hovering }: { hovering: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Flying phoenix"
      style={{
        width: "100%",
        height: "100%",
        animation: hovering
          ? "phoenixFloat 2.4s ease-in-out infinite"
          : undefined,
      }}
    >
      <style>{`
        @keyframes phoenixFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Tail flames */}
      <ellipse
        cx="38"
        cy="82"
        rx="7"
        ry="14"
        fill="#ff4400"
        opacity="0.7"
        style={{ animation: "flicker 0.8s ease-in-out infinite" }}
      />
      <ellipse
        cx="48"
        cy="85"
        rx="5"
        ry="10"
        fill="#ffaa00"
        opacity="0.8"
        style={{ animation: "flicker 1.1s ease-in-out infinite" }}
      />
      <ellipse
        cx="58"
        cy="82"
        rx="6"
        ry="12"
        fill="#ff6600"
        opacity="0.7"
        style={{ animation: "flicker 0.9s ease-in-out infinite" }}
      />

      {/* Wings */}
      <path d="M50 45 Q20 20 8 35 Q22 50 50 52Z" fill="#ff6b00" opacity="0.9" />
      <path
        d="M50 45 Q80 20 92 35 Q78 50 50 52Z"
        fill="#ff8c00"
        opacity="0.9"
      />
      <path d="M50 48 Q18 28 5 42 Q20 54 50 55Z" fill="#ffaa00" opacity="0.6" />
      <path
        d="M50 48 Q82 28 95 42 Q80 54 50 55Z"
        fill="#ffc200"
        opacity="0.6"
      />

      {/* Body */}
      <ellipse cx="50" cy="58" rx="12" ry="18" fill="#cc3300" />
      <ellipse cx="50" cy="55" rx="9" ry="14" fill="#ff5500" />

      {/* Head */}
      <circle cx="50" cy="38" r="11" fill="#cc3300" />
      <circle cx="50" cy="37" r="9" fill="#ff4400" />

      {/* Crest */}
      <path d="M50 27 Q44 16 47 10 Q50 18 50 18Z" fill="#ff8c00" />
      <path d="M50 27 Q56 16 53 10 Q50 18 50 18Z" fill="#ffaa00" />
      <path
        d="M50 27 Q50 14 50 8"
        stroke="#ffc200"
        strokeWidth="2"
        fill="none"
      />

      {/* Eyes */}
      <circle cx="45" cy="36" r="2.5" fill="#1a0000" />
      <circle cx="55" cy="36" r="2.5" fill="#1a0000" />
      <circle cx="44.5" cy="35.5" r="0.8" fill="white" />
      <circle cx="54.5" cy="35.5" r="0.8" fill="white" />

      {/* Beak */}
      <path d="M48 41 L52 41 L50 45Z" fill="#ffc200" />

      {/* Glow aura */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="#ff6b00"
        strokeWidth="2"
        opacity="0.2"
        style={{ animation: "flicker 1.5s ease-in-out infinite" }}
      />
    </svg>
  );
}
