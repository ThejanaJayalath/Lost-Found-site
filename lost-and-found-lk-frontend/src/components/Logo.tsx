

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Logo Image */}
            <div className="relative flex items-center justify-center">
                <img 
                    src="/logo.png" 
                    alt="TraceBack Logo" 
                    className="h-10 w-auto object-contain"
                />
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
