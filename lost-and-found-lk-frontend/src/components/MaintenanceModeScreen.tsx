export default function MaintenanceModeScreen() {
  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex items-center justify-center z-50">
      <div className="text-center px-4 max-w-md">
        {/* Animated Gear Container */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative gear-container" style={{ width: '200px', height: '200px' }}>
            {/* Glow Effect Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pulse-glow"></div>
            </div>
            
            {/* Large Central Gear */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 gear-main">
              <GearIcon size={120} color="#f97316" />
            </div>
            
            {/* Small Gear Top-Left */}
            <div className="absolute top-0 left-0 gear-small-1">
              <GearIcon size={70} color="#fb923c" />
            </div>
            
            {/* Small Gear Bottom-Right */}
            <div className="absolute bottom-0 right-0 gear-small-2">
              <GearIcon size={70} color="#fb923c" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 fade-in-up">
          Maintenance Mode
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-2 fade-in-up-delay-1">
          We're currently performing maintenance
        </p>
        <p className="text-sm md:text-base text-gray-500 fade-in-up-delay-2">
          The site will be back online shortly. Thank you for your patience.
        </p>

        {/* Loading Dots */}
        <div className="mt-8 flex justify-center fade-in-up-delay-3">
          <div className="flex gap-2">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        .gear-container {
          position: relative;
        }

        .gear-main {
          animation: gearSpinMain 3s linear infinite;
          filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.6));
          transform-origin: center center;
        }

        .gear-small-1 {
          animation: gearSpinSmall1 2s linear infinite;
          filter: drop-shadow(0 0 8px rgba(251, 146, 60, 0.5));
          transform-origin: center center;
        }

        .gear-small-2 {
          animation: gearSpinSmall2 2s linear infinite;
          filter: drop-shadow(0 0 8px rgba(251, 146, 60, 0.5));
          transform-origin: center center;
        }

        @keyframes gearSpinMain {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes gearSpinSmall1 {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes gearSpinSmall2 {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        .pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        .dot {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #f97316, #fb923c);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.6);
        }

        .dot-1 {
          animation: dotBounce 1.4s ease-in-out infinite;
          animation-delay: 0s;
        }

        .dot-2 {
          animation: dotBounce 1.4s ease-in-out infinite;
          animation-delay: 0.2s;
        }

        .dot-3 {
          animation: dotBounce 1.4s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          40% {
            transform: translateY(-12px) scale(1.2);
            opacity: 1;
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .fade-in-up-delay-1 {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .fade-in-up-delay-2 {
          animation: fadeInUp 0.6s ease-out 0.4s both;
        }

        .fade-in-up-delay-3 {
          animation: fadeInUp 0.6s ease-out 0.6s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Gear Icon Component - SVG Gear Shape
function GearIcon({ size, color }: { size: number; color: string }) {
  const center = size / 2;
  const radius = size * 0.35;
  const innerRadius = size * 0.15;
  const teeth = 12;
  const toothLength = size * 0.1;
  
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i * Math.PI) / teeth;
    const r = i % 2 === 0 ? radius : radius + toothLength;
    const x = center + r * Math.cos(angle - Math.PI / 2);
    const y = center + r * Math.sin(angle - Math.PI / 2);
    points.push(`${x},${y}`);
  }
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer gear shape */}
      <polygon
        points={points.join(' ')}
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
      {/* Inner circle */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="#0f0f0f"
        stroke={color}
        strokeWidth="2"
      />
      {/* Center dot */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius * 0.4}
        fill={color}
      />
    </svg>
  );
}
