
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface ActivityChartProps {
    data: { name: string; lost: number; found: number; resolved: number }[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1c1c1c] border border-gray-800 p-4 rounded-xl shadow-xl">
                    <p className="text-gray-400 text-sm mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm font-bold" style={{ color: entry.color }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            {entry.name}: {entry.value}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800 h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Activity Overview</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Lost
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Found
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Resolved
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="lost"
                        stroke="#F97316"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorLost)"
                    />
                    <Area
                        type="monotone"
                        dataKey="found"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorFound)"
                    />
                    <Area
                        type="monotone"
                        dataKey="resolved"
                        stroke="#22C55E"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorResolved)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
