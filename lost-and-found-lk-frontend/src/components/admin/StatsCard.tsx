import React from 'react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'orange' | 'blue' | 'purple' | 'green';
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
    const colorStyles = {
        orange: 'bg-orange-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-green-500',
    };

    const textColors = {
        orange: 'text-orange-500',
        blue: 'text-blue-500',
        purple: 'text-purple-500',
        green: 'text-green-500',
    };



    return (
        <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-colors">
            {/* Decorative bottom bar */}
            <div className={`absolute bottom-0 left-0 h-1 w-1/3 ${colorStyles[color]} rounded-tr-full`}></div>

            <div className="flex justify-between items-start mb-2">
                <div className="text-4xl font-bold text-white">{value}</div>
                <div className={`p-3 rounded-xl ${colorStyles[color]} bg-opacity-10 ${textColors[color]}`}>
                    {icon}
                </div>
            </div>

            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        </div>
    );
}
