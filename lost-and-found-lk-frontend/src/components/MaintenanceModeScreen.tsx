import { Wrench } from 'lucide-react';

export default function MaintenanceModeScreen() {
  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex items-center justify-center z-50">
      <div className="text-center px-4 max-w-md">
        {/* Animated Gear Container */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative gear-container">
            {/* Glow Effect Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pulse-glow"></div>
            </div>
            
            {/* Large Gear */}
            <div className="relative gear-main">
              <Wrench 
                size={120} 
                className="text-orange-500"
              />
            </div>
            
            {/* Small Gear Overlay */}
            <div className="absolute -top-1 -right-1 gear-small">
              <Wrench 
                size={60} 
                className="text-orange-400"
              />
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
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gear-main {
          animation: gearSpin 4s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.5));
        }

        .gear-small {
          animation: gearSpinReverse 3s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(251, 146, 60, 0.4));
        }

        @keyframes gearSpin {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(1.05);
          }
          50% {
            transform: rotate(180deg) scale(1);
          }
          75% {
            transform: rotate(270deg) scale(1.05);
          }
        }

        @keyframes gearSpinReverse {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-90deg) scale(1.08);
          }
          50% {
            transform: rotate(-180deg) scale(1);
          }
          75% {
            transform: rotate(-270deg) scale(1.08);
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

