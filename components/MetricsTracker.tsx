"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WellnessLog } from '@/types/database';

interface CustomDotProps {
    cx?: number;
    cy?: number;
    value?: number;
    payload?: WellnessLog;
}

export default function MetricsTracker({ logs }: { logs: WellnessLog[] }) {
    const renderCustomDot = (props: CustomDotProps) => {
        const { cx, cy, value } = props;
        if (cx === undefined || cy === undefined || value === undefined) return null;
        
        let dotColor = '#10b981'; // low severity
        if (value > 3 && value <= 7) dotColor = '#f59e0b'; // moderate
        if (value > 7) dotColor = '#ef4444'; // high

        return (
            <circle 
                key={`dot-${cx}-${cy}`}
                cx={cx} 
                cy={cy} 
                r={5} 
                fill={dotColor} 
                stroke="white" 
                strokeWidth={2} 
            />
        );
    };

    return (
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm w-full h-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                    Health Trends
                </h3>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-slate-500 outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>

            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={logs} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    
                    <XAxis 
                        dataKey="checkin_date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} 
                        tickFormatter={(str) => str.split('-')[2]}
                    />
                    
                    <YAxis 
                        domain={[0, 10]}
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} 
                    />
                    
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: '1px solid #e2e8f0', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    />
                    
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                    
                    <Line 
                        type="monotone" 
                        dataKey="severity_rating" 
                        stroke="#cbd5e1" 
                        strokeWidth={2} 
                        dot={renderCustomDot} 
                        activeDot={(props: CustomDotProps) => {
                            const { cx, cy, value } = props;
                            if (cx === undefined || cy === undefined || value === undefined) return <circle />;
                            let dotColor = '#10b981'; 
                            if (value > 3 && value <= 7) dotColor = '#f59e0b';
                            if (value > 7) dotColor = '#ef4444';
                            return (
                                <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={7} 
                                    fill={dotColor} 
                                    stroke="white" 
                                    strokeWidth={3} 
                                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                                />
                            );
                        }}
                        name="Severity"
                    />
                    
                    <Line 
                        type="monotone" 
                        dataKey="exercise_mins" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                        name="Exercise (mins)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}