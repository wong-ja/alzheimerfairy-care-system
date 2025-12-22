import { createClient } from '@/utils/supabase/server';
import { Brain, Activity, AlertCircle, Smile, ClipboardList } from 'lucide-react';
import PredictionGauge from '../../components/PredictionGauge';
import MetricsTracker from '../../components/MetricsTracker';
import { WellnessLog } from '../../types/database';

function getRiskColor(risk: string) {
    if (risk === 'Low') return 'text-emerald-500';
    if (risk === 'Moderate') return 'text-amber-500';
    return 'text-red-600';
}

function calculateAvg(logs: WellnessLog[] | null, key: string) {
    if (!logs || logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + (Number(log[key as keyof WellnessLog]) || 0), 0);
    return (sum / logs.length).toFixed(1);
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string | number, subtext?: string }) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center gap-4 transition-hover hover:border-blue-200">
            <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                {subtext && <p className="text-[10px] text-slate-400 font-medium">{subtext}</p>}
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
        recommendation: 'Recording more data will improve accuracy...' 
    };

    // backend prediction Logic
    if (logs && logs.length >= 1) {
        try {
            const res = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logs),
            });
            if (res.ok) prediction = await res.json();
        } catch (e) {
            console.error("ML API Offline", e);
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <header>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health Insights</h1>
                    <p className="text-slate-500 font-medium">AI-powered analysis of daily care logs.</p>
                </header>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* condition prediction */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-4xl p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-6 left-8 flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-[0.2em]">
                        <Brain size={14} className="animate-pulse" /> 
                        AI Prediction Model
                    </div>
                    
                    <PredictionGauge value={prediction.predicted_severity} />
                    
                    <div className="text-center mt-6">
                        <h3 className="text-2xl font-black text-slate-800">
                            Tomorrow&apos;s Risk: <span className={getRiskColor(prediction.risk_level)}>{prediction.risk_level}</span>
                        </h3>
                        <div className="mt-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-slate-600 text-sm leading-relaxed">
                                &ldquo;{prediction.recommendation}&rdquo;
                            </p>
                        </div>
                    </div>
                </div>

                {/* metrics */}
                <div className="grid grid-cols-1 gap-4">
                    <StatCard 
                        icon={<Smile className="text-amber-500" />} 
                        label="Avg Mood" 
                        value={`${calculateAvg(logs, 'mood_rating')}/10`}
                        subtext="Based on last 30 entries"
                    />
                    <StatCard 
                        icon={<Activity className="text-emerald-500" />} 
                        label="Agitation Level" 
                        value={calculateAvg(logs, 'agitation_level')}
                        subtext="Lower is better"
                    />
                    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm"><AlertCircle className="text-red-600" /></div>
                        <div>
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Incidents</p>
                            <p className="text-2xl font-black text-red-700">
                                {logs?.filter(l => l.is_emergency).length || 0}
                            </p>
                            <p className="text-[10px] text-red-400 font-medium">Emergencies this month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* trends */}
            <div className="bg-white border border-slate-200 rounded-4xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-8">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <ClipboardList size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Long-term Trends</h2>
                </div>
                <div className="h-100">
                    {logs && <MetricsTracker logs={logs} />}
                </div>
            </div>

            <p className="text-center text-slate-400 text-xs font-medium">
                Predictions are generated via Random Forest Regression. Consult a medical professional for clinical decisions.
            </p>
        </div>
    );
}