import { CheckCircle } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#FDFDF5] flex flex-col">
            <main className="flex-1 flex items-center justify-center px-8 py-12">
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <div className="border-4 border-blue-400 p-8 inline-block relative">
                            <h1 className="text-6xl font-bold text-gray-900 leading-tight">
                                Find &<br />
                                Recover<br />
                                <span className="text-green-700">With Ease</span>
                            </h1>
                            <p className="mt-4 text-gray-600 font-medium max-w-md">
                                Experience effortless recovery with our dedicated lost and found service.
                            </p>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex flex-col gap-6 items-center md:items-start">
                        <div className="flex flex-col gap-4 w-full max-w-xs">
                            <button className="flex items-center justify-between bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg transition-transform hover:scale-105 cursor-pointer">
                                <span className="text-2xl font-bold">Lost</span>
                                <span className="text-3xl">📦</span>
                            </button>
                            <button className="flex items-center justify-between bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg transition-transform hover:scale-105 cursor-pointer">
                                <span className="text-2xl font-bold">Found</span>
                                <CheckCircle size={32} />
                            </button>
                        </div>

                        {/* Image Collage Placeholder */}
                        <div className="relative mt-8 w-full max-w-md h-64">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-gray-800 rounded-lg shadow-xl overflow-hidden z-10 transform -rotate-3">
                                <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80" alt="Laptop" className="w-full h-full object-cover opacity-80" />
                            </div>
                            <div className="absolute top-8 left-24 w-32 h-48 bg-gray-700 rounded-lg shadow-xl overflow-hidden z-20 transform rotate-2 border-2 border-white">
                                <img src="https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80" alt="Phone" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-40 h-32 bg-gray-600 rounded-lg shadow-xl overflow-hidden z-0 transform rotate-6">
                                <img src="https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=300&q=80" alt="Compass" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
