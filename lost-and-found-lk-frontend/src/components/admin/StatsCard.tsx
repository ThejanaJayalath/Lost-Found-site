import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    color: 'orange' | 'blue' | 'purple' | 'green';
}

export default function StatsCard({ title, value, icon, trend, color }: StatsCardProps) {
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

            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorStyles[color]} bg-opacity-10 ${textColors[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trend.value}%
                    </div>
                )}
            </div>

            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <div className="text-3xl font-bold text-white">{value}</div>
        </div>
    );
}
