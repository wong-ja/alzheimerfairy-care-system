"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
    { value: 3, color: '#10b981' },
    { value: 4, color: '#f59e0b' },
    { value: 3, color: '#dc2626' },
];

export default function PredictionGauge({ value }: { value: number }) {
    const needleAngle = ((value - 1) / 9) * 180 - 90;

    return (
        <div className="w-full h-64 relative flex justify-center items-end overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="80%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            <div className="absolute bottom-0 w-1.5 h-32 bg-slate-800 origin-bottom transition-all duration-1000 ease-out rounded-full z-20"
                style={{ transform: `rotate(${needleAngle}deg)` }}
            />
            <div className="absolute bottom-2.5 w-8 h-8 bg-slate-800 rounded-full border-4 border-white shadow-lg z-30" />
        </div>
    );
}