

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Icon */}
            <div className="relative flex items-center justify-center w-10 h-10">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md"></div>

                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
                    {/* Circle */}
                    <circle cx="20" cy="20" r="16" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />

                    {/* Arrow pointing left (Back) */}
                    <path d="M24 20H14M14 20L19 15M14 20L19 25" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                </svg>
            </div>

            {/* Text */}
            {showText && (
                <span className="font-bold text-2xl tracking-tight text-white">
                    Trace<span className="text-cyan-400">Back</span>
                </span>
            )}
        </div>
    );
}
