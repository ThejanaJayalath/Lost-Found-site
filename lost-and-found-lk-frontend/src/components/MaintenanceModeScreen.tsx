import { Wrench } from 'lucide-react';

export default function MaintenanceModeScreen() {
  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex items-center justify-center z-50">
      <div className="text-center px-4 max-w-md">
        {/* Animated Gear */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative">
            {/* Large Gear */}
            <Wrench 
              size={120} 
              className="text-orange-500 animate-spin-slow"
              style={{
                animation: 'spin 3s linear infinite'
              }}
            />
            {/* Small Gear Overlay */}
            <Wrench 
              size={60} 
              className="text-orange-400 absolute -top-2 -right-2 animate-spin-reverse"
              style={{
                animation: 'spinReverse 2s linear infinite'
              }}
            />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Maintenance Mode
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-2">
          We're currently performing maintenance
        </p>
        <p className="text-sm md:text-base text-gray-500">
          The site will be back online shortly. Thank you for your patience.
        </p>

        {/* Pulsing Dot */}
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spinReverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

