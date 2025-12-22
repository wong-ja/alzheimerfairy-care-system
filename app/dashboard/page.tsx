import { createClient } from '@/utils/supabase/server';
import { Brain, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import PredictionGauge from '../../components/PredictionGauge';

function getRiskColor(risk: string) {
    if (risk === 'Low') return 'text-emerald-500';
    if (risk === 'Moderate') return 'text-amber-500';
    return 'text-red-600';
}

function calculateAvg(logs: any[] | null, key: string) {
    if (!logs || logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + (log[key] || 0), 0);
    return (sum / logs.length).toFixed(1);
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string | number }) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: logs } = await supabase
        .from('wellness_logs')
        .select('*')
        .order('checkin_date', { ascending: true });

    let prediction = { 
        predicted_severity: 5, 
        risk_level: 'Low', 
        recommendation: 'Loading...' 
    };

    if (logs && logs.length >= 1) {
        try {
            const res = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logs),
            });
            prediction = await res.json();
        } catch (e) {
            console.error("Flask API not reachable. Is it running on port 5000?");
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
            <header>
                <h1 className="text-4xl font-black text-slate-900">Health Insights</h1>
                <p className="text-slate-500">ML-powered analysis of daily care logs.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* gauge */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-6 left-8 flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-widest">
                        <Brain size={16} /> 
                        AI Prediction
                    </div>
                    
                    <PredictionGauge value={prediction.predicted_severity} />
                    
                    <div className="text-center mt-4">
                        <h3 className="text-2xl font-black text-slate-800">
                        Next-Day Risk: <span className={getRiskColor(prediction.risk_level)}>{prediction.risk_level}</span>
                        </h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto italic">
                        &ldquo;{prediction.recommendation}&rdquo;
                        </p>
                    </div>
                </div>

                {/* stats */}
                <div className="space-y-6">
                    <StatCard 
                        icon={<Activity className="text-emerald-500" />} 
                        label="Avg Exercise" 
                        value={`${calculateAvg(logs, 'exercise_mins')}m`} 
                    />
                    <StatCard 
                        icon={<TrendingUp className="text-blue-500" />} 
                        label="Avg Severity" 
                        value={calculateAvg(logs, 'severity_rating')} 
                    />
                    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl">
                        <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                            <AlertCircle size={18} /> 
                            Emergency Alerts
                        </div>
                        <p className="text-3xl font-black text-red-700">
                            {logs?.filter(l => l.is_emergency).length || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
